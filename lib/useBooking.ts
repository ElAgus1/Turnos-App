"use client";

import { useCallback, useState } from "react";

type BookingPayload = {
  classId: string;
  date: string;
};

type BookingResponse = {
  booking: unknown;
  error?: string;
};

export async function createBooking(classId: string, date: Date) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      classId,
      date: date.toISOString(),
    } as BookingPayload),
  });

  const data = (await response.json()) as BookingResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "No se pudo crear la reserva.");
  }

  return data.booking;
}

export function useBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateBooking = useCallback(
    async (classId: string, date: Date) => {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      try {
        const booking = await createBooking(classId, date);
        setSuccess("Turno reservado correctamente.");
        return booking;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    createBooking: handleCreateBooking,
    isLoading,
    error,
    success,
    resetError: () => setError(null),
    resetSuccess: () => setSuccess(null),
  };
}
