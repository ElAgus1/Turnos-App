import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const activities = await db.activity.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const trainers = await db.user.findMany({
      where: { role: "TRAINER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ activities, trainers });
  } catch (error) {
    console.error("Error fetching class form data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de configuracion" },
      { status: 500 },
    );
  }
}
