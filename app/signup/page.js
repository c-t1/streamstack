"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  async function handleSignup(email, password) {
    await signup(email, password);
    router.push("/");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <AuthForm mode="signup" onSubmit={handleSignup} />
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </div>
  );
}
