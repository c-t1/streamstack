import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

// POST /api/auth/logout  ->  200, cookie cleared
export async function POST() {
  return clearAuthCookie(NextResponse.json({ ok: true }));
}
