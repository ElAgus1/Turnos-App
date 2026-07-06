import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

import { db } from "@/lib/db";

const bodySchema = z.object({
  email: z.string().email("Correo inválido"),
});

function getResetUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });
}

function hasPartialSmtpConfig() {
  const values = [
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
  ].map((value) => (value ?? "").trim());

  const someConfigured = values.some((value) => value.length > 0);
  const allConfigured = values.every((value) => value.length > 0);

  return someConfigured && !allConfigured;
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Correo inválido" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email },
  });

  let resetUrl: string | null = null;

  if (user) {
    const token = randomBytes(24).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    resetUrl = getResetUrl(token);

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    if (hasPartialSmtpConfig()) {
      return NextResponse.json(
        {
          error:
            "Configuración SMTP incompleta. Definí SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS.",
        },
        { status: 500 },
      );
    }

    const transporter = createTransporter();
    if (transporter) {
      const from = process.env.EMAIL_FROM ?? "no-reply@localhost";
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: "Restablece tu contraseña",
          text: `Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este correo.`,
          html: `
            <p>Hola,</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
          `,
        });
      } catch (error) {
        console.error("Error enviando correo de recuperación:", error);
        return NextResponse.json(
          { error: "No se pudo enviar el correo de recuperación" },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({
    message:
      "Si la cuenta existe, se envió un correo con un enlace para restablecer la contraseña.",
    resetUrl: createTransporter() ? null : resetUrl,
  });
}
