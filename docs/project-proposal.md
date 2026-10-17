# Capstone Step 2: Project Proposal

**StreamStack: Streaming Movie/Show Finder & Tracker**

This is the proposal as submitted and approved. Implementation changes since then are listed in
[What changed during the build](#what-changed-during-the-build) at the bottom.

---

A web app to find where movies and shows are available to stream, and to track everything
watched, including ratings, genres, and a personal score per title.

| Type | Fill in |
|---|---|
| **Stack** | React (Vite) with Axios and React Router; Node.js with Express, keeping API keys server side; Postgres; Streaming Availability API ("Movie of the Night"); hosting on Netlify or Vercel |
| **Focus** | An evenly focused full-stack application. The frontend handles search and the tracking interface; the backend serves the API and performs CRUD on the watch list. |
| **Type** | A responsive website for desktop and mobile browsers. |
| **Goal** | Find where a movie or show is currently available to stream, rent, or buy in a single search, and keep a personal log of everything watched, with ratings and a personal score. |
| **Users** | Everyone, but primarily adults roughly 18–50 who subscribe to multiple streaming services and want a fast "where can I watch this?" answer plus a simple way to track and rate what they've seen, like a movie/TV diary. |
| **Data** | External: the Streaming Availability API returns where-to-watch information (stream, rent, buy, with direct links) plus title, overview, cast, genres, poster, and a blended rating. Internal: the user's tracked titles. |

## Project approach

### 1. Database schema
- **TrackedTitle:** showId (the API's id), imdbId, title, mediaType (movie or series), posterUrl,
  actors (array), genres (array), rating, watched (boolean), personalRating, addedAt, watchedAt.
- Where-to-watch availability is fetched live from the API when a title is viewed (it changes
  often) rather than stored.

### 2. Potential API issues
- Streaming availability is regional and changes frequently, so results can occasionally be out
  of date.
- The free tier has a monthly limit of 500 API requests.
- Not every title is available to stream, rent, or buy, so the UI must handle "not available"
  and empty results gracefully.
- A broad search term can match many titles, so results need to be clear.

### 3. Sensitive information
- The API key is stored in a server-side environment variable, and every request is proxied
  through the backend, so the key never reaches the browser.
- The core version has no login, but it's built so accounts can be added later.

### 4. Functionality
- Search for a movie or show with an input and a button.
- View where it's available (stream, rent, buy) along with cast, genres, rating, and poster.
- Add a title to the personal tracker.
- Mark titles as watched or not watched.
- Give each title a personal rating.
- View and manage the tracked list (edit or remove entries).

### 5. User flow
1. A visitor lands on the home page and searches for a title.
2. Results render; they open a title to see availability, rating, cast, and genres.
3. They add it to their tracker.
4. In the tracker, they mark it watched and give it a personal rating.
5. They can revisit, filter, and update the list as needed.

### 6. Stretch goals
- User accounts (login / sign-up) so multiple people can keep separate lists.
- Filter and sort the tracker by genre, rating, or watched status.
- Stats and insights, such as most-watched genres or average personal rating.
- Separate IMDb and Rotten Tomatoes scores from a second source (OMDb).
- Recommendations based on what's been watched and rated.

Because of API limits, the README includes demo credentials with pre-loaded titles for reviewers.

---

## What changed during the build

| Proposal | Built | Why |
|---|---|---|
| React (Vite) + Express, two deploys | **Next.js App Router**: React pages and API route handlers in one app, one Vercel deploy | No separate backend host or CORS. Route handlers keep the API key server-side the same way Express would. |
| Postgres | **MongoDB (Atlas) + Mongoose** | Matches the Step 6 requirement for MongoDB CRUD. |
| Movie of the Night API (500 requests/month) | **TMDB API** (no monthly cap) with JustWatch provider data | The free-tier cap would run out quickly during review. TMDB returns details, cast, and watch providers in one call. |
| No login in the core version | **Accounts built in**: bcrypt-hashed passwords, JWT in an httpOnly cookie | Moved up from a stretch goal. Each user has their own tracker. |
| Availability fetched live on every view | **Cached in MongoDB for 24 hours** (cache-aside) | Fewer external calls, and a cached copy is still served if TMDB is down. |
| Stretch goals | Built: accounts, watched filter, stats (count, average rating). Not yet: genre sort, OMDb scores, recommendations | |
