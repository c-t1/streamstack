import { render, screen } from "@testing-library/react";
import TitleCard from "@/components/TitleCard";

const movie = { tmdbId: 27205, mediaType: "movie", title: "Inception", year: "2010", posterPath: "/p.jpg", rating: 8.4 };

test("renders the title, year, rating, and a link to the detail page", () => {
  render(<TitleCard title={movie} />);
  expect(screen.getByRole("link", { name: "Inception" })).toHaveAttribute("href", "/title/movie/27205");
  expect(screen.getByText(/2010/)).toBeInTheDocument();
  expect(screen.getByText(/8\.4/)).toBeInTheDocument();
  expect(screen.getByAltText("Poster for Inception")).toHaveAttribute("src", "https://image.tmdb.org/t/p/w342/p.jpg");
});

test("shows a placeholder when there is no poster", () => {
  render(<TitleCard title={{ ...movie, posterPath: null }} />);
  expect(screen.getByLabelText("No poster for Inception")).toBeInTheDocument();
});

test("renders whatever action is passed as children", () => {
  render(<TitleCard title={movie}><button>Track it</button></TitleCard>);
  expect(screen.getByRole("button", { name: "Track it" })).toBeInTheDocument();
});
