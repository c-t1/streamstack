import mongoose from "mongoose";

// A cache of TMDB title details. The detail route checks here first and only
// calls TMDB on a miss or when the copy is stale (cache-aside pattern).
const providerSchema = new mongoose.Schema(
  { name: String, logoPath: String },
  { _id: false }
);

const titleSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true },
  mediaType: { type: String, enum: ["movie", "tv"], required: true },
  title: { type: String, required: true },
  overview: String,
  posterPath: String,
  year: String,
  rating: Number,
  genres: [String],
  cast: [String],
  providers: {
    link: String,
    stream: [providerSchema],
    rent: [providerSchema],
    buy: [providerSchema],
  },
  cachedAt: { type: Date, default: Date.now },
});

// TMDB ids are only unique within a media type (movie 100 and tv 100 differ).
titleSchema.index({ tmdbId: 1, mediaType: 1 }, { unique: true });

export default mongoose.models.Title || mongoose.model("Title", titleSchema);
