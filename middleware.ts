export { default } from "next-auth/middleware";

/**
 * Rutas que exigen sesión (JWT válido). El resto (/, /login, API auth, estáticos)
 * queda público y no pasa por este middleware.
 *
 * Qué hace el middleware en Next.js: corre en el *edge* antes de servir la página.
 * Acá NextAuth revisa la cookie de sesión; si no hay token válido, redirige a /login.
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
