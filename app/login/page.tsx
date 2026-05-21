import { Suspense } from "react";

import LoginForm from "./login-form";

function LoginFallback() {
  return <p className="text-zinc-500">Cargando…</p>;
}

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-950 px-6 py-16">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
