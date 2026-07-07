"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: string;
  name: string;
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdminClassForm({
  onClassCreated,
}: {
  onClassCreated: () => void;
}) {
  const [activities, setActivities] = useState<Item[]>([]);
  const [trainers, setTrainers] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Campos del formulario
  const [activityId, setActivityId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [referenceDate, setReferenceDate] = useState(
    toDateOnlyString(new Date()),
  );
  const [recurrenceOption, setRecurrenceOption] = useState<
    "none" | "1" | "2" | "3"
  >("none");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [capacity, setCapacity] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const hasSetupData = activities.length > 0 && trainers.length > 0;

  const parsedReferenceDate = new Date(`${referenceDate}T00:00:00`);
  const dayOfWeek = Number.isNaN(parsedReferenceDate.getTime())
    ? 1
    : parsedReferenceDate.getDay();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/class-form-data");
        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const bodyText = await res.text();
          throw new Error(
            bodyText.includes("<!DOCTYPE")
              ? "El servidor devolvio HTML en lugar de JSON. Reinicia `npm run dev` y proba de nuevo."
              : "Respuesta invalida del servidor.",
          );
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "No se pudieron cargar actividades y profesores.",
          );
        }

        setActivities(data.activities || []);
        setTrainers(data.trainers || []);
        if (data.activities?.length > 0) setActivityId(data.activities[0].id);
        if (data.trainers?.length > 0) setTrainerId(data.trainers[0].id);
      } catch (err) {
        console.error("Error cargando datos de configuración:", err);
        setSetupError(
          err instanceof Error
            ? err.message
            : "Error cargando datos de configuracion.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasSetupData) {
      alert(
        "Necesitas al menos una actividad y un profesor para crear clases.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          trainerId,
          dayOfWeek: Number(dayOfWeek),
          classDate: referenceDate,
          recurrenceIntervalWeeks:
            recurrenceOption === "none" ? null : Number(recurrenceOption),
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

      {setupError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {setupError}
        </div>
      )}

      {activities.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          No hay actividades cargadas. Crea una primero en{" "}
          <Link
            href="/dashboard/admin/actividades"
            className="underline font-semibold"
          >
            Administrar Actividades
          </Link>
          .
        </div>
      )}

      {trainers.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          No hay profesores con rol TRAINER disponibles para asignar.
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Actividad
        </label>
        <select
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          disabled={activities.length === 0}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          required
        >
          {activities.length === 0 && (
            <option value="">Sin actividades disponibles</option>
          )}
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
          disabled={trainers.length === 0}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          required
        >
          {trainers.length === 0 && (
            <option value="">Sin profesores disponibles</option>
          )}
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Fecha de clase
        </label>
        <input
          type="date"
          value={referenceDate}
          onChange={(e) => setReferenceDate(e.target.value)}
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          required
        />
        <p className="mt-2 text-xs text-zinc-500">
          La clase se programara para el dia exacto seleccionado (
          {WEEKDAY_NAMES[dayOfWeek]}).
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Repetición
        </label>
        <select
          value={recurrenceOption}
          onChange={(e) =>
            setRecurrenceOption(e.target.value as "none" | "1" | "2" | "3")
          }
          className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
        >
          <option value="none">Solo esta fecha</option>
          <option value="1">Todas las semanas</option>
          <option value="2">Cada 2 semanas</option>
          <option value="3">Cada 3 semanas</option>
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
        disabled={submitting || !hasSetupData}
        className="w-full px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md shadow-amber-400/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Guardando..." : "Crear Clase"}
      </button>
    </form>
  );
}
