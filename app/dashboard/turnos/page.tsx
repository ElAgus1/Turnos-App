import { BookingList } from "@/components/booking-list";
import Sidebar from "../sidebar";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";

export default async function TurnosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user?.email || "";
  const userName = session.user?.name || "Usuario";
  const userRole = session.user?.role || "CLIENT";

  // Traer la imagen de perfil
  const user = await db.user.findUnique({
    where: { email: userEmail },
    select: { profileImage: true },
  });

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
            <div className="flex items-center gap-4 mb-4">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={userName}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/50"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-amber-400/50 flex items-center justify-center text-xl font-bold text-amber-400">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-400">Bienvenido</p>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {userName}
                </h2>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl flex items-center gap-2 mt-6">
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
