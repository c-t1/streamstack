"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Poster from "@/components/Poster";
import ProviderList from "@/components/ProviderList";
import TrackButton from "@/components/TrackButton";
import { apiFetch } from "@/lib/apiClient";

// Folder [mediaType]/[tmdbId] means this page handles /title/movie/27205 etc.
export default function TitlePage() {
  const { mediaType, tmdbId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    apiFetch(`/api/titles/${mediaType}/${tmdbId}`)
      .then((data) => !ignore && setTitle(data.title))
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, [mediaType, tmdbId]);

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-[var(--danger)]">{error}</p>
        <button onClick={() => router.back()} className="btn btn-secondary">← Back</button>
      </div>
    );
  }
  if (!title) return <p className="text-[var(--muted)]">Loading…</p>;

  const { providers } = title;
  const available = providers.stream.length || providers.rent.length || providers.buy.length;

  return (
    <article className="flex flex-col gap-6 sm:flex-row">
      <div className="w-48 shrink-0 self-center sm:self-start">
        <Poster path={title.posterPath} title={title.title} size="w500" className="w-full" />
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <div>
          <button onClick={() => router.back()} className="mb-2 text-sm text-[var(--muted)] hover:underline">
            ← Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{title.title}</h1>
          <p className="text-[var(--muted)]">
            <span className="badge">{title.mediaType === "tv" ? "TV" : "Movie"}</span>
            {title.year && ` · ${title.year}`}
            {title.rating ? ` · ★ ${title.rating}/10 on TMDB` : ""}
          </p>
        </div>

        {title.genres.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {title.genres.map((genre) => <li key={genre} className="chip">{genre}</li>)}
          </ul>
        )}

        {title.overview && <p className="leading-relaxed">{title.overview}</p>}

        <div className="max-w-xs">
          <TrackButton tmdbId={title.tmdbId} mediaType={title.mediaType} />
        </div>

        <section className="card flex flex-col gap-4 p-4">
          <h2 className="text-lg font-semibold">Where to watch (US)</h2>
          {available ? (
            <>
              <ProviderList label="Stream" providers={providers.stream} />
              <ProviderList label="Rent" providers={providers.rent} />
              <ProviderList label="Buy" providers={providers.buy} />
              {providers.link && (
                <a href={providers.link} target="_blank" rel="noreferrer" className="text-sm underline">
                  See all options on JustWatch ↗
                </a>
              )}
            </>
          ) : (
            <p className="text-[var(--muted)]">
              Not currently available to stream, rent, or buy in the US.
            </p>
          )}
        </section>

        {title.cast.length > 0 && (
          <section>
            <h2 className="mb-1 text-lg font-semibold">Cast</h2>
            <p className="text-[var(--muted)]">{title.cast.join(", ")}</p>
          </section>
        )}
      </div>
    </article>
  );
}
