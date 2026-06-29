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

  const trainer1 = await prisma.user.create({
    data: {
      email: "profesor1@gimnasio.com",
      name: "Carlos Entrenador",
      passwordHash,
      role: "TRAINER",
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      email: "profesor2@gimnasio.com",
      name: "María García",
      passwordHash,
      role: "TRAINER",
    },
  });

  const trainer3 = await prisma.user.create({
    data: {
      email: "profesor3@gimnasio.com",
      name: "Juan López",
      passwordHash,
      role: "TRAINER",
    },
  });

  const trainer4 = await prisma.user.create({
    data: {
      email: "profesor4@gimnasio.com",
      name: "Laura Martínez",
      passwordHash,
      role: "TRAINER",
    },
  });

  const trainer5 = await prisma.user.create({
    data: {
      email: "profesor5@gimnasio.com",
      name: "Diego Fernández",
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

  console.log(
    "✅ Usuarios creados con éxito (1 Admin, 5 Entrenadores, 1 Cliente)",
  );

  // 3. Crear Actividades (cada una con un trainer asignado)
  const crossfit = await prisma.activity.create({
    data: {
      name: "CrossFit",
      description:
        "Entrenamiento de alta intensidad con movimientos funcionales.",
      trainerId: trainer1.id,
    },
  });

  const funcional = await prisma.activity.create({
    data: {
      name: "Funcional",
      description: "Circuito para mejorar la resistencia, fuerza y agilidad.",
      trainerId: trainer2.id,
    },
  });

  const yoga = await prisma.activity.create({
    data: {
      name: "Yoga",
      description: "Clases de yoga para flexibilidad y relajación.",
      trainerId: trainer3.id,
    },
  });

  const pilates = await prisma.activity.create({
    data: {
      name: "Pilates",
      description: "Fortalecimiento del core y estabilidad.",
      trainerId: trainer4.id,
    },
  });

  console.log("✅ Actividades creadas (cada una con su trainer asignado)");

  // 4. Crear Clases / Horarios con diferentes entrenadores
  const class1 = await prisma.class.create({
    data: {
      activityId: crossfit.id,
      trainerId: trainer1.id,
      dayOfWeek: 1, // Lunes
      startTime: "08:00",
      endTime: "09:00",
      capacity: 15,
    },
  });

  const class2 = await prisma.class.create({
    data: {
      activityId: funcional.id,
      trainerId: trainer2.id,
      dayOfWeek: 3, // Miércoles
      startTime: "19:00",
      endTime: "20:00",
      capacity: 20,
    },
  });

  const class3 = await prisma.class.create({
    data: {
      activityId: yoga.id,
      trainerId: trainer3.id,
      dayOfWeek: 2, // Martes
      startTime: "10:00",
      endTime: "11:00",
      capacity: 25,
    },
  });

  const class4 = await prisma.class.create({
    data: {
      activityId: pilates.id,
      trainerId: trainer4.id,
      dayOfWeek: 4, // Jueves
      startTime: "18:00",
      endTime: "19:00",
      capacity: 18,
    },
  });

  const class5 = await prisma.class.create({
    data: {
      activityId: crossfit.id,
      trainerId: trainer5.id,
      dayOfWeek: 5, // Viernes
      startTime: "20:00",
      endTime: "21:00",
      capacity: 20,
    },
  });

  console.log(
    "✅ Horarios de clases configurados (5 clases con diferentes entrenadores)",
  );

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
