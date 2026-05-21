/** Misma lógica que config/database-url.ts (para scripts .mjs sin TypeScript). */
export function cleanNeonUrl(url) {
  return url
    .replace(/[?&]channel_binding=require/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
}

export function resolveDirectUrl() {
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
