"use client";

import { useEffect, useState } from "react";

type ActiveBookingsCardProps = {
  initialCount: number;
};

export function ActiveBookingsCard({ initialCount }: ActiveBookingsCardProps) {
  const [activeBookings, setActiveBookings] = useState(initialCount);

  useEffect(() => {
    const fetchActiveBookings = async () => {
      try {
        const response = await fetch("/api/bookings/active-count");
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setActiveBookings(data.activeCount ?? 0);
      } catch {
        // Keep the current value if refresh fails.
      }
    };

    fetchActiveBookings();

    const handleBookingUpdated = () => {
      fetchActiveBookings();
    };

    window.addEventListener("booking:updated", handleBookingUpdated);

    return () => {
      window.removeEventListener("booking:updated", handleBookingUpdated);
    };
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Reservas activas
      </p>
      <p className="text-4xl font-extrabold tracking-tight text-amber-400 mt-3">
        {activeBookings}
      </p>
    </div>
  );
}
