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
      <p className="text-gray-500 text-sm">
        Cargando actividades y profesores...
      </p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-md"
    >
      <h2 className="text-xl font-bold text-gray-800">Programar Nueva Clase</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Actividad
        </label>
        <select
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          className="mt-1 w-full p-2.5 border rounded-lg bg-white"
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
        <label className="block text-sm font-medium text-gray-700">
          Entrenador / Profesor
        </label>
        <select
          value={trainerId}
          onChange={(e) => setTrainerId(e.target.value)}
          className="mt-1 w-full p-2.5 border rounded-lg bg-white"
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
        <label className="block text-sm font-medium text-gray-700">
          Día de la semana
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value))}
          className="mt-1 w-full p-2.5 border rounded-lg bg-white"
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
          <label className="block text-sm font-medium text-gray-700">
            Hora Inicio
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full p-2.5 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora Fin
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full p-2.5 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Capacidad Máxima (Cupos)
        </label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          className="mt-1 w-full p-2.5 border rounded-lg"
          min={1}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-lg transition disabled:bg-gray-400"
      >
        {submitting ? "Guardando..." : "Crear Clase"}
      </button>
    </form>
  );
}
