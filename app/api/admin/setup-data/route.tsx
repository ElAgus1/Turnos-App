import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const activities = await db.activity.findMany({
      select: { id: true, name: true },
    });
    const trainers = await db.user.findMany({
      where: { role: "TRAINER" },
      select: { id: true, name: true },
    });

    return NextResponse.json({ activities, trainers });
  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
