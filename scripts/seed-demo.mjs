// Creates the demo account and pre-loads its tracker through the real API.
// Usage: node scripts/seed-demo.mjs https://streamstack-vert.vercel.app
//
// Going through the API (not straight into Mongo) means the seed exercises the
// same signup, search, and add-to-tracker code a real user does.

const BASE_URL = process.argv[2] || "http://localhost:3000";
const DEMO = { email: "demo@streamstack.dev", password: "streamstack-demo" };

// [search term, watched?, personal rating]
const TITLES = [
  ["Inception", true, 5],
  ["Breaking Bad", true, 5],
  ["The Bear", true, 4],
  ["Dune: Part Two", false, null],
  ["Severance", false, null],
  ["Spider-Man: Into the Spider-Verse", true, 4],
];

let cookie = "";

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json", cookie },
    body: body && JSON.stringify(body),
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

let res = await api("/api/auth/signup", { method: "POST", body: DEMO });
if (res.status === 409) res = await api("/api/auth/login", { method: "POST", body: DEMO });
if (res.status >= 400) throw new Error(`Couldn't log in as demo user: ${res.data.error}`);
console.log(`Logged in as ${DEMO.email}`);

const { data: existing } = await api("/api/tracker");
for (const item of existing.items) await api(`/api/tracker/${item._id}`, { method: "DELETE" });

for (const [term, watched, personalRating] of TITLES) {
  const { data } = await api(`/api/search?q=${encodeURIComponent(term)}`);
  const match = data.results?.[0];
  if (!match) {
    console.warn(`  skipped "${term}" (no search results)`);
    continue;
  }
  const added = await api("/api/tracker", {
    method: "POST",
    body: { tmdbId: match.tmdbId, mediaType: match.mediaType },
  });
  if (watched || personalRating) {
    await api(`/api/tracker/${added.data.item._id}`, {
      method: "PATCH",
      body: { watched, personalRating },
    });
  }
  console.log(`  added ${match.title}`);
}

console.log("Done.");
