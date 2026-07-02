"use client";

import { useState } from "react";

type BookingHistoryItem = {
  id: string;
  date: string;
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED" | string;
  class: {
    startTime: string;
    endTime: string;
    activity: {
      name: string;
    };
    trainer: {
      name: string;
    };
  };
};

function getTodayUtcStart() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function getDisplayStatus(booking: BookingHistoryItem) {
  if (booking.status === "CANCELLED") return "CANCELLED";

  const bookingDate = new Date(booking.date);
  const isPastBooking = bookingDate < getTodayUtcStart();

  if (booking.status === "CONFIRMED" && isPastBooking) {
    return "ATTENDED";
  }

  return booking.status;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getStatusBadgeClasses(status: string) {
  if (status === "CONFIRMED") {
    return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25";
  }

  if (status === "ATTENDED") {
    return "bg-sky-500/10 text-sky-300 border border-sky-500/25";
  }

  if (status === "CANCELLED") {
    return "bg-red-500/10 text-red-300 border border-red-500/25";
  }

  return "bg-zinc-800 text-zinc-200 border border-zinc-700";
}

export function AttendanceHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<BookingHistoryItem[]>([]);

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!nextOpen || history.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings/history", {
        method: "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo cargar el historial");
      }

      setHistory(data.bookings ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el historial";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-center gap-4">
        <button
          onClick={handleToggle}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-800 transition-all"
          type="button"
        >
          {isOpen
            ? "Ocultar Historial de Asistencia"
            : "Ver Historial de Asistencia"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h4 className="text-base font-semibold text-white">
              Historial de Asistencia
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Reservas del presente y del pasado, ordenadas de la mas reciente a
              la mas antigua.
            </p>
          </div>

          {loading ? (
            <p className="px-5 py-6 text-sm text-zinc-400">
              Cargando historial...
            </p>
          ) : error ? (
            <p className="px-5 py-6 text-sm text-red-300">{error}</p>
          ) : history.length === 0 ? (
            <p className="px-5 py-6 text-sm text-zinc-400">
              No hay reservas en tu historial para mostrar.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {history.map((booking) => {
                // We present past confirmed bookings as attended to avoid
                // mixing historical attendance with currently active reservations.
                const displayStatus = getDisplayStatus(booking);

                return (
                  <div
                    key={booking.id}
                    className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {booking.class.activity.name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Profesor: {booking.class.trainer.name}
                      </p>
                      <p className="text-xs text-zinc-300 mt-2">
                        {formatDate(booking.date)} · {booking.class.startTime} -{" "}
                        {booking.class.endTime}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusBadgeClasses(
                        displayStatus,
                      )}`}
                    >
                      {displayStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
