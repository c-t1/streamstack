import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/auth/me  ->  { user } or { user: null }
// The browser can't read the httpOnly cookie, so it asks the server who it is.
export async function GET(request) {
  return NextResponse.json({ user: getUserFromRequest(request) });
}
