import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Esquema de validación para crear una clase
const classSchema = z.object({
  activityId: z.string().min(1, "La actividad es requerida"),
  trainerId: z.string().min(1, "El entrenador es requerido"),
  dayOfWeek: z.number().min(0).max(6), // 0=Domingo, 1=Lunes...
  classDate: z.string().optional(),
  startTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora de inicio inválido (HH:MM)",
    ),
  endTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora de fin inválido (HH:MM)",
    ),
  capacity: z.number().min(1, "La capacidad debe ser al menos 1"),
});

// GET: Listar todas las clases o filtrar por día de la semana
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dayOfWeekParam = searchParams.get("dayOfWeek");
  const dateParam = searchParams.get("date");

  const whereClause: any = {};

  if (dateParam) {
    const selectedDate = new Date(`${dateParam}T00:00:00.000Z`);
    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const nextDate = new Date(selectedDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    whereClause.OR = [
      {
        classDate: {
          gte: selectedDate,
          lt: nextDate,
        },
      },
      {
        classDate: null,
        dayOfWeek:
          dayOfWeekParam !== null
            ? parseInt(dayOfWeekParam, 10)
            : selectedDate.getUTCDay(),
      },
    ];
  } else if (dayOfWeekParam !== null) {
    whereClause.dayOfWeek = parseInt(dayOfWeekParam, 10);
  }

  try {
    const classes = await db.class.findMany({
      where: whereClause,
      include: {
        activity: true,
        trainer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ classDate: "asc" }, { startTime: "asc" }],
    });

    if (!dateParam) {
      return NextResponse.json({ classes });
    }

    const selectedDate = new Date(`${dateParam}T00:00:00.000Z`);
    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    const bookingCounts = await db.booking.groupBy({
      by: ["classId"],
      where: {
        classId: { in: classes.map((classItem) => classItem.id) },
        date: selectedDate,
        status: { not: "CANCELLED" },
      },
      _count: {
        id: true,
      },
    });

    const bookingsByClassId = new Map(
      bookingCounts.map((entry) => [entry.classId, entry._count.id]),
    );

    const classesWithAvailability = classes.map((classItem) => {
      const bookedSpots = bookingsByClassId.get(classItem.id) ?? 0;
      const availableSpots = Math.max(classItem.capacity - bookedSpots, 0);

      return {
        ...classItem,
        bookedSpots,
        availableSpots,
      };
    });

    return NextResponse.json({ classes: classesWithAvailability });
  } catch (error) {
    console.error("Error al obtener clases:", error);
    return NextResponse.json(
      {
        error: "Error al obtener las clases",
        details:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}

// POST: Crear una nueva clase (Solo ADMIN)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Verificar que esté autenticado y sea ADMIN
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado. Se requieren permisos de administrador." },
      { status: 403 },
    );
  }

  try {
    const json = await request.json();
    const parsed = classSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const {
      activityId,
      trainerId,
      dayOfWeek,
      classDate,
      startTime,
      endTime,
      capacity,
    } = parsed.data;

    let parsedClassDate: Date | null = null;
    let resolvedDayOfWeek = dayOfWeek;

    if (classDate) {
      parsedClassDate = new Date(`${classDate}T00:00:00.000Z`);
      if (Number.isNaN(parsedClassDate.getTime())) {
        return NextResponse.json(
          { error: "Fecha de clase inválida" },
          { status: 400 },
        );
      }
      resolvedDayOfWeek = parsedClassDate.getUTCDay();
    }

    // Crear la clase en la base de datos
    const newClass = await db.class.create({
      data: {
        activityId,
        trainerId,
        dayOfWeek: resolvedDayOfWeek,
        classDate: parsedClassDate,
        startTime,
        endTime,
        capacity,
      },
    });

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error("Error al crear clase:", error);
    return NextResponse.json(
      { error: "No se pudo crear la clase" },
      { status: 500 },
    );
  }
}

// PUT: Editar una clase (Solo ADMIN)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  // Verificar que esté autenticado y sea ADMIN
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado. Se requieren permisos de administrador." },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("id");

    if (!classId) {
      return NextResponse.json(
        { error: "ID de clase es requerido" },
        { status: 400 },
      );
    }

    const json = await request.json();
    const parsed = classSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const {
      activityId,
      trainerId,
      dayOfWeek,
      classDate,
      startTime,
      endTime,
      capacity,
    } = parsed.data;

    let parsedClassDate: Date | null = null;
    let resolvedDayOfWeek = dayOfWeek;

    if (classDate) {
      parsedClassDate = new Date(`${classDate}T00:00:00.000Z`);
      if (Number.isNaN(parsedClassDate.getTime())) {
        return NextResponse.json(
          { error: "Fecha de clase inválida" },
          { status: 400 },
        );
      }
      resolvedDayOfWeek = parsedClassDate.getUTCDay();
    }

    // Verificar que la clase existe
    const existingClass = await db.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 },
      );
    }

    // Actualizar la clase
    const updatedClass = await db.class.update({
      where: { id: classId },
      data: {
        activityId,
        trainerId,
        dayOfWeek: resolvedDayOfWeek,
        classDate: parsedClassDate,
        startTime,
        endTime,
        capacity,
      },
      include: {
        activity: true,
        trainer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    console.error("Error al editar clase:", error);
    return NextResponse.json(
      { error: "No se pudo editar la clase" },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar una clase (Solo ADMIN)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  // Verificar que esté autenticado y sea ADMIN
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado. Se requieren permisos de administrador." },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("id");

    if (!classId) {
      return NextResponse.json(
        { error: "ID de clase es requerido" },
        { status: 400 },
      );
    }

    // Verificar que la clase existe
    const existingClass = await db.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 },
      );
    }

    // Eliminar la clase (onDelete: Cascade eliminará las reservas asociadas)
    await db.class.delete({
      where: { id: classId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar clase:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la clase" },
      { status: 500 },
    );
  }
}
