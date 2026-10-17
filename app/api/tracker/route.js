import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getTitle } from "@/lib/titles";
import { isMediaType } from "@/lib/validators";
import TrackedTitle from "@/models/TrackedTitle";

// GET /api/tracker  ->  { items: [...] }   (Read)
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return jsonError("Log in to use the tracker.", 401);

  await connectDB();
  // Filtering by `user` is the authorization: you only ever see your own rows.
  const items = await TrackedTitle.find({ user: user.id }).sort({ addedAt: -1 }).lean();
  return NextResponse.json({ items });
}

// POST /api/tracker  { tmdbId, mediaType }  ->  201 { item }   (Create)
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return jsonError("Log in to use the tracker.", 401);

  const body = await request.json().catch(() => null);
  const tmdbId = Number(body?.tmdbId);
  if (!Number.isInteger(tmdbId) || !isMediaType(body?.mediaType)) {
    return jsonError("Send a numeric tmdbId and a mediaType of movie or tv.", 400);
  }

  // Look the title up server-side rather than trusting title data from the
  // client. It usually comes straight from the Mongo cache.
  let title;
  try {
    ({ title } = await getTitle(body.mediaType, tmdbId));
  } catch (err) {
    return jsonError(err.message, err.status || 500);
  }

  try {
    const item = await TrackedTitle.create({
      user: user.id,
      tmdbId,
      mediaType: body.mediaType,
      title: title.title,
      posterPath: title.posterPath,
      year: title.year,
      genres: title.genres,
      rating: title.rating,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) return jsonError("That title is already in your tracker.", 409);
    throw err;
  }
}
