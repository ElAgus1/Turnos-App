import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
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
  role: z.enum(["ADMIN", "TRAINER", "CLIENT"]),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional(),
});

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  const { email, name, phone, role, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });

  if (!existingUser) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 },
    );
  }

  if (email !== existingUser.email) {
    const duplicateEmail = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (duplicateEmail) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 400 },
      );
    }
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

  const user = await db.user.update({
    where: { id },
    data: {
      email,
      name,
      phone,
      role,
      ...(passwordHash ? { passwordHash } : {}),
    },
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
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.passwordHash),
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "No podés eliminar tu propio usuario administrador" },
      { status: 400 },
    );
  }

  const existingUser = await db.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingUser) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 },
    );
  }

  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "No se pudo eliminar el usuario. Puede tener clases o relaciones activas.",
      },
      { status: 400 },
    );
  }
}
