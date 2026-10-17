import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { searchTitles } from "@/lib/tmdb";

// GET /api/search?q=inception  ->  { results: [...] }
export async function GET(request) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return jsonError("Add a search term, e.g. /api/search?q=inception", 400);

  try {
    const results = await searchTitles(query);
    return NextResponse.json({ results });
  } catch (err) {
    return jsonError(err.message, err.status || 500);
  }
}
