"use client";

import Link from "next/link";
import { useState } from "react";
import TrackerItem from "@/components/TrackerItem";
import { useAuth } from "@/context/AuthContext";
import { useTracker } from "@/context/TrackerContext";

const FILTERS = {
  all: { label: "All", test: () => true },
  toWatch: { label: "To watch", test: (item) => !item.watched },
  watched: { label: "Watched", test: (item) => item.watched },
};

export default function TrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, error, updateItem, removeItem } = useTracker();
  const [filter, setFilter] = useState("all");

  if (authLoading) return <p className="text-[var(--muted)]">Loading…</p>;

  // Client-side guard for the page. The real protection is the API: every
  // /api/tracker route returns 401 without a valid login cookie.
  if (!user) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">My Tracker</h1>
        <p>Log in to see and manage your tracked titles.</p>
        <Link href="/login" className="btn btn-primary">Log in</Link>
      </div>
    );
  }

  const watched = items.filter((item) => item.watched);
  const rated = items.filter((item) => item.personalRating);
  const averageRating = rated.length
    ? (rated.reduce((sum, item) => sum + item.personalRating, 0) / rated.length).toFixed(1)
    : "—";
  const visible = items.filter(FILTERS[filter].test);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Tracker</h1>

      <dl className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Tracked" value={items.length} />
        <Stat label="Watched" value={watched.length} />
        <Stat label="Avg. rating" value={averageRating} />
      </dl>

      <div className="flex gap-2" role="tablist">
        {Object.entries(FILTERS).map(([key, { label }]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`tab ${filter === key ? "tab-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-[var(--muted)]">Loading your tracker…</p>}
      {error && <p role="alert" className="text-[var(--danger)]">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="text-[var(--muted)]">
          Your tracker is empty. <Link href="/" className="underline">Search for something</Link> to add.
        </p>
      )}
      {!loading && items.length > 0 && visible.length === 0 && (
        <p className="text-[var(--muted)]">Nothing here yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {visible.map((item) => (
          <TrackerItem key={item._id} item={item} onUpdate={updateItem} onRemove={removeItem} />
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-3">
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="text-2xl font-bold">{value}</dd>
    </div>
  );
}
