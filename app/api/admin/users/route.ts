import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  email: z
    .string()
    .email("Correo inválido")
    .transform((value) => value.trim().toLowerCase()),
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => (value === "" ? null : (value ?? null))),
  role: z.enum(["ADMIN", "TRAINER", "CLIENT"]).optional().default("CLIENT"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.passwordHash),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { email, name, phone, role, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese correo" },
      { status: 400 },
    );
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const user = await db.user.create({
    data: {
      email,
      name,
      phone,
      role,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}
