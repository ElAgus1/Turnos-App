"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SignOutButton from "./signout-button";

interface SidebarProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function Sidebar({
  userName,
  userEmail,
  userRole,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const getLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 py-2.5 rounded-xl font-medium text-sm transition-all w-full ${
      isOpen ? "px-4" : "justify-center px-0"
    } ${
      isActive
        ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
    }`;

  return (
    <div className="relative flex z-20">
      {/* BARRA LATERAL */}
      <aside
        className={`bg-zinc-900/40 border-r border-zinc-900 backdrop-blur-xl h-screen sticky top-0 flex flex-col justify-between p-4 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* CONTENIDO SUPERIOR */}
        <div className="space-y-8 w-full">
          {/* LOGO (Centrado dinámicamente) */}
          <div
            className={`flex items-center gap-2.5 ${isOpen ? "px-2" : "justify-center"}`}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400 text-zinc-950 font-black tracking-tighter text-base shadow-md shadow-amber-400/20 shrink-0">
              FIT
            </div>
            {isOpen && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent animate-fade-in">
                POWERGYM
              </span>
            )}
          </div>

          {/* NAVEGACIÓN */}
          <nav className="space-y-2 w-full">
            <p
              className={`text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 transition-all duration-200 ${isOpen ? "px-2" : "text-center"}`}
            >
              {isOpen ? "Menú Principal" : "..."}
            </p>

            {/* Enlace Estadísticas */}
            <Link
              href="/dashboard"
              className={getLinkClasses(pathname === "/dashboard")}
              title="Estadísticas"
            >
              <span className="text-base shrink-0">📊</span>
              {isOpen && <span className="animate-fade-in">Estadísticas</span>}
            </Link>

            {/* Enlace Reservar Turno */}
            <Link
              href="/dashboard/turnos"
              className={getLinkClasses(
                pathname.startsWith("/dashboard/turnos"),
              )}
              title="Reservar Turno"
            >
              <span className="text-base shrink-0">🗓️</span>
              {isOpen && (
                <span className="animate-fade-in">Reservar Turno</span>
              )}
            </Link>

            <Link
              href="/dashboard/perfil"
              className={getLinkClasses(
                pathname.startsWith("/dashboard/perfil"),
              )}
              title="Mi Perfil"
            >
              <span className="text-base shrink-0">👤</span>
              {isOpen && <span className="animate-fade-in">Mi Perfil</span>}
            </Link>

            {/* OPCIONES DE ADMINISTRADOR */}
            {userRole === "ADMIN" && (
              <div className="pt-4 space-y-2">
                <p
                  className={`text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 transition-all duration-200 ${isOpen ? "px-2" : "text-center"}`}
                >
                  {isOpen ? "Administración" : "..."}
                </p>

                <Link
                  href="/dashboard/actividades"
                  className={getLinkClasses(
                    pathname.startsWith("/dashboard/actividades"),
                  )}
                  title="Administrar actividades"
                >
                  <span className="text-base shrink-0">🏋️</span>
                  {isOpen && (
                    <span className="animate-fade-in">
                      Administrar Actividades
                    </span>
                  )}
                </Link>

                <Link
                  href="/dashboard/clases"
                  className={getLinkClasses(
                    pathname.startsWith("/dashboard/clases"),
                  )}
                  title="Administrar clases"
                >
                  <span className="text-base shrink-0">⏱️</span>
                  {isOpen && (
                    <span className="animate-fade-in">Administrar Clases</span>
                  )}
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* PIE DE PÁGINA: SECCIÓN PERFIL DE USUARIO */}
        <div
          className={`border-t border-zinc-900/80 pt-4 flex items-center w-full ${
            isOpen
              ? "flex-row justify-between px-2"
              : "flex-col gap-4 justify-center"
          }`}
        >
          {isOpen ? (
            <Link
              href="/dashboard/perfil"
              className="truncate max-w-[110px] animate-fade-in rounded-lg px-1 py-1 -mx-1 hover:bg-zinc-900/60 transition-colors"
              title="Mi perfil"
            >
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {userName}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </Link>
          ) : (
            <Link
              href="/dashboard/perfil"
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0 border border-zinc-700 hover:border-amber-400/40 hover:bg-zinc-850 transition-all"
              title={`Mi perfil — ${userName} (${userRole})`}
            >
              {userName.charAt(0).toUpperCase()}
            </Link>
          )}

          <div
            className={`flex items-center gap-1.5 shrink-0 ${!isOpen && "w-full justify-center"}`}
          >
            {isOpen && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-400/10 border border-amber-400/20 text-amber-400">
                {userRole === "CLIENT" ? "CLI" : userRole}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* BOTÓN FLOTANTE PARA COLLAPSE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center shadow-lg shadow-black/80 hover:bg-zinc-850 transition-all z-30"
        title={isOpen ? "Colapsar menú" : "Expandir menú"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className={`w-3 h-3 transition-transform duration-300 ${!isOpen && "rotate-180"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
    </div>
  );
}
