import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Panel (ruta protegida)
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Solo llegás acá si el middleware encontró una sesión válida.
      </p>
      {session?.user ? (
        <p className="mt-4 text-sm text-zinc-800 dark:text-zinc-200">
          Hola, <span className="font-medium">{session.user.name}</span> — rol:{" "}
          <span className="font-mono">{session.user.role}</span>
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-zinc-700 underline dark:text-zinc-300"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
