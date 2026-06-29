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

  const whereClause: any = {};
  if (dayOfWeekParam !== null) {
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
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las clases" },
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

    const { activityId, trainerId, dayOfWeek, startTime, endTime, capacity } =
      parsed.data;

    // Crear la clase en la base de datos
    const newClass = await db.class.create({
      data: {
        activityId,
        trainerId,
        dayOfWeek,
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
