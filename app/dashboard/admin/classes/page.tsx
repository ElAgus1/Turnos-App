"use client";

import { useState, useEffect } from "react";
import { AdminClassForm } from "@/components/admin-class-form";

interface ClassItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  activity: { name: string };
  trainer: { name: string };
}

const DAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAllClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllClasses();
  }, [refreshKey]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Administración de Clases
        </h1>
        <p className="text-gray-500">
          Configura los horarios, profesores y actividades del gimnasio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Formulario */}
        <div className="lg:col-span-1">
          <AdminClassForm
            onClassCreated={() => setRefreshKey((prev) => prev + 1)}
          />
        </div>

        {/* Columna Listado Completo */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Grilla Horaria Actual
          </h2>

          {classes.length === 0 ? (
            <p className="text-gray-500">
              No hay clases registradas en el sistema todavía.
            </p>
          ) : (
            <div className="space-y-4">
              {DAYS.map((dayName, index) => {
                const dayClasses = classes.filter((c) => c.dayOfWeek === index);
                if (dayClasses.length === 0) return null;

                return (
                  <div key={index} className="border rounded-xl p-4 bg-gray-50">
                    <h3 className="font-bold text-lg text-blue-700 border-b pb-1 mb-2">
                      {dayName}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dayClasses.map((cls) => (
                        <div
                          key={cls.id}
                          className="bg-white p-3 rounded-lg border shadow-sm"
                        >
                          <h4 className="font-bold text-gray-800">
                            {cls.activity.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Profe: {cls.trainer.name}
                          </p>
                          <div className="flex justify-between items-center mt-2 text-xs font-semibold text-gray-500">
                            <span>
                              ⏰ {cls.startTime} - {cls.endTime} hs
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              Cupos: {cls.capacity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
