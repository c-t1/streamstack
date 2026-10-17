"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

// The logged-in user's tracked titles. Search results, the detail page, and
// the tracker page all read from here, so "Add" on one page shows up on the others.
const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reload whenever the logged-in user changes (login, logout, switch).
  useEffect(() => {
    if (!user) return;
    let ignore = false; // drop the response if the user changed mid-request

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch("/api/tracker");
        if (!ignore) setItems(data.items);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  const visibleItems = user ? items : [];

  function findItem(tmdbId, mediaType) {
    return visibleItems.find((item) => item.tmdbId === tmdbId && item.mediaType === mediaType);
  }

  async function addTitle(tmdbId, mediaType) {
    const { item } = await apiFetch("/api/tracker", {
      method: "POST",
      body: JSON.stringify({ tmdbId, mediaType }),
    });
    setItems((prev) => [item, ...prev]);
    return item;
  }

  async function updateItem(id, changes) {
    const { item } = await apiFetch(`/api/tracker/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    setItems((prev) => prev.map((existing) => (existing._id === id ? item : existing)));
    return item;
  }

  async function removeItem(id) {
    await apiFetch(`/api/tracker/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((existing) => existing._id !== id));
  }

  return (
    <TrackerContext.Provider
      value={{ items: visibleItems, loading, error, findItem, addTitle, updateItem, removeItem }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used inside <TrackerProvider>");
  return context;
}
