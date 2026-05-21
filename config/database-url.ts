/** URLs de Neon: limpia parámetros problemáticos y obtiene la URL directa para Prisma CLI. */
export function cleanNeonUrl(url: string): string {
  return url
    .replace(/[?&]channel_binding=require/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
}

export function resolveDirectUrl(): string {
  const explicit = process.env.DIRECT_URL?.trim();
  if (explicit) return cleanNeonUrl(explicit);

  const pooled = process.env.DATABASE_URL?.trim();
  if (!pooled) {
    throw new Error(
      "Definí DATABASE_URL en .env (copiá desde Neon → Connect).",
    );
  }

  const derived = pooled.includes("-pooler.")
    ? pooled.replace("-pooler.", ".")
    : pooled;

  return cleanNeonUrl(derived);
}
