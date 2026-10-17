import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/SearchBar";

test("submits the trimmed query", async () => {
  const onSearch = jest.fn();
  render(<SearchBar onSearch={onSearch} />);
  await userEvent.type(screen.getByLabelText(/search movies and shows/i), "  inception  ");
  await userEvent.click(screen.getByRole("button", { name: "Search" }));
  expect(onSearch).toHaveBeenCalledWith("inception");
});

test("the button is disabled until something is typed", async () => {
  render(<SearchBar onSearch={jest.fn()} />);
  const button = screen.getByRole("button", { name: "Search" });
  expect(button).toBeDisabled();
  await userEvent.type(screen.getByLabelText(/search movies and shows/i), "dune");
  expect(button).toBeEnabled();
});
