"use client";

import { useEffect, useMemo, useState } from "react";

type ClassItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedSpots?: number;
  availableSpots?: number;
  activity: {
    name: string;
    description: string | null;
  };
  trainer: {
    id: string;
    name: string;
    email: string;
  };
};

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

function buildNextSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
}

function buildSevenDaysFrom(baseDate: Date) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ClassSelector() {
  const initialDays = useMemo(buildNextSevenDays, []);
  const [windowStartDate, setWindowStartDate] = useState<Date>(initialDays[0]);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDays[0]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const days = useMemo(
    () => buildSevenDaysFrom(windowStartDate),
    [windowStartDate],
  );

  const selectedDayOfWeek = selectedDate.getDay();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      setError(null);

      try {
        const selectedDateString = toDateOnlyString(selectedDate);
        const response = await fetch(
          `/api/classes?dayOfWeek=${selectedDayOfWeek}&date=${selectedDateString}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "No se pudieron cargar las clases");
        }

        setClasses(data.classes ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al obtener las clases";
        setError(message);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [refreshKey, selectedDate, selectedDayOfWeek]);

  useEffect(() => {
    const handleBookingUpdated = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("booking:updated", handleBookingUpdated);

    return () => {
      window.removeEventListener("booking:updated", handleBookingUpdated);
    };
  }, []);

  const reserveClass = async (classId: string) => {
    setBookingClassId(classId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          date: toDateOnlyString(selectedDate),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo reservar el cupo");
      }

      setSuccess("Reserva confirmada.");
      window.dispatchEvent(new Event("booking:updated"));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo reservar el cupo";
      setError(message);
    } finally {
      setBookingClassId(null);
    }
  };

  return (
    <section className="rounded-2xl bg-zinc-900/40 border border-zinc-900 p-8 backdrop-blur-xl space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Reservar turno</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Elegi una fecha exacta y anotate en la disciplina que prefieras.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Fecha exacta
          </label>
          <input
            type="date"
            value={toDateOnlyString(selectedDate)}
            onChange={(e) => {
              if (!e.target.value) return;

              const pickedDate = new Date(`${e.target.value}T00:00:00`);
              pickedDate.setHours(0, 0, 0, 0);

              setSelectedDate(pickedDate);
              setWindowStartDate(pickedDate);
              setSuccess(null);
              setError(null);
            }}
            className="w-full sm:w-[220px] rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-200 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const prevWeek = new Date(windowStartDate);
              prevWeek.setDate(prevWeek.getDate() - 7);
              setWindowStartDate(prevWeek);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700"
          >
            Semana anterior
          </button>
          <button
            type="button"
            onClick={() => {
              const nextWeek = new Date(windowStartDate);
              nextWeek.setDate(nextWeek.getDate() + 7);
              setWindowStartDate(nextWeek);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700"
          >
            Semana siguiente
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {days.map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                setSelectedDate(day);
                setSuccess(null);
                setError(null);
              }}
              className={`min-w-[86px] rounded-xl border px-3 py-2 text-left transition-colors ${
                isSelected
                  ? "border-amber-400 bg-amber-400/15 text-amber-300"
                  : "border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <p className="text-xs uppercase tracking-wide">
                {WEEKDAY_LABELS[day.getDay()]}
              </p>
              <p className="text-lg font-bold leading-tight">{day.getDate()}</p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {loadingClasses ? (
        <p className="text-sm text-zinc-400">Cargando clases del dia...</p>
      ) : classes.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No hay clases programadas para esta fecha.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {classes.map((cls) => {
            const isBooking = bookingClassId === cls.id;
            const availableSpots = cls.availableSpots ?? cls.capacity;
            const isFull = availableSpots <= 0;

            return (
              <article
                key={cls.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <div className="space-y-3">
                  <h4 className="text-xl font-extrabold uppercase tracking-wide text-white">
                    {cls.activity.name}
                  </h4>

                  {cls.activity.description && (
                    <p className="text-sm text-zinc-400">
                      {cls.activity.description}
                    </p>
                  )}

                  <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
                    <p className="text-sm text-zinc-500">
                      Horario: {cls.startTime} - {cls.endTime}
                    </p>
                    <p className="text-sm text-zinc-600">
                      Profesor: {cls.trainer.name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Capacidad: {cls.capacity}
                    </p>
                  </div>

                  <p
                    className={`text-sm ${
                      isFull ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    Cupos disponibles: {availableSpots}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => reserveClass(cls.id)}
                  disabled={isBooking || isFull}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBooking
                    ? "Reservando..."
                    : isFull
                      ? "Clase llena"
                      : "Reservar cupo"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
