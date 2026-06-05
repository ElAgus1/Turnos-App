import { BookingList } from "@/components/booking-list";
import Sidebar from "../sidebar";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TurnosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || "Usuario";
  const userRole = session.user?.role || "CLIENT";

  const totalClasses = await db.class.count();
  const activeBookings = await db.booking.count({
    where: { user: { email: userEmail } },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-row relative overflow-hidden">
      <Sidebar userName={userName} userEmail={userEmail} userRole={userRole} />

      <div className="flex-1 min-h-screen overflow-y-auto">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl flex items-center gap-2">
              Mis Turnos
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              Acá podés ver y gestionar tus reservas activas desde el dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Clases totales
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-white mt-3">
                {totalClasses}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Reservas activas
              </p>
              <p className="text-4xl font-extrabold tracking-tight text-amber-400 mt-3">
                {activeBookings}
              </p>
            </div>
          </div>

          <section className="rounded-2xl bg-zinc-900/40 border border-zinc-900 p-8 backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-4">Tus turnos</h3>
            <BookingList />
          </section>
        </main>
      </div>
    </div>
  );
}
