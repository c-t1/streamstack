# Capstone Step 1: Initial Project Ideas

Project 1, StreamStack, was the idea selected to move forward. Its proposal is in
[`project-proposal.md`](project-proposal.md).

---

## Project 1: StreamStack - Streaming Movie/Show Finder & Tracker

A web app to find where movies/shows are available to stream and to track everything I've watched.

**Tech Stack:**

- Frontend: React (Vite)
- Backend: Node/Express
- Database: MongoDB (connected via Express)

**API:** TMDB (themoviedb.org) — has the data I need based on my research. Requires account
creation for an API key.

**Core Features:**

- Look up where a movie/show is currently available (streaming platform, purchase options, etc.)
- Store and track everything watched, with the following per title:
  - Title, actors, genres
  - IMDB / Rotten Tomatoes ratings
  - Watched / not watched status
  - Personal rating

---

## Project 2: Vending Machine App

An app to manage my vending business (currently two machines). Both machines use different
tracking software but share the same payment processor (Nayax), so there may be a way to unify
tracking, this needs more research.

**Focus:** Track each machine's inventory by location, last fill date, and transactions.

**API:** Nayax appears to have API documentation, though it's unclear what data I can actually
extract since they run their own app. Needs more investigation.
