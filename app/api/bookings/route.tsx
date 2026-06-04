import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  classId: z.string().min(1, "classId es requerido"),
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Fecha inválida"),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
    include: {
      class: {
        include: {
          activity: true,
          trainer: true,
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

  const { classId, date } = parsed.data;
  const bookingDate = new Date(date);

  const classItem = await db.class.findUnique({
    where: { id: classId },
    select: { capacity: true },
  });

  if (!classItem) {
    return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
  }

  const activeBookings = await db.booking.count({
    where: {
      classId,
      date: bookingDate,
      status: { not: "CANCELLED" },
    },
  });

  if (activeBookings >= classItem.capacity) {
    return NextResponse.json({ error: "Clase llena" }, { status: 400 });
  }

  try {
    const booking = await db.booking.create({
      data: {
        classId,
        userId: session.user.id,
        date: bookingDate,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "Ya tenés una reserva para esta clase en esta fecha",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo crear la reserva" },
      { status: 500 },
    );
  }
}
