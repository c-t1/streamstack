// Pure functions: no database, no network. Easy to unit test.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials({ email, password } = {}) {
  const errors = [];
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push("A valid email is required.");
  }
  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  return errors;
}

export function isMediaType(value) {
  return value === "movie" || value === "tv";
}

// Only `watched` and `personalRating` can be changed. Anything else in the
// body is ignored, so a client can't PATCH its way into changing `user`.
export function validateTrackerUpdate(body = {}) {
  const errors = [];
  const update = {};

  if ("watched" in body) {
    if (typeof body.watched !== "boolean") errors.push("watched must be true or false.");
    else update.watched = body.watched;
  }

  if ("personalRating" in body) {
    const rating = body.personalRating;
    const valid = rating === null || (Number.isInteger(rating) && rating >= 1 && rating <= 5);
    if (!valid) errors.push("personalRating must be a whole number from 1 to 5, or null.");
    else update.personalRating = rating;
  }

  if (errors.length === 0 && Object.keys(update).length === 0) {
    errors.push("Nothing to update. Send watched and/or personalRating.");
  }

  return { errors, update };
}
