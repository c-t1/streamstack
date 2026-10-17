// Server-only wrapper around TMDB. The API key lives in an env var and is only
// read here, inside route handlers, so it never reaches the browser.

const BASE_URL = "https://api.themoviedb.org/3";

export class TmdbError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function tmdbFetch(path, params = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new TmdbError("TMDB_API_KEY is not set on the server.", 500);

  const url = new URL(BASE_URL + path);
  url.searchParams.set("api_key", key);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

  let res;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new TmdbError("Couldn't reach TMDB. Try again in a moment.", 502);
  }
  if (res.status === 404) throw new TmdbError("Title not found.", 404);
  if (!res.ok) throw new TmdbError(`TMDB request failed (${res.status}).`, 502);
  return res.json();
}

const yearOf = (date) => (date || "").slice(0, 4);
const roundRating = (vote) => (vote ? Math.round(vote * 10) / 10 : null);

// TMDB calls it `title` for movies and `name` for TV. We flatten both shapes.
export function normalizeSearchResult(item) {
  return {
    tmdbId: item.id,
    mediaType: item.media_type,
    title: item.title || item.name,
    year: yearOf(item.release_date || item.first_air_date),
    posterPath: item.poster_path || null,
    overview: item.overview || "",
    rating: roundRating(item.vote_average),
  };
}

export async function searchTitles(query) {
  const data = await tmdbFetch("/search/multi", { query, include_adult: "false" });
  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map(normalizeSearchResult);
}

const mapProviders = (list = []) =>
  list.map((p) => ({ name: p.provider_name, logoPath: p.logo_path }));

export function normalizeDetails(data, mediaType, region = "US") {
  const watch = data["watch/providers"]?.results?.[region] || {};
  return {
    tmdbId: data.id,
    mediaType,
    title: data.title || data.name,
    overview: data.overview || "",
    posterPath: data.poster_path || null,
    year: yearOf(data.release_date || data.first_air_date),
    rating: roundRating(data.vote_average),
    genres: (data.genres || []).map((g) => g.name),
    cast: (data.credits?.cast || []).slice(0, 8).map((c) => c.name),
    providers: {
      link: watch.link || null,
      stream: mapProviders(watch.flatrate),
      rent: mapProviders(watch.rent),
      buy: mapProviders(watch.buy),
    },
  };
}

// One request returns details, cast, and where-to-watch, thanks to append_to_response.
export async function getTitleDetails(mediaType, tmdbId) {
  const data = await tmdbFetch(`/${mediaType}/${tmdbId}`, {
    append_to_response: "credits,watch/providers",
  });
  return normalizeDetails(data, mediaType);
}
