"use client";

import { useState } from "react";

export default function SearchBar({ initialQuery = "", onSearch, disabled = false }) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser's full-page form submit
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <label htmlFor="search" className="sr-only">Search movies and shows</label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a movie or show, e.g. Inception"
        className="input flex-1"
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !query.trim()}>
        Search
      </button>
    </form>
  );
}
