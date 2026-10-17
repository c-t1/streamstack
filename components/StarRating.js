"use client";

// 1-5 stars. Clicking the current rating again clears it (sets null).
export default function StarRating({ value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value != null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={value === star}
            onClick={() => onChange(value === star ? null : star)}
            className={`star ${filled ? "star-filled" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
