"use client";

import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
}

export function AdminClassForm({
  onClassCreated,
}: {
  onClassCreated: () => void;
}) {
  const [activities, setActivities] = useState<Item[]>([]);
  const [trainers, setTrainers] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Campos del formulario
  const [activityId, setActivityId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1); // Lunes por defecto
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [capacity, setCapacity] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/setup-data");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities);
          setTrainers(data.trainers);
          if (data.activities.length > 0) setActivityId(data.activities[0].id);
          if (data.trainers.length > 0) setTrainerId(data.trainers[0].id);
        }
      } catch (err) {
        console.error("Error cargando datos de configuración:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          trainerId,
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
          capacity: Number(capacity),
        }),
      });

      if (res.ok) {
        alert("¡Clase programada con éxito!");
        onClassCreated(); // callback para refrescar la lista visual
      } else {
        const data = await res.json();
        alert(data.error || "Ocurrió un error.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="text-zinc-400 text-sm">
        Cargando actividades y profesores...
      </p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-4"
    >
      <h2 className="text-xl font-bold text-white">Programar Nueva Clase</h2>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Actividad
        </label>
        <select
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          required
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
          value={trainerId}
          onChange={(e) => setTrainerId(e.target.value)}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          required
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
          Día de la semana
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
        >
          <option value={1}>Lunes</option>
          <option value={2}>Martes</option>
          <option value={3}>Miércoles</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
          <option value={6}>Sábado</option>
          <option value={0}>Domingo</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Hora Inicio
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Hora Fin
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Capacidad Máxima (Cupos)
        </label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          min={1}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md shadow-amber-400/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Guardando..." : "Crear Clase"}
      </button>
    </form>
  );
}
