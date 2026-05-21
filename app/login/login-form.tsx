"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales incorrectas. Intenta de nuevo.");
        setLoading(false);
      } else {
        setLoading(false);
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-2xl shadow-black/50">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-400 text-black font-black text-2xl tracking-tighter mb-3 shadow-lg shadow-amber-400/20">
          FIT
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          ¡Hola de nuevo!
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Ingresá tus credenciales para reservar tu turno
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@gimnasio.com"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
          />
        </div>

        {/* Campo Contraseña */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Contraseña
            </label>
            <a
              href="#"
              className="text-xs text-amber-400 hover:underline hover:text-amber-300 transition-colors"
            >
              ¿La olvidaste?
            </a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
          />
        </div>

        {/* Botón de Entrada */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 mt-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold tracking-wide shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-zinc-950"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      {/* Pie de página decorativo */}
      <div className="text-center mt-8 pt-6 border-t border-zinc-800/60">
        <p className="text-xs text-zinc-500">
          ¿No tenés cuenta todavía?{" "}
          <a
            href="#"
            className="text-amber-400 font-medium hover:underline hover:text-amber-300 transition-colors"
          >
            Contactá a la administración
          </a>
        </p>
      </div>
    </div>
  );
}
