/**
 * @jest-environment node
 */
// End-to-end through the API: real route handlers, real Mongoose, a throwaway
// in-memory MongoDB. Only TMDB is faked, so the tests never touch the network.
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NextRequest } from "next/server";

import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as me } from "@/app/api/auth/me/route";
import { GET as search } from "@/app/api/search/route";
import { GET as getTitleRoute } from "@/app/api/titles/[mediaType]/[tmdbId]/route";
import { GET as listTracker, POST as addToTracker } from "@/app/api/tracker/route";
import { PATCH as updateTracked, DELETE as removeTracked } from "@/app/api/tracker/[id]/route";
import { connectDB } from "@/lib/db";
import { getTitleDetails } from "@/lib/tmdb";
import Title from "@/models/Title";
import TrackedTitle from "@/models/TrackedTitle";
import User from "@/models/User";

jest.mock("@/lib/tmdb", () => ({
  ...jest.requireActual("@/lib/tmdb"),
  getTitleDetails: jest.fn(),
}));

const INCEPTION = {
  tmdbId: 27205, mediaType: "movie", title: "Inception", overview: "Dreams.", posterPath: "/p.jpg",
  year: "2010", rating: 8.4, genres: ["Action"], cast: ["Leonardo DiCaprio"],
  providers: { link: null, stream: [{ name: "Netflix", logoPath: "/n.png" }], rent: [], buy: [] },
};

jest.setTimeout(30000); // starting the in-memory MongoDB can take a few seconds

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.DB_NAME = "streamstack-test";
  process.env.JWT_SECRET = "test-secret";
  await connectDB();
  // Build the unique indexes up front, the same as the app does on startup.
  await Promise.all([User.init(), Title.init(), TrackedTitle.init()]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  getTitleDetails.mockReset().mockResolvedValue(INCEPTION);
  // Empty every collection but keep the indexes (dropDatabase would delete them).
  await Promise.all([User.deleteMany({}), Title.deleteMany({}), TrackedTitle.deleteMany({})]);
});

// Small helpers to build requests the way the browser would send them.
function request(path, { method = "GET", body, cookie } = {}) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie && { cookie }) },
    body: body && JSON.stringify(body),
  });
}
const ctx = (params) => ({ params: Promise.resolve(params) });
const cookieFrom = (res) => res.headers.get("set-cookie").split(";")[0];

async function signupAs(email) {
  const res = await signup(request("/api/auth/signup", { method: "POST", body: { email, password: "password123" } }));
  return cookieFrom(res);
}

