# StreamStack

Find where any movie or show is streaming, then keep a personal log of what you've watched,
with your own star rating for each title.

**Live:** https://streamstack-vert.vercel.app

**Demo login:** `demo@streamstack.dev` / `streamstack-demo` (pre-loaded with a few tracked titles)

Springboard Software Engineering capstone. Planning docs:
[Step 1 project ideas](docs/project-ideas.md) · [Step 2 project proposal](docs/project-proposal.md)

---

## Features

- **Search** movies and TV shows by title (TMDB multi-search).
- **Title detail page** with poster, genres, TMDB rating, overview, cast, and **where to watch in
  the US**, split into stream, rent, and buy, with a link out to JustWatch.
- **Accounts:** sign up, log in, and log out. Passwords are hashed with bcrypt. Sessions use a
  signed JWT in an httpOnly cookie.
- **Tracker (full CRUD):** add a title from search or the detail page, mark it watched or
  unwatched, give it a 1–5 star rating, and remove it.
- **Tracker stats and filters:** total tracked, watched count, average personal rating, and
  All / To watch / Watched tabs.
- **Cached title data:** title details are cached in MongoDB for 24 hours, so repeat visits don't
  call TMDB. If TMDB is down, a cached copy is served.
- Responsive layout with light and dark mode.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, JavaScript |
| API | REST route handlers in `app/api/**/route.js` |
| Database | MongoDB (Atlas) with Mongoose |
| Auth | bcryptjs + jsonwebtoken, httpOnly cookie |
| State | React Context API (`AuthContext`, `TrackerContext`) |
| Styling | Tailwind CSS v4 + custom CSS components and design tokens in `app/globals.css` |
| External data | [TMDB API](https://developer.themoviedb.org/) (watch providers by JustWatch) |
| Tests | Jest, React Testing Library, mongodb-memory-server |
| Hosting | Vercel |

## How it fits together

```
Browser (React client components)
   │  fetch('/api/...')  + httpOnly login cookie
   ▼
Next.js route handlers (app/api)        ← TMDB_API_KEY only exists here, never in the browser
   ├── lib/auth.js     hash / verify passwords, sign / verify JWT
   ├── lib/titles.js   cache-aside: Mongo first → TMDB on miss → store
   ├── lib/tmdb.js     TMDB calls + normalizing movie/TV shapes
   ▼
MongoDB (users, titles, trackedtitles)
```

**Control flow for "add to tracker":**
1. The user clicks **+ Add to tracker**. `TrackButton` calls `addTitle()` from `TrackerContext`.
2. The context sends `POST /api/tracker { tmdbId, mediaType }`. The browser attaches the
   login cookie automatically.
3. The route handler verifies the JWT, then loads the title server-side through the cache
   (`lib/titles.js`). It doesn't trust title data sent by the client.
4. It inserts a `TrackedTitle`. If the title is already tracked, the unique index on
   `(user, tmdbId, mediaType)` rejects the insert and the route returns **409**.
5. The new item comes back as JSON, the context adds it to state, and every component reading
   the context re-renders. The search card switches to "✓ In your tracker".

## Data model (MongoDB)

**User**: `email` (unique, lowercase), `passwordHash`, `createdAt`, `updatedAt`

**Title**: the TMDB cache, unique on `(tmdbId, mediaType)`:
`tmdbId`, `mediaType` (`movie` | `tv`), `title`, `overview`, `posterPath`, `year`, `rating`,
`genres[]`, `cast[]`, `providers { link, stream[], rent[], buy[] }`, `cachedAt`

**TrackedTitle**: one per user per title, unique on `(user, tmdbId, mediaType)`:
`user` → User, `tmdbId`, `mediaType`, `title`, `posterPath`, `year`, `genres[]`, `rating`,
`watched`, `personalRating` (1–5 or null), `watchedAt`, `addedAt`, `updatedAt`

The display fields are copied into `TrackedTitle` when a title is added (a snapshot), so the
tracker page loads with one query and no TMDB calls.

## API

All responses are JSON. Errors are always `{ "error": "message" }`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account `{ email, password }` → 201, sets cookie |
| POST | `/api/auth/login` | — | Log in `{ email, password }` → sets cookie |
| POST | `/api/auth/logout` | — | Clear the cookie |
| GET | `/api/auth/me` | cookie | Current user, or `{ user: null }` |
| GET | `/api/search?q=` | — | Search TMDB for movies and shows |
| GET | `/api/titles/:mediaType/:tmdbId` | — | Title details + where to watch (cached) |
| GET | `/api/tracker` | required | List your tracked titles |
| POST | `/api/tracker` | required | Add `{ tmdbId, mediaType }` → 201, or 409 if already tracked |
| PATCH | `/api/tracker/:id` | required | Update `{ watched?, personalRating? }` |
| DELETE | `/api/tracker/:id` | required | Remove from tracker |

**Authorization:** tracker queries always filter on the logged-in user's id, so a user can only
read or change their own rows. Another user's id returns 404.

## Project structure

```
app/
  layout.js                     root layout: Providers, NavBar, footer
  page.js                       / (search)
  title/[mediaType]/[tmdbId]/   title detail page
  tracker/  login/  signup/     pages
  api/                          REST route handlers (the backend)
components/                     NavBar, SearchBar, TitleCard, TrackButton, TrackerItem, StarRating, ...
context/                        AuthContext, TrackerContext
lib/                            db, auth, tmdb, titles (cache), validators, apiClient
models/                         Mongoose schemas: User, Title, TrackedTitle
__tests__/                      unit, components, integration
scripts/seed-demo.mjs           creates the demo account through the API
```

## Run it locally

Requires Node 20+ and a MongoDB connection string (Atlas, or a local `mongod`).

```bash
git clone https://github.com/c-t1/streamstack.git
cd streamstack
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Variable | What it is |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `DB_NAME` | Database name (default `streamstack`) |
| `JWT_SECRET` | Long random string used to sign login cookies |
| `TMDB_API_KEY` | TMDB v3 API key (free at themoviedb.org → Settings → API) |

Seed the demo account (against local or production):

```bash
node scripts/seed-demo.mjs http://localhost:3000
```

## Tests

```bash
npm test
```

- **Unit:** input validation, and TMDB response normalizing (with `fetch` mocked).
- **Component (React Testing Library):** `StarRating`, `SearchBar`, `TitleCard`, `AuthForm`.
- **Integration:** calls the real route handlers against an in-memory MongoDB, with only TMDB
  mocked. Covers signup/login/me, the title cache (second request served from Mongo), full
  tracker CRUD, duplicate-add 409, invalid input 400, and that one user can't touch another
  user's items.

## Deployment

Hosted on Vercel. Environment variables (`MONGODB_URI`, `DB_NAME`, `JWT_SECRET`,
`TMDB_API_KEY`) are set in the Vercel project settings, never committed.

## Possible next steps

- Sort and filter the tracker by genre or rating
- Choose your streaming region (currently US)
- Recommendations based on highly rated genres
- Separate IMDb and Rotten Tomatoes scores via a second API (OMDb)

---

This product uses the TMDB API but is not endorsed or certified by TMDB. Where-to-watch data is
provided by JustWatch.
