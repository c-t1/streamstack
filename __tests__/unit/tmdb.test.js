/**
 * @jest-environment node
 */
import { normalizeDetails, normalizeSearchResult, searchTitles } from "@/lib/tmdb";

describe("normalizeSearchResult", () => {
  test("flattens a movie", () => {
    const movie = { id: 27205, media_type: "movie", title: "Inception", release_date: "2010-07-15", poster_path: "/p.jpg", vote_average: 8.369 };
    expect(normalizeSearchResult(movie)).toEqual({
      tmdbId: 27205, mediaType: "movie", title: "Inception", year: "2010", posterPath: "/p.jpg", overview: "", rating: 8.4,
    });
  });

  test("uses `name` and first_air_date for TV", () => {
    const show = { id: 1396, media_type: "tv", name: "Breaking Bad", first_air_date: "2008-01-20" };
    const result = normalizeSearchResult(show);
    expect(result.title).toBe("Breaking Bad");
    expect(result.year).toBe("2008");
    expect(result.posterPath).toBeNull();
  });
});

describe("normalizeDetails", () => {
  const raw = {
    id: 27205,
    title: "Inception",
    release_date: "2010-07-15",
    vote_average: 8.4,
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }],
    credits: { cast: Array.from({ length: 12 }, (_, i) => ({ name: `Actor ${i}` })) },
    "watch/providers": {
      results: {
        US: {
          link: "https://justwatch.example",
          flatrate: [{ provider_name: "Netflix", logo_path: "/n.png" }],
          rent: [{ provider_name: "Apple TV", logo_path: "/a.png" }],
        },
      },
    },
  };

  test("pulls genres, top 8 cast, and US providers", () => {
    const details = normalizeDetails(raw, "movie");
    expect(details.genres).toEqual(["Action", "Science Fiction"]);
    expect(details.cast).toHaveLength(8);
    expect(details.providers.stream).toEqual([{ name: "Netflix", logoPath: "/n.png" }]);
    expect(details.providers.rent).toHaveLength(1);
    expect(details.providers.buy).toEqual([]);
  });

  test("returns empty provider lists when the title isn't available in the region", () => {
    const details = normalizeDetails({ ...raw, "watch/providers": { results: {} } }, "movie");
    expect(details.providers).toEqual({ link: null, stream: [], rent: [], buy: [] });
  });
});

describe("searchTitles", () => {
  const realFetch = global.fetch;
  beforeEach(() => {
    process.env.TMDB_API_KEY = "test-key";
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("drops people from multi-search results", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          { id: 1, media_type: "movie", title: "A" },
          { id: 2, media_type: "person", name: "Someone" },
          { id: 3, media_type: "tv", name: "B" },
        ],
      }),
    });
    const results = await searchTitles("x");
    expect(results.map((r) => r.tmdbId)).toEqual([1, 3]);
    expect(String(global.fetch.mock.calls[0][0])).toContain("api_key=test-key");
  });

  test("turns a TMDB outage into a 502 error", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(searchTitles("x")).rejects.toMatchObject({ status: 502 });
  });
});
