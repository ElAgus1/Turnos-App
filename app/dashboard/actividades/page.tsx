"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Trash2, Edit2 } from "lucide-react";
import Sidebar from "../sidebar";

interface Activity {
  id: string;
  name: string;
  description: string | null;
  trainerId: string | null;
  trainer?: { name: string };
  createdAt: string;
}

interface Trainer {
  id: string;
  name: string;
}

export default function ActividadesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    trainerId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    trainerId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar actividades");
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await fetch("/api/admin/setup-data");
      if (res.ok) {
        const data = await res.json();
        setTrainers(data.trainers || []);
        if (data.trainers.length > 0) {
          setNewActivity((prev) => ({
            ...prev,
            trainerId: data.trainers[0].id,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar entrenadores");
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchTrainers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.name.trim()) {
      setError("El nombre de la actividad es requerido");
      return;
    }
    if (!newActivity.trainerId) {
      setError("Debes seleccionar un entrenador");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      });

      if (res.ok) {
        const data = await res.json();
        setActivities([...activities, data.activity]);
        setNewActivity({
          name: "",
          description: "",
          trainerId: trainers[0]?.id || "",
        });
        setSuccess("Actividad creada correctamente");
      } else {
        const err = await res.json();
        setError(err.error || "Error al crear actividad");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editData.name.trim()) {
      setError("El nombre de la actividad es requerido");
      return;
    }
    if (!editData.trainerId) {
      setError("Debes seleccionar un entrenador");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(activities.map((a) => (a.id === id ? data.activity : a)));
        setEditingId(null);
        setSuccess("Actividad actualizada correctamente");
      } else {
        const err = await res.json();
        setError(err.error || "Error al actualizar actividad");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta actividad?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setActivities(activities.filter((a) => a.id !== id));
        setSuccess("Actividad eliminada correctamente");
      } else {
        const err = await res.json();
        setError(err.error || "Error al eliminar actividad");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditData({
      name: activity.name,
      description: activity.description || "",
      trainerId: activity.trainerId || "",
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-row relative overflow-hidden">
      <Sidebar
        userName={session?.user?.name || "Admin"}
        userEmail={session?.user?.email || ""}
        userRole={session?.user?.role || "ADMIN"}
      />

      <div className="flex-1 min-h-screen overflow-y-auto">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[150px] pointer-events-none" />

        <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-8">
          <div className="border-b border-zinc-900 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Administrar Actividades
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Creá, editá y eliminá disciplinas del gimnasio.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {success}
            </div>
          )}

          {/* Formulario para crear actividad */}
          <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              Nueva Actividad
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Nombre de la Actividad *
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, name: e.target.value })
                  }
                  disabled={loading}
                  placeholder="ej: CrossFit, Yoga, Pilates"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      description: e.target.value,
                    })
                  }
                  disabled={loading}
                  placeholder="Describe la actividad..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Entrenador Referente *
                </label>
                <select
                  value={newActivity.trainerId}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      trainerId: e.target.value,
                    })
                  }
                  disabled={loading || trainers.length === 0}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                  required
                >
                  <option value="">Seleccionar entrenador...</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creando..." : "Crear Actividad"}
              </button>
            </form>
          </div>

          {/* Lista de actividades */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Disciplinas Registradas
            </h2>
            {activities.length === 0 ? (
              <div className="p-6 rounded-lg text-center text-zinc-400 bg-zinc-900/60 border border-zinc-800">
                No hay actividades creadas aún
              </div>
            ) : (
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4"
                  >
                    {editingId === activity.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          disabled={loading}
                          className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                        />
                        <textarea
                          value={editData.description}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                          disabled={loading}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                        />
                        <select
                          value={editData.trainerId}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              trainerId: e.target.value,
                            })
                          }
                          disabled={loading}
                          className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                        >
                          <option value="">Seleccionar entrenador...</option>
                          {trainers.map((trainer) => (
                            <option key={trainer.id} value={trainer.id}>
                              {trainer.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(activity.id)}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {activity.name}
                        </h3>
                        {activity.description && (
                          <p className="text-sm text-zinc-400 mt-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.trainer && (
                          <p className="text-sm text-amber-400 mt-2">
                            👤 Referente: {activity.trainer.name}
                          </p>
                        )}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => startEdit(activity)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
