import { posterUrl } from "@/lib/apiClient";

export default function ProviderList({ label, providers }) {
  if (!providers?.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</h3>
      <ul className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <li key={p.name} className="provider">
            {p.logoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl(p.logoPath, "w45")} alt="" className="h-6 w-6 rounded" />
            )}
            <span>{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
