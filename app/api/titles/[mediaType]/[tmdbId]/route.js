import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getTitle } from "@/lib/titles";
import { isMediaType } from "@/lib/validators";

// GET /api/titles/movie/27205  ->  { title, source }
// `source` is "cache", "tmdb", or "stale-cache", which is handy for demoing the cache.
export async function GET(request, { params }) {
  const { mediaType, tmdbId } = await params; // params is a Promise in Next 15+
  const id = Number(tmdbId);
  if (!isMediaType(mediaType) || !Number.isInteger(id)) {
    return jsonError("Unknown title.", 404);
  }

  try {
    const { title, source } = await getTitle(mediaType, id);
    return NextResponse.json({ title, source });
  } catch (err) {
    return jsonError(err.message, err.status || 500);
  }
}
