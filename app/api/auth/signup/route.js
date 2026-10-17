import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, publicUser, setAuthCookie, signToken } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { validateCredentials } from "@/lib/validators";
import User from "@/models/User";

// POST /api/auth/signup  { email, password }  ->  201 { user } + auth cookie
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const errors = validateCredentials(body ?? {});
  if (errors.length) return jsonError(errors.join(" "), 400);

  await connectDB();
  const email = body.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    return jsonError("An account with that email already exists.", 409);
  }

  let user;
  try {
    user = await User.create({ email, passwordHash: await hashPassword(body.password) });
  } catch (err) {
    // Two signups for the same email at once: the unique index catches the second.
    if (err.code === 11000) return jsonError("An account with that email already exists.", 409);
    throw err;
  }

  const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
  return setAuthCookie(response, signToken(user));
}
