"use client";

import { useEffect, useState } from "react";

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

export function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("¿Estás seguro de que querés cancelar este turno?")) return;

    try {
      // Nota: Aquí disparamos la cancelación. Podés adaptarlo si usás DELETE o PATCH.
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        alert("Reserva cancelada con éxito");
        fetchBookings(); // Recargamos la lista
      } else {
        const errorData = await res.json();
        alert(errorData.error || "No se pudo cancelar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-gray-500">Cargando tus turnos...</p>;
  if (bookings.length === 0)
    return <p className="text-gray-500">No tenés reservas activas.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="p-4 border rounded-xl shadow-sm bg-white flex flex-col justify-between"
        >
          <div>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {booking.status}
            </span>
            <h3 className="text-lg font-bold mt-2">
              {booking.class.activity.name}
            </h3>
            <p className="text-sm text-gray-600">
              Profesor: {booking.class.trainer.name}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              📅{" "}
              {new Date(booking.date).toLocaleDateString("es-AR", {
                timeZone: "UTC",
              })}
            </p>
            <p className="text-sm text-gray-700">
              ⏰ {booking.class.startTime} - {booking.class.endTime} hs
            </p>
          </div>

          {booking.status !== "CANCELLED" && (
            <button
              onClick={() => handleCancel(booking.id)}
              className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg font-medium transition"
            >
              Cancelar Reserva
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
