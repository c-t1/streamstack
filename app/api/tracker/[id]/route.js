import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { validateTrackerUpdate } from "@/lib/validators";
import TrackedTitle from "@/models/TrackedTitle";

// Both handlers match on { _id, user }. If the id belongs to someone else,
// nothing matches and they get a 404, so they can't even tell it exists.

// PATCH /api/tracker/:id  { watched?, personalRating? }  ->  { item }   (Update)
export async function PATCH(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return jsonError("Log in to use the tracker.", 401);

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Tracker item not found.", 404);

  const body = await request.json().catch(() => null);
  const { errors, update } = validateTrackerUpdate(body ?? {});
  if (errors.length) return jsonError(errors.join(" "), 400);

  if ("watched" in update) update.watchedAt = update.watched ? new Date() : null;

  await connectDB();
  const item = await TrackedTitle.findOneAndUpdate({ _id: id, user: user.id }, update, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  if (!item) return jsonError("Tracker item not found.", 404);

  return NextResponse.json({ item });
}

// DELETE /api/tracker/:id  ->  { deleted: id }   (Delete)
export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return jsonError("Log in to use the tracker.", 401);

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Tracker item not found.", 404);

  await connectDB();
  const deleted = await TrackedTitle.findOneAndDelete({ _id: id, user: user.id });
  if (!deleted) return jsonError("Tracker item not found.", 404);

  return NextResponse.json({ deleted: id });
}
