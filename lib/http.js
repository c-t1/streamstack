import { NextResponse } from "next/server";

// Every API error has the same shape: { error: "message" }.
export function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}
