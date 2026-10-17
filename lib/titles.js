import { connectDB } from "@/lib/db";
import { getTitleDetails } from "@/lib/tmdb";
import Title from "@/models/Title";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cache-aside: check Mongo first, call TMDB only on a miss or a stale copy,
// then store what TMDB returned. Streaming availability changes, so copies
// older than a day are refreshed.
export async function getTitle(mediaType, tmdbId) {
  await connectDB();
  const cached = await Title.findOne({ tmdbId, mediaType }).lean();
  const fresh = cached && Date.now() - new Date(cached.cachedAt).getTime() < ONE_DAY_MS;
  if (fresh) return { title: cached, source: "cache" };

  try {
    const details = await getTitleDetails(mediaType, tmdbId);
    const title = await Title.findOneAndUpdate(
      { tmdbId, mediaType },
      { ...details, cachedAt: new Date() },
      { upsert: true, returnDocument: "after" }
    ).lean();
    return { title, source: "tmdb" };
  } catch (err) {
    // If TMDB is down but we have an old copy, an old copy beats an error page.
    if (cached) return { title: cached, source: "stale-cache" };
    throw err;
  }
}
