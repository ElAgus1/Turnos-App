import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const activities = await db.activity.findMany({
      include: { trainer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { name, description, trainerId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }

    if (!trainerId) {
      return NextResponse.json(
        { error: "El entrenador es requerido" },
        { status: 400 },
      );
    }

    // Verificar que no existe una actividad con el mismo nombre
    const existing = await db.activity.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una actividad con ese nombre" },
        { status: 400 },
      );
    }

    const activity = await db.activity.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        trainerId,
      },
      include: { trainer: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Error al crear actividad" },
      { status: 500 },
    );
  }
}
