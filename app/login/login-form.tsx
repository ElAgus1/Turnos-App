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
  const [showContactForm, setShowContactForm] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

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

  const emailTemplate = `Asunto: Solicitud de acceso a sistema de reserva de turnos

Hola,

Quiero solicitar acceso a la plataforma de reserva de turnos del gimnasio.

Mis datos son:
- Nombre Completo: [Tu nombre completo aquí]
- Correo Electrónico: [Tu correo aquí]
- Teléfono: [Tu teléfono aquí]

Quedo a la espera de tu confirmación.

Saludos`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTemplate);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setResetLink(null);

    if (!forgotEmail.trim()) {
      setForgotError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    try {
      setForgotLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setForgotError(data.error || "No se pudo procesar la solicitud.");
      } else {
        setForgotSuccess(
          data.message ||
            "Si la cuenta existe, se envió un correo para restablecer la contraseña.",
        );
        if (data.resetUrl) {
          setResetLink(data.resetUrl);
        }
      }
    } catch (err) {
      setForgotError(
        "Ocurrió un error inesperado. Intenta de nuevo más tarde.",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgotPasswordForm) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-400 text-black font-black text-2xl tracking-tighter mb-3 shadow-lg shadow-amber-400/20">
            FIT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Recuperar Contraseña
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ingresá tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        <div className="space-y-5">
          {forgotError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm text-center">
              {forgotSuccess}
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="ejemplo@gimnasio.com"
                disabled={forgotLoading}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Usá el correo con el que te registraste en el sistema.
              </p>
            </div>

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold tracking-wide shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {forgotLoading
                ? "Enviando enlace..."
                : "Enviar enlace de recuperación"}
            </button>
          </form>

          {resetLink && (
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Enlace de prueba
              </p>
              <p className="text-sm text-zinc-300 break-all">{resetLink}</p>
            </div>
          )}

          <button
            onClick={() => {
              setShowForgotPasswordForm(false);
              setForgotEmail("");
              setForgotError(null);
              setForgotSuccess(null);
              setResetLink(null);
            }}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm border border-zinc-700 transition-all"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-400 text-black font-black text-2xl tracking-tighter mb-3 shadow-lg shadow-amber-400/20">
            FIT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Solicitar Acceso
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Contactá a la administración para crear tu cuenta
          </p>
        </div>

        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
              📧 Plantilla de Correo
            </p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 font-mono whitespace-pre-wrap break-words mb-3 max-h-64 overflow-y-auto">
              {emailTemplate}
            </div>
            <button
              onClick={handleCopyEmail}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                copiedToClipboard
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-400 hover:bg-amber-300 text-zinc-950"
              }`}
            >
              {copiedToClipboard
                ? "✓ Copiado a portapapeles"
                : "Copiar Plantilla"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Pasos a seguir:
            </p>
            <ol className="text-xs text-zinc-300 space-y-2">
              <li>1. Haz clic en "Copiar Plantilla"</li>
              <li>2. Abre tu cliente de correo</li>
              <li>
                3. Envía un email a:{" "}
                <span className="text-amber-400 font-medium">
                  agustindavila637@gmail.com
                </span>
              </li>
              <li>4. Pega la plantilla y completa tus datos</li>
              <li>5. Espera confirmación de la administración</li>
            </ol>
          </div>

          <button
            onClick={() => setShowContactForm(false)}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm border border-zinc-700 transition-all"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={() => setShowForgotPasswordForm(true)}
              className="text-xs text-amber-400 hover:underline hover:text-amber-300 transition-colors"
            >
              ¿La olvidaste?
            </button>
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
          <button
            type="button"
            onClick={() => setShowContactForm(true)}
            className="text-amber-400 font-medium hover:underline hover:text-amber-300 transition-colors"
          >
            Contactá a la administración
          </button>
        </p>
      </div>
    </div>
  );
}
