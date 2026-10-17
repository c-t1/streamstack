import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "@/components/StarRating";

test("shows which star is selected", () => {
  render(<StarRating value={3} onChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Rate 3 stars" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Rate 4 stars" })).toHaveAttribute("aria-pressed", "false");
});

test("clicking a star calls onChange with that rating", async () => {
  const onChange = jest.fn();
  render(<StarRating value={null} onChange={onChange} />);
  await userEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
  expect(onChange).toHaveBeenCalledWith(4);
});

test("clicking the current rating clears it", async () => {
  const onChange = jest.fn();
  render(<StarRating value={2} onChange={onChange} />);
  await userEvent.click(screen.getByRole("button", { name: "Rate 2 stars" }));
  expect(onChange).toHaveBeenCalledWith(null);
});
