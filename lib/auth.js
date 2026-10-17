import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "streamstack_token";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return value;
}

// bcrypt salts and hashes in one step. 10 rounds is the common default:
// slow enough to resist brute force, fast enough for a login request.
export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, secret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret());
  } catch {
    return null; // expired, tampered with, or signed with another secret
  }
}

// httpOnly: browser JavaScript can't read the cookie, so an XSS bug can't steal it.
// sameSite lax: the cookie isn't sent on cross-site POSTs (basic CSRF protection).
export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

// Returns { id, email } for a logged-in request, or null.
export function getUserFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email };
}

export function publicUser(user) {
  return { id: String(user._id), email: user.email };
}
