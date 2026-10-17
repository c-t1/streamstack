import { isMediaType, validateCredentials, validateTrackerUpdate } from "@/lib/validators";

describe("validateCredentials", () => {
  test("accepts a valid email and 8+ character password", () => {
    expect(validateCredentials({ email: "a@b.co", password: "12345678" })).toEqual([]);
  });

  test("rejects a bad email and a short password", () => {
    const errors = validateCredentials({ email: "not-an-email", password: "short" });
    expect(errors).toHaveLength(2);
  });

  test("handles a missing body", () => {
    expect(validateCredentials()).toHaveLength(2);
  });
});

describe("validateTrackerUpdate", () => {
  test("keeps only watched and personalRating", () => {
    const { errors, update } = validateTrackerUpdate({ watched: true, personalRating: 4, user: "hacker" });
    expect(errors).toEqual([]);
    expect(update).toEqual({ watched: true, personalRating: 4 });
  });

  test("allows clearing the rating with null", () => {
    expect(validateTrackerUpdate({ personalRating: null }).update).toEqual({ personalRating: null });
  });

  test.each([0, 6, 3.5, "5"])("rejects personalRating %p", (rating) => {
    expect(validateTrackerUpdate({ personalRating: rating }).errors).toHaveLength(1);
  });

  test("rejects a non-boolean watched", () => {
    expect(validateTrackerUpdate({ watched: "yes" }).errors).toHaveLength(1);
  });

  test("rejects an empty update", () => {
    expect(validateTrackerUpdate({}).errors).toHaveLength(1);
  });
});

test("isMediaType only allows movie and tv", () => {
  expect(isMediaType("movie")).toBe(true);
  expect(isMediaType("tv")).toBe(true);
  expect(isMediaType("person")).toBe(false);
});
