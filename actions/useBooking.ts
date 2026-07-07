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

type CancelBookingResponse = {
  booking: unknown;
  error?: string;
};

export async function createBooking(classId: string, date: Date | string) {
  const normalizedDate = typeof date === "string" ? date : date.toISOString();

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      classId,
      date: normalizedDate,
    } as BookingPayload),
  });

  const data = (await response.json()) as BookingResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "No se pudo crear la reserva.");
  }

  return data.booking;
}

export async function cancelBooking(bookingId: string) {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "CANCELLED" }),
  });

  const data = (await response.json()) as CancelBookingResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "No se pudo cancelar la reserva.");
  }

  return data.booking;
}

export function useBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateBooking = useCallback(
    async (classId: string, date: Date | string) => {
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

export function useCancelBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setCancellingBookingId(bookingId);

    try {
      const booking = await cancelBooking(bookingId);
      setSuccess("Reserva cancelada correctamente.");
      return booking;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cancelar la reserva.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
      setCancellingBookingId(null);
    }
  }, []);

  return {
    cancelBooking: handleCancelBooking,
    isLoading,
    cancellingBookingId,
    error,
    success,
    resetError: () => setError(null),
    resetSuccess: () => setSuccess(null),
  };
}
