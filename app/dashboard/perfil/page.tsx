import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Sidebar from "../sidebar";
import PerfilForm from "./perfil-form";
import { ProfileImageSection } from "@/components/profile-image-section";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
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
            <ProfileImageSection
              initialImage={user.profileImage}
              userName={user.name}
            />

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
