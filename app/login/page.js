"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  async function handleLogin(email, password) {
    await login(email, password);
    router.push("/tracker");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <AuthForm mode="login" onSubmit={handleLogin} />
      <p className="text-center text-sm text-[var(--muted)]">
        New here? <Link href="/signup" className="underline">Create an account</Link>
      </p>
    </div>
  );
}
