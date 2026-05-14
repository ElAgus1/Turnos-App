import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Turnos — Gimnasio
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Proyecto de reservas con autenticación por email y contraseña.
        </p>

        <div className="mt-8 flex flex-col gap-3 text-sm">
          {session?.user ? (
            <>
              <p className="text-zinc-800 dark:text-zinc-200">
                Sesión:{" "}
                <span className="font-medium">{session.user.name}</span> (
                {session.user.email}) — rol:{" "}
                <span className="font-mono text-xs">{session.user.role}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex w-fit items-center rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Ir al panel
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="inline-flex w-fit items-center rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Cerrar sesión
                </Link>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex w-fit items-center rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ir al login
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
