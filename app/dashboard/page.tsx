import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Sidebar from "./sidebar"; // Importamos tu nuevo Sidebar
import { AttendanceHistory } from "@/components/attendance-history";

function getTodayUtcStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || "Usuario";
  const userRole = session.user?.role || "CLIENT";
  const todayUtcStart = getTodayUtcStart();

  // Consultas dinámicas a Neon usando Prisma
  const totalActivities = await db.activity.count();
  const totalClasses = await db.class.count();
  const userBookingsCount = await db.booking.count({
    where: {
      userId: session.user.id,
      status: "CONFIRMED",
      date: {
        gte: todayUtcStart,
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-row relative overflow-hidden">
      {/* 1. BARRA LATERAL (SIDEBAR) */}
      <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />

      {/* 2. CONTENIDO PRINCIPAL (Derecha) */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        {/* Luces de fondo estéticas */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-10">
          {/* SALUDO DE BIENVENIDA (Tal como figura en tu captura) */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl flex items-center gap-2">
              ¡Hola, {userName.split(" ")[0]}! 👋
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              Acá tenés el estado actual de tus actividades y reservas para el
              día de hoy.
            </p>
          </div>

          {/* GRILLA DE TARJETAS DE ESTADÍSTICAS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tarjeta 1: Clases en Grilla */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                CLASES EN GRILLA
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {totalClasses}
                </span>
                <span className="text-xs text-zinc-400">bloques horarios</span>
              </div>
              <p className="text-xs text-zinc-400 mt-4 border-t border-zinc-800/60 pt-3">
                Disciplinas activas en simultáneo:{" "}
                <span className="text-amber-400 font-medium">
                  {totalActivities}
                </span>
              </p>
            </div>

            {/* Tarjeta 2: Mis Turnos Activos */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                MIS TURNOS ACTIVOS
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold tracking-tight text-amber-400">
                  {userBookingsCount}
                </span>
                <span className="text-xs text-zinc-400">
                  reservas agendadas
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-4 border-t border-zinc-800/60 pt-3">
                Sujeto al límite de cancelación de tu plan.
              </p>
            </div>

            {/* Tarjeta 3: Estado del Pase */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                ESTADO DEL PASE
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold tracking-tight text-emerald-400 uppercase">
                  ACTIVO LIBRE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-6 border-t border-zinc-800/60 pt-3">
                Vencimiento general:{" "}
                <span className="text-zinc-200 font-medium">
                  15 de Junio, 2026
                </span>
              </p>
            </div>
          </div>

          {/* SECCIÓN INFERIOR: CONTENEDOR DINÁMICO */}
          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-900 p-8 text-center backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Sección de Turnos Disponibles
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              El motor de datos está listo. En el siguiente paso vamos a
              incrustar el listado dinámico de las clases de{" "}
              <span className="text-amber-400">CrossFit y Funcional</span>{" "}
              usando un mapeo directo de tu base de datos relacional.
            </p>

            <AttendanceHistory />
          </div>
        </main>
      </div>
    </div>
  );
}
