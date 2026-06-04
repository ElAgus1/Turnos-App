import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Sidebar from "../sidebar";
import PerfilForm from "./perfil-form";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  const userRole = user.role ?? session.user.role ?? "CLIENT";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-row relative overflow-hidden">
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        userRole={userRole}
      />

      <div className="flex-1 min-h-screen overflow-y-auto">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

        <main className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-8">
          <div className="border-b border-zinc-900 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Mi Perfil
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Gestioná tu información personal de forma directa sin salir de la
              pantalla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl h-fit text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                Foto de Perfil
              </p>

              <div className="relative w-32 h-32 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-4xl font-bold text-amber-400 shadow-xl overflow-hidden group">
                <span>{user.name.charAt(0).toUpperCase()}</span>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-zinc-200 transition-opacity cursor-pointer">
                  Cambiar Foto
                </div>
              </div>

              <button
                type="button"
                disabled
                className="mt-5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium text-xs w-full cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>

            <div className="md:col-span-2">
              <PerfilForm
                initialName={user.name}
                initialEmail={user.email}
                initialPhone={user.phone}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
