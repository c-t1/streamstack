// Browser-side helper for calling our own /api routes.
// Throws an Error carrying the server's { error } message on any non-2xx.
export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function posterUrl(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
