"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2, ArrowLeft, Edit2 } from "lucide-react";
import { AdminClassForm } from "@/components/admin-class-form";

interface ClassItem {
  id: string;
  dayOfWeek: number;
  classDate: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  activity: { name: string; id: string };
  trainer: { name: string; id: string };
  activityId: string;
  trainerId: string;
}

interface Activity {
  id: string;
  name: string;
}

interface Trainer {
  id: string;
  name: string;
}

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function getDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateInputValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAnchorDateForClass(cls: ClassItem) {
  if (cls.classDate) {
    return new Date(cls.classDate);
  }

  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const daysUntilTarget = (cls.dayOfWeek - todayUtc.getUTCDay() + 7) % 7;
  todayUtc.setUTCDate(todayUtc.getUTCDate() + daysUntilTarget);

  return todayUtc;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function AdminClassesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    activityId: "",
    trainerId: "",
    dayOfWeek: 1,
    classDate: "",
    startTime: "",
    endTime: "",
    capacity: 20,
  });

  // Protección ADMIN-only
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchAllClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivitiesAndTrainers = async () => {
    try {
      const res = await fetch("/api/admin/class-form-data");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setTrainers(data.trainers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClass = (cls: ClassItem) => {
    setEditingId(cls.id);
    setEditData({
      activityId: cls.activityId,
      trainerId: cls.trainerId,
      dayOfWeek: cls.dayOfWeek,
      classDate: cls.classDate ? toDateInputValue(new Date(cls.classDate)) : "",
      startTime: cls.startTime,
      endTime: cls.endTime,
      capacity: cls.capacity,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/classes?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        alert("¡Clase actualizada con éxito!");
        setEditingId(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await res.json();
        alert("Error al editar la clase: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al editar la clase");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta clase?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/classes?id=${classId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await res.json();
        alert("Error al eliminar la clase: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la clase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClasses();
    fetchActivitiesAndTrainers();
  }, [refreshKey]);

  // Mostrar loading mientras se valida la sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Validando permisos...</div>
      </div>
    );
  }

  // Protección contra acceso no autorizado
  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Administración de Clases
          </h1>
          <p className="text-zinc-400">
            Configura los horarios, profesores y actividades del gimnasio.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm border border-zinc-700/50 transition-all"
          title="Volver a la página anterior"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      {/* Modal de Edición */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 p-6 w-full max-w-md backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Editar Clase</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Actividad
                </label>
                <select
                  value={editData.activityId}
                  onChange={(e) =>
                    setEditData({ ...editData, activityId: e.target.value })
                  }
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Entrenador / Profesor
                </label>
                <select
                  value={editData.trainerId}
                  onChange={(e) =>
                    setEditData({ ...editData, trainerId: e.target.value })
                  }
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                >
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Fecha exacta
                </label>
                <input
                  type="date"
                  value={editData.classDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsedDate = new Date(`${value}T00:00:00.000Z`);

                    setEditData({
                      ...editData,
                      classDate: value,
                      dayOfWeek: Number.isNaN(parsedDate.getTime())
                        ? editData.dayOfWeek
                        : parsedDate.getUTCDay(),
                    });
                  }}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) =>
                      setEditData({ ...editData, startTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) =>
                      setEditData({ ...editData, endTime: e.target.value })
                    }
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Capacidad Máxima (Cupos)
                </label>
                <input
                  type="number"
                  value={editData.capacity}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      capacity: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  min={1}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md shadow-amber-400/10 transition-all disabled:opacity-60"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setEditingId(null)}
                disabled={loading}
                className="flex-1 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700/50 transition-all disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Formulario */}
        <div className="lg:col-span-1">
          <AdminClassForm
            onClassCreated={() => setRefreshKey((prev) => prev + 1)}
          />
        </div>

        {/* Columna Listado Completo */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Grilla Horaria Actual
          </h2>

          {classes.length === 0 ? (
            <p className="text-zinc-400">
              No hay clases registradas en el sistema todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {Array.from(
                classes.reduce((acc, cls) => {
                  const anchorDate = getAnchorDateForClass(cls);
                  const key = getDateKey(anchorDate);

                  if (!acc.has(key)) {
                    acc.set(key, {
                      date: anchorDate,
                      classes: [],
                    });
                  }

                  acc.get(key)!.classes.push(cls);
                  return acc;
                }, new Map<string, { date: Date; classes: ClassItem[] }>()),
              )
                .map(([, value]) => value)
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((group) => (
                  <div
                    key={getDateKey(group.date)}
                    className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/60 backdrop-blur-xl"
                  >
                    <h3 className="font-bold text-lg text-amber-400 border-b border-zinc-800 pb-1 mb-2 flex items-center justify-between gap-3">
                      <span>{DAYS[group.date.getUTCDay()]}</span>
                      <span className="text-xs font-semibold text-zinc-400">
                        {formatDateLabel(group.date)}
                      </span>
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.classes
                        .slice()
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((cls) => (
                          <div
                            key={cls.id}
                            className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 shadow-lg relative"
                          >
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                onClick={() => handleEditClass(cls)}
                                disabled={loading}
                                className="p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded transition-colors disabled:opacity-50"
                                title="Editar clase"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(cls.id)}
                                disabled={loading}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                title="Eliminar clase"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <h4 className="font-bold text-white pr-8">
                              {cls.activity.name}
                            </h4>
                            <p className="text-xs text-zinc-400">
                              Profe: {cls.trainer.name}
                            </p>
                            <div className="flex justify-between items-center mt-2 text-xs font-semibold text-zinc-400">
                              <span>
                                ⏰ {cls.startTime} - {cls.endTime} hs
                              </span>
                              <span className="bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded border border-amber-400/30">
                                Cupos: {cls.capacity}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
