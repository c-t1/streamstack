"use client";

import Link from "next/link";
import { useState } from "react";
import Poster from "@/components/Poster";
import StarRating from "@/components/StarRating";

export default function TrackerItem({ item, onUpdate, onRemove }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Wraps each update/remove call with the pending + error handling.
  async function run(action) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  const href = `/title/${item.mediaType}/${item.tmdbId}`;

  return (
    <li className="card flex gap-3 p-3">
      <Link href={href} className="shrink-0">
        <Poster path={item.posterPath} title={item.title} size="w154" className="w-16 sm:w-20" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <Link href={href} className="font-semibold hover:underline">{item.title}</Link>
          <p className="text-sm text-[var(--muted)]">
            {item.mediaType === "tv" ? "TV" : "Movie"}
            {item.year && ` · ${item.year}`}
            {item.genres?.length ? ` · ${item.genres.slice(0, 3).join(", ")}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={item.watched}
              disabled={pending}
              onChange={(e) => run(() => onUpdate(item._id, { watched: e.target.checked }))}
            />
            Watched
          </label>
          <StarRating
            value={item.personalRating}
            disabled={pending}
            onChange={(rating) => run(() => onUpdate(item._id, { personalRating: rating }))}
          />
          <button
            onClick={() => run(() => onRemove(item._id))}
            disabled={pending}
            className="btn btn-danger ml-auto text-xs"
          >
            Remove
          </button>
        </div>
        {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    </li>
  );
}
