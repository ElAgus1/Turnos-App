import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  // Verificamos si el usuario ya está logueado para cambiar el botón de acción
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans relative overflow-hidden selection:bg-amber-400 selection:text-zinc-950">
      {/* Luces de fondo (Glows radiales estilo Premium) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Patrón de grilla de fondo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* 1. NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400 text-zinc-950 font-black tracking-tighter text-base shadow-md shadow-amber-400/20">
              FIT
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              POWERGYM
            </span>
          </div>

          {/* Menú de Navegación de la Landing */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a
              href="#inicio"
              className="hover:text-amber-400 transition-colors"
            >
              Inicio
            </a>
            <a
              href="#como-funciona"
              className="hover:text-amber-400 transition-colors"
            >
              Cómo funciona
            </a>
            <a
              href="#nosotros"
              className="hover:text-amber-400 transition-colors"
            >
              Sobre Nosotros
            </a>
          </nav>

          <div>
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-bold rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-850 transition-all"
              >
                Ir al Panel
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-bold rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md shadow-amber-400/10 transition-all"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="inicio"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center lg:pt-36 scroll-mt-24"
      >
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-6 inline-block">
          Tu entrenamiento, bajo control
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-none">
          Entrená a tu ritmo, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            reservá tu turno en segundos.
          </span>
        </h1>
        <p className="mt-6 text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg">
          Olvidate de las filas y los cupos llenos. Accedé a nuestra plataforma
          integrada para gestionar tus clases de CrossFit, Funcional y más desde
          cualquier dispositivo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="px-8 py-4 rounded-xl bg-amber-400 text-zinc-950 font-bold tracking-wide hover:bg-amber-300 shadow-xl shadow-amber-400/10 transition-all text-center"
          >
            {session ? "Ir a mi Panel" : "Reservar un Turno"}
          </Link>
          <a
            href="#como-funciona"
            className="px-8 py-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-900 hover:text-white backdrop-blur-xl transition-all text-center"
          >
            Ver cómo funciona
          </a>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section
        id="como-funciona"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900/80 scroll-mt-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Reservar es muy simple
          </h2>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Diseñamos un flujo ágil para que tu única preocupación sea romper
            tus marcas personales en el box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Paso 1 */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl relative">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Iniciá Sesión</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Ingresá de manera segura con tu correo registrado. Tu cuenta ya
              posee el plan asignado por la administración.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl relative">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Elegí tu Actividad
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explorá la grilla horaria integrada. Elegí entre CrossFit,
              Funcional o Pilates según los cupos disponibles en tiempo real.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl relative">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¡A Entrenar!</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Confirmá tu asistencia al instante. Podés cancelar o reprogramar
              tu turno desde tu perfil con total flexibilidad.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ABOUT US / SOBRE NOSOTROS */}
      <section
        id="nosotros"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900/80 bg-gradient-to-b from-transparent to-zinc-900/10 scroll-mt-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Sobre Nosotros
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white mt-2">
              Más que un gimnasio, somos una comunidad.
            </h2>
            <p className="text-zinc-400 mt-6 leading-relaxed text-sm sm:text-base">
              En POWERGYM, creemos que el entrenamiento físico es el pilar para
              transformar tu disciplina diaria. Nos dedicamos a equipar un
              espacio de alto rendimiento con entrenadores capacitados que te
              acompañan en cada repetición.
            </p>
            <p className="text-zinc-400 mt-4 leading-relaxed text-sm sm:text-base">
              Con esta nueva plataforma web, buscamos que tu experiencia sea
              premium desde antes de pisar el box, dándote visibilidad total de
              los horarios y asegurando que cada clase cuente con la
              infraestructura y espacio ideal para vos.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-zinc-900">
              <div>
                <p className="text-3xl font-extrabold text-white">100%</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                  Clases automatizadas
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-amber-400">+15</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                  Horarios diarios
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Visual Decorativa del Gimnasio */}
          <div className="relative p-8 rounded-3xl bg-zinc-900/40 border border-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-white mb-4">
              Nuestros Valores
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5">✔</span>
                <span className="text-sm text-zinc-300">
                  <strong className="text-white">Compromiso Real:</strong>{" "}
                  Profesores dedicados a corregir tu técnica y potenciar tu
                  rendimiento.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5">✔</span>
                <span className="text-sm text-zinc-300">
                  <strong className="text-white">Transparencia:</strong>{" "}
                  Visualizá cuántas personas van a ir a tu clase y reservá de
                  forma justa.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5">✔</span>
                <span className="text-sm text-zinc-300">
                  <strong className="text-white">Flexibilidad total:</strong>{" "}
                  Manejá tus pases y créditos mensuales de manera digital sin
                  intermediarios.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-600">
        <p>
          © {new Date().getFullYear()} POWERGYM Fit. Todos los derechos
          reservados.
        </p>
        <p className="mt-1 text-zinc-700">
          Proyecto de Gestión de Turnos Integrado con Prisma & Neon.
        </p>
      </footer>
    </div>
  );
}
