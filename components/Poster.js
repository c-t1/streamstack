import { posterUrl } from "@/lib/apiClient";

// A plain <img> rather than next/image keeps TMDB images simple: no remote
// image config, and nothing counted against Vercel's image optimization quota.
export default function Poster({ path, title, size = "w342", className = "" }) {
  const src = posterUrl(path, size);
  if (!src) {
    return (
      <div className={`poster-placeholder ${className}`} aria-label={`No poster for ${title}`}>
        No poster
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`Poster for ${title}`} className={`poster ${className}`} loading="lazy" />;
}
