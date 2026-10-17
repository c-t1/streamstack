import Link from "next/link";
import Poster from "@/components/Poster";

// Presentational only: no state, no data fetching. Whatever action button
// belongs under the card (e.g. <TrackButton>) is passed in as children.
export default function TitleCard({ title, children }) {
  const href = `/title/${title.mediaType}/${title.tmdbId}`;
  return (
    <article className="card flex flex-col">
      <Link href={href} className="block">
        <Poster path={title.posterPath} title={title.title} className="aspect-[2/3] w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={href} className="font-semibold leading-tight hover:underline">
          {title.title}
        </Link>
        <p className="text-sm text-[var(--muted)]">
          <span className="badge">{title.mediaType === "tv" ? "TV" : "Movie"}</span>
          {title.year && <span> · {title.year}</span>}
          {title.rating ? <span> · ★ {title.rating}</span> : null}
        </p>
        {children && <div className="mt-auto pt-2">{children}</div>}
      </div>
    </article>
  );
}
