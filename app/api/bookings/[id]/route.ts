import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido" }, { status: 400 });
  }

  const status =
    typeof json === "object" && json !== null && "status" in json
      ? (json as { status?: string }).status
      : undefined;

  if (status !== "CANCELLED") {
    return NextResponse.json(
      { error: "Estado invalido. Solo se permite CANCELLED" },
      { status: 400 },
    );
  }

  const existingBooking = await db.booking.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!existingBooking) {
    return NextResponse.json(
      { error: "Reserva no encontrada" },
      { status: 404 },
    );
  }

  if (existingBooking.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (existingBooking.status === "CANCELLED") {
    return NextResponse.json({ booking: existingBooking });
  }

  const booking = await db.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ booking });
}
