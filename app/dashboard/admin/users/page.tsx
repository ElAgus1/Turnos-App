"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "../../sidebar";

type Role = "ADMIN" | "TRAINER" | "CLIENT";

interface UserItem {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  hasPassword: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  TRAINER: "Entrenador",
  CLIENT: "Cliente",
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    role: "CLIENT" as Role,
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadUsers = async () => {
    setLoadingList(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo cargar la lista de usuarios.");
        return;
      }

      setUsers(data.users || []);
    } catch {
      setError("Error de conexión al cargar usuarios.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      loadUsers();
    }
  }, [status, session]);

  const groupedCount = useMemo(() => {
    const counters = {
      ADMIN: 0,
      TRAINER: 0,
      CLIENT: 0,
    };

    for (const user of users) {
      counters[user.role] += 1;
    }

    return counters;
  }, [users]);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.email.trim() || !form.name.trim() || !form.password.trim()) {
      setError("Email, nombre y contraseña son obligatorios.");
      return;
    }

    setLoadingCreate(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          role: form.role,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo crear el usuario.");
        return;
      }

      setSuccess(`Usuario creado: ${data.user.email}`);
      setForm({
        email: "",
        name: "",
        phone: "",
        role: "CLIENT",
        password: "",
      });
      await loadUsers();
    } catch {
      setError("Error de conexión al crear usuario.");
    } finally {
      setLoadingCreate(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Validando permisos...
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-row relative overflow-hidden">
      <Sidebar
        userName={session.user?.name || "Admin"}
        userEmail={session.user?.email || ""}
        userRole={session.user?.role || "ADMIN"}
      />

      <div className="flex-1 min-h-screen overflow-y-auto">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

        <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-8">
          <div className="border-b border-zinc-900 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Administración de Usuarios
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Solo administradores pueden crear usuarios y asignar roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Administradores
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {groupedCount.ADMIN}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Entrenadores
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {groupedCount.TRAINER}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Clientes
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {groupedCount.CLIENT}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              {success}
            </div>
          )}

          <section className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Usuario</h2>
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={loadingCreate}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={loadingCreate}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  placeholder="Ej: usuario@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  disabled={loadingCreate}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Rol *
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      role: e.target.value as Role,
                    }))
                  }
                  disabled={loadingCreate}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="TRAINER">Entrenador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  disabled={loadingCreate}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  placeholder="Opcional"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loadingCreate}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold disabled:opacity-60"
                >
                  {loadingCreate ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </section>

          <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Usuarios del Sistema
              </h2>
              <button
                onClick={loadUsers}
                disabled={loadingList}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm"
              >
                {loadingList ? "Actualizando..." : "Actualizar"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Rol</th>
                    <th className="py-2 pr-4">Teléfono</th>
                    <th className="py-2 pr-4">Contraseña</th>
                    <th className="py-2 pr-0">Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-900/80 text-zinc-200"
                    >
                      <td className="py-3 pr-4">{user.name}</td>
                      <td className="py-3 pr-4">{user.email}</td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{user.phone || "-"}</td>
                      <td className="py-3 pr-4">
                        {user.hasPassword ? "Configurada" : "Sin definir"}
                      </td>
                      <td className="py-3 pr-0 text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString("es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loadingList && users.length === 0 && (
                <p className="text-zinc-400 py-6">
                  No hay usuarios cargados todavía.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
