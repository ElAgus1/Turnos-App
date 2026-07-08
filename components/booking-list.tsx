"use client";

import { useEffect, useState } from "react";
import { useCancelBooking } from "@/actions/useBooking";

interface Booking {
  id: string;
  date: string;
  status: string;
  class: {
    startTime: string;
    endTime: string;
    activity: { name: string };
    trainer: { name: string };
  };
}

function getStatusLabel(status: string) {
  if (status === "CONFIRMED") return "Confirmada";
  if (status === "CANCELLED") return "Cancelada";
  if (status === "ATTENDED") return "Asistida";
  if (status === "PENDING") return "Pendiente";
  return status;
}

export function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    cancelBooking,
    cancellingBookingId,
    error: cancelError,
    resetError: resetCancelError,
  } = useCancelBooking();

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) setBookings(data.bookings);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const handleBookingUpdate = () => {
      fetchBookings();
    };

    window.addEventListener("booking:updated", handleBookingUpdate);

    return () => {
      window.removeEventListener("booking:updated", handleBookingUpdate);
    };
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("¿Estás seguro de que querés cancelar este turno?")) return;

    resetCancelError();

    try {
      await cancelBooking(bookingId);
      window.dispatchEvent(new Event("booking:updated"));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-400">Cargando tus turnos...</p>;
  }

  if (bookings.length === 0)
    return <p className="text-sm text-zinc-400">No tenés reservas activas.</p>;

  return (
    <div className="space-y-4">
      {cancelError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {cancelError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 shadow-xl backdrop-blur-xl"
          >
            <div>
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                  booking.status === "CANCELLED"
                    ? "border-red-500/25 bg-red-500/10 text-red-300"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {getStatusLabel(booking.status)}
              </span>

              <h3 className="mt-3 text-lg font-bold text-white">
                {booking.class.activity.name}
              </h3>
              <p className="text-sm text-zinc-400">
                Profesor: {booking.class.trainer.name}
              </p>
              <p className="mt-3 text-sm text-zinc-300">
                📅{" "}
                {new Date(booking.date).toLocaleDateString("es-AR", {
                  timeZone: "UTC",
                })}
              </p>
              <p className="text-sm text-zinc-300">
                ⏰ {booking.class.startTime} - {booking.class.endTime} hs
              </p>
            </div>

            <button
              onClick={() => handleCancel(booking.id)}
              disabled={cancellingBookingId === booking.id}
              className="mt-5 w-full rounded-xl border border-red-500/25 bg-red-500/10 py-2.5 font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancellingBookingId === booking.id
                ? "Cancelando..."
                : "Cancelar Reserva"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
