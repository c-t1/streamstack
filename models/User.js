import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Only the bcrypt hash is stored. The plain password never touches the DB.
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// `mongoose.models.User ||` stops "Cannot overwrite model" errors when Next
// hot-reloads this file in dev.
export default mongoose.models.User || mongoose.model("User", userSchema);
