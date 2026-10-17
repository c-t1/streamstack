import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { publicUser, setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import User from "@/models/User";

// POST /api/auth/login  { email, password }  ->  200 { user } + auth cookie
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return jsonError("Email and password are required.", 400);
  }

  await connectDB();
  const user = await User.findOne({ email: String(body.email).trim().toLowerCase() });
  const valid = user && (await verifyPassword(String(body.password), user.passwordHash));

  // Same message for "no such user" and "wrong password", so the response
  // doesn't reveal which emails have accounts.
  if (!valid) return jsonError("Invalid email or password.", 401);

  const response = NextResponse.json({ user: publicUser(user) });
  return setAuthCookie(response, signToken(user));
}
