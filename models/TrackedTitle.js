import mongoose from "mongoose";

// One row per (user, title) the user has added to their tracker.
// The display fields (title, posterPath, genres...) are copied in when the
// title is added, so the tracker page renders with one query and no TMDB calls.
const trackedTitleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    posterPath: String,
    year: String,
    genres: [String],
    rating: Number,
    watched: { type: Boolean, default: false },
    personalRating: { type: Number, min: 1, max: 5, default: null },
    watchedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "addedAt", updatedAt: true } }
);

// A user can track a given title only once. A double-click on "Add" hits
// this index and gets a 409 instead of creating a duplicate.
trackedTitleSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

export default mongoose.models.TrackedTitle ||
  mongoose.model("TrackedTitle", trackedTitleSchema);
