import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("⏳ Iniciando el sembrado de la base de datos...");

  const passwordHash = await bcrypt.hash("Turnos2026!", 10);

  // 1. Limpiar datos existentes (opcional, para evitar duplicados en pruebas)
  await prisma.booking.deleteMany();
  await prisma.class.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Usuarios con distintos roles
  await prisma.user.create({
    data: {
      email: "admin@gimnasio.com",
      name: "Agustín Administrador",
      passwordHash,
      role: "ADMIN",
    },
  });

  const trainer = await prisma.user.create({
    data: {
      email: "profesor1@gimnasio.com",
      name: "Carlos Entrenador",
      passwordHash,
      role: "TRAINER",
    },
  });

  const cliente = await prisma.user.create({
    data: {
      email: "alumno@gimnasio.com",
      name: "Juan Alumno",
      passwordHash,
      role: "CLIENT",
    },
  });

  console.log("✅ Usuarios creados con éxito");

  // 3. Crear Actividades
  const crossfit = await prisma.activity.create({
    data: {
      name: "CrossFit",
      description:
        "Entrenamiento de alta intensidad con movimientos funcionales.",
    },
  });

  const funcional = await prisma.activity.create({
    data: {
      name: "Funcional",
      description: "Circuito para mejorar la resistencia, fuerza y agilidad.",
    },
  });

  console.log("✅ Actividades creadas");

  // 4. Crear Clases / Horarios (Ejemplo: Lunes y Miércoles)
  const class1 = await prisma.class.create({
    data: {
      activityId: crossfit.id,
      trainerId: trainer.id,
      dayOfWeek: 1, // Lunes
      startTime: "08:00",
      endTime: "09:00",
      capacity: 15,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      activityId: funcional.id,
      trainerId: trainer.id,
      dayOfWeek: 3, // Miércoles
      startTime: "19:00",
      endTime: "20:00",
      capacity: 20,
    },
  });

  console.log("✅ Horarios de clases configurados");

  // 5. Crear Reservas (Bookings) de prueba
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7));
  nextMonday.setHours(8, 0, 0, 0);

  const nextWednesday = new Date(today);
  nextWednesday.setDate(today.getDate() + ((3 - today.getDay() + 7) % 7));
  nextWednesday.setHours(19, 0, 0, 0);

  await prisma.booking.create({
    data: {
      classId: class1.id,
      userId: cliente.id,
      date: nextMonday,
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      classId: class2.id,
      userId: cliente.id,
      date: nextWednesday,
      status: "CONFIRMED",
    },
  });

  console.log("✅ Reservas de prueba creadas");
  console.log("🚀 ¡Base de datos sembrada con éxito!");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
