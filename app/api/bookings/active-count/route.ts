import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function getTodayUtcStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const todayUtcStart = getTodayUtcStart();

  const activeCount = await db.booking.count({
    where: {
      userId: session.user.id,
      status: "CONFIRMED",
      date: {
        gte: todayUtcStart,
      },
    },
  });

  return NextResponse.json({ activeCount });
}
