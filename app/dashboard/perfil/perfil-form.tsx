"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface PerfilFormProps {
  initialName: string;
  initialEmail: string;
  initialPhone: string | null;
}

export default function PerfilForm({
  initialName,
  initialEmail,
  initialPhone,
}: PerfilFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");

  const handleToggleEdit = () => {
    setError(null);
    setSuccess(null);
    setName(initialName);
    setPhone(initialPhone ?? "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setError(null);
    setSuccess(null);
    setName(initialName);
    setPhone(initialPhone ?? "");
    setIsEditing(false);
  };
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Debes completar todos los campos obligatorios.");
      setSuccess(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudieron guardar los datos.");
        return;
      }

      setName(data.user.name);
      setPhone(data.user.phone ?? "");
      setIsEditing(false);
      setSuccess("Datos guardados correctamente.");

      await updateSession({ name: data.user.name });
      router.refresh();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-base font-bold text-white">Información Personal</h3>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-all duration-300 ${
            isEditing
              ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
              : "bg-zinc-850 text-zinc-500"
          }`}
        >
          {isEditing ? "Modo Edición" : "Solo Lectura"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {success && !isEditing && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
          {success}
        </p>
      )}

      <form id="perfil-form" onSubmit={handleGuardar} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing || saving}
            className={`w-full px-4 py-2.5 rounded-xl text-white placeholder-zinc-600 transition-all duration-200 focus:outline-none ${
              isEditing
                ? "bg-zinc-950 border border-amber-400/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                : "bg-zinc-950/20 border border-zinc-900 text-zinc-400 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Correo Electrónico{" "}
            <span className="text-[10px] text-zinc-600 font-normal">
              (Gestionado por Administrador)
            </span>
          </label>
          <input
            type="email"
            value={initialEmail}
            disabled
            readOnly
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/20 border border-zinc-900 text-zinc-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Teléfono / WhatsApp
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing || saving}
            placeholder="+54 9 11 1234-5678"
            className={`w-full px-4 py-2.5 rounded-xl text-white placeholder-zinc-600 transition-all duration-200 focus:outline-none ${
              isEditing
                ? "bg-zinc-950 border border-amber-400/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                : "bg-zinc-950/20 border border-zinc-900 text-zinc-400 cursor-not-allowed"
            }`}
          />
        </div>
      </form>

      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleToggleEdit}
          disabled={saving || isEditing}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700/50 transition-all disabled:bg-zinc-900 disabled:text-zinc-500 disabled:border-zinc-800 disabled:cursor-not-allowed"
        >
          {isEditing ? "Editando..." : "Editar datos"}
        </button>

        {isEditing && (
          <>
            <button
              type="submit"
              form="perfil-form"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md shadow-amber-400/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : "Guardar datos"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
