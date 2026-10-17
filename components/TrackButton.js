"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTracker } from "@/context/TrackerContext";

export default function TrackButton({ tmdbId, mediaType }) {
  const { user } = useAuth();
  const { findItem, addTitle } = useTracker();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return <Link href="/login" className="btn btn-secondary w-full">Log in to track</Link>;
  }

  if (findItem(tmdbId, mediaType)) {
    return <span className="btn btn-done w-full">✓ In your tracker</span>;
  }

  async function handleAdd() {
    setPending(true);
    setError(null);
    try {
      await addTitle(tmdbId, mediaType);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button onClick={handleAdd} disabled={pending} className="btn btn-primary w-full">
        {pending ? "Adding…" : "+ Add to tracker"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