describe("auth", () => {
  test("signup creates a user, sets an httpOnly cookie, and never returns the hash", async () => {
    const res = await signup(request("/api/auth/signup", { method: "POST", body: { email: "Carlos@Test.dev", password: "password123" } }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe("carlos@test.dev");
    expect(data.user.passwordHash).toBeUndefined();
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
  });

  test("duplicate email -> 409, bad input -> 400", async () => {
    await signupAs("dup@test.dev");
    const dup = await signup(request("/api/auth/signup", { method: "POST", body: { email: "dup@test.dev", password: "password123" } }));
    expect(dup.status).toBe(409);
    const bad = await signup(request("/api/auth/signup", { method: "POST", body: { email: "nope", password: "x" } }));
    expect(bad.status).toBe(400);
  });

  test("login with the right password works, wrong password -> 401", async () => {
    await signupAs("login@test.dev");
    const ok = await login(request("/api/auth/login", { method: "POST", body: { email: "login@test.dev", password: "password123" } }));
    expect(ok.status).toBe(200);
    const bad = await login(request("/api/auth/login", { method: "POST", body: { email: "login@test.dev", password: "wrong-password" } }));
    expect(bad.status).toBe(401);
  });

  test("/me returns the user for a valid cookie and null without one", async () => {
    const cookie = await signupAs("me@test.dev");
    expect((await (await me(request("/api/auth/me", { cookie }))).json()).user.email).toBe("me@test.dev");
    expect((await (await me(request("/api/auth/me"))).json()).user).toBeNull();
    expect((await (await me(request("/api/auth/me", { cookie: "streamstack_token=forged" }))).json()).user).toBeNull();
  });
});

describe("titles cache", () => {
  test("first request calls TMDB, second is served from Mongo", async () => {
    const first = await getTitleRoute(request("/api/titles/movie/27205"), ctx({ mediaType: "movie", tmdbId: "27205" }));
    expect((await first.json()).source).toBe("tmdb");
    const second = await getTitleRoute(request("/api/titles/movie/27205"), ctx({ mediaType: "movie", tmdbId: "27205" }));
    expect((await second.json()).source).toBe("cache");
    expect(getTitleDetails).toHaveBeenCalledTimes(1);
  });

  test("unknown media type -> 404 without calling TMDB", async () => {
    const res = await getTitleRoute(request("/api/titles/person/1"), ctx({ mediaType: "person", tmdbId: "1" }));
    expect(res.status).toBe(404);
    expect(getTitleDetails).not.toHaveBeenCalled();
  });

  test("search without a query -> 400", async () => {
    expect((await search(request("/api/search"))).status).toBe(400);
  });
});

describe("tracker CRUD", () => {
  test("requires login", async () => {
    expect((await listTracker(request("/api/tracker"))).status).toBe(401);
    expect((await addToTracker(request("/api/tracker", { method: "POST", body: { tmdbId: 27205, mediaType: "movie" } }))).status).toBe(401);
  });

  test("create -> read -> update -> delete", async () => {
    const cookie = await signupAs("crud@test.dev");

    // Create
    const created = await addToTracker(request("/api/tracker", { method: "POST", cookie, body: { tmdbId: 27205, mediaType: "movie" } }));
    expect(created.status).toBe(201);
    const { item } = await created.json();
    expect(item).toMatchObject({ title: "Inception", watched: false, personalRating: null });

    // Adding the same title twice -> 409 (unique index)
    const again = await addToTracker(request("/api/tracker", { method: "POST", cookie, body: { tmdbId: 27205, mediaType: "movie" } }));
    expect(again.status).toBe(409);

    // Read
    const list = await (await listTracker(request("/api/tracker", { cookie }))).json();
    expect(list.items).toHaveLength(1);

    // Update
    const patched = await updateTracked(
      request(`/api/tracker/${item._id}`, { method: "PATCH", cookie, body: { watched: true, personalRating: 5 } }),
      ctx({ id: item._id })
    );
    const updated = (await patched.json()).item;
    expect(updated).toMatchObject({ watched: true, personalRating: 5 });
    expect(updated.watchedAt).toBeTruthy();

    // Invalid update -> 400
    const invalid = await updateTracked(
      request(`/api/tracker/${item._id}`, { method: "PATCH", cookie, body: { personalRating: 9 } }),
      ctx({ id: item._id })
    );
    expect(invalid.status).toBe(400);

    // Delete
    const removed = await removeTracked(request(`/api/tracker/${item._id}`, { method: "DELETE", cookie }), ctx({ id: item._id }));
    expect(removed.status).toBe(200);
    expect((await (await listTracker(request("/api/tracker", { cookie }))).json()).items).toHaveLength(0);
  });

  test("another user can't see, change, or delete your items", async () => {
    const owner = await signupAs("owner@test.dev");
    const intruder = await signupAs("intruder@test.dev");
    const { item } = await (await addToTracker(request("/api/tracker", { method: "POST", cookie: owner, body: { tmdbId: 27205, mediaType: "movie" } }))).json();

    expect((await (await listTracker(request("/api/tracker", { cookie: intruder }))).json()).items).toHaveLength(0);
    const patch = await updateTracked(request(`/api/tracker/${item._id}`, { method: "PATCH", cookie: intruder, body: { watched: true } }), ctx({ id: item._id }));
    expect(patch.status).toBe(404);
    const del = await removeTracked(request(`/api/tracker/${item._id}`, { method: "DELETE", cookie: intruder }), ctx({ id: item._id }));
    expect(del.status).toBe(404);
  });
});
