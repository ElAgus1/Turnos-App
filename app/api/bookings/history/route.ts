import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function getTomorrowUtcStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tomorrowUtcStart = getTomorrowUtcStart();

  const bookings = await db.booking.findMany({
    where: {
      userId: session.user.id,
      date: {
        lt: tomorrowUtcStart,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      class: {
        include: {
          activity: {
            select: {
              name: true,
            },
          },
          trainer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}
