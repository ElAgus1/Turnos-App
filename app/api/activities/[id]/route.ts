import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { name, description, trainerId } = await request.json();
    const { id } = await params;

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

    // Verificar que existe la actividad
    const existing = await db.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 },
      );
    }

    // Verificar que no existe otra actividad con el mismo nombre
    if (name.trim() !== existing.name) {
      const duplicate = await db.activity.findUnique({
        where: { name: name.trim() },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Ya existe una actividad con ese nombre" },
          { status: 400 },
        );
      }
    }

    const activity = await db.activity.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        trainerId,
      },
      include: { trainer: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Error al actualizar actividad" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;

    // Verificar que existe la actividad
    const existing = await db.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 },
      );
    }

    // Verificar si hay clases asociadas
    const classesCount = await db.class.count({
      where: { activityId: id },
    });

    if (classesCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. Hay ${classesCount} clase(s) asociada(s) a esta actividad`,
        },
        { status: 400 },
      );
    }

    await db.activity.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Error al eliminar actividad" },
      { status: 500 },
    );
  }
}
