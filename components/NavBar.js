"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const linkClass = (href) => `nav-link ${pathname === href ? "nav-link-active" : ""}`;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Stream<span className="text-[var(--accent)]">Stack</span>
        </Link>
        <Link href="/" className={linkClass("/")}>Search</Link>
        <Link href="/tracker" className={linkClass("/tracker")}>My Tracker</Link>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              <span className="hidden text-[var(--muted)] sm:inline">{user.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
