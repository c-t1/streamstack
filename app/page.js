"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import TitleCard from "@/components/TitleCard";
import TrackButton from "@/components/TrackButton";
import { apiFetch } from "@/lib/apiClient";

// The query lives in the URL (/?q=inception), so the browser Back button from
// a title page returns to the same results.
function SearchPage() {
  const router = useRouter();
  const query = useSearchParams().get("q") || "";
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    let ignore = false;

    async function search() {
      setStatus("loading");
      setError(null);
      try {
        const data = await apiFetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!ignore) {
          setResults(data.results);
          setStatus("done");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    search();
    return () => {
      ignore = true;
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Where can I watch it?</h1>
        <p className="text-[var(--muted)]">
          Search any movie or show to see where it&apos;s streaming, then track what you&apos;ve watched.
        </p>
        <SearchBar
          key={query}
          initialQuery={query}
          disabled={status === "loading"}
          onSearch={(q) => router.push(`/?q=${encodeURIComponent(q)}`)}
        />
      </section>

      {query && status === "loading" && <p className="text-[var(--muted)]">Searching…</p>}
      {query && status === "error" && (
        <p role="alert" className="text-[var(--danger)]">Search failed: {error}</p>
      )}
      {query && status === "done" && results.length === 0 && (
        <p className="text-[var(--muted)]">No movies or shows match &ldquo;{query}&rdquo;.</p>
      )}

      {query && status === "done" && results.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {results.map((title) => (
            <li key={`${title.mediaType}-${title.tmdbId}`}>
              <TitleCard title={title}>
                <TrackButton tmdbId={title.tmdbId} mediaType={title.mediaType} />
              </TitleCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary so Next can prerender the page shell.
export default function Home() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
