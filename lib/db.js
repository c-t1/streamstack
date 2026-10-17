import mongoose from "mongoose";

// On Vercel every request may run in a fresh serverless function, and in dev
// Next hot-reloads modules. Caching the connection on globalThis means we
// reuse one connection instead of opening a new one per request.
const cached = globalThis._mongoose || { conn: null, promise: null };
globalThis._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    cached.promise = mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "streamstack",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
