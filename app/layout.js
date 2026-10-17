import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "StreamStack",
  description: "Find where to stream any movie or show, and track what you've watched.",
};

// The root layout wraps every page. It stays a Server Component; the
// interactive parts (Providers, NavBar) are client components inside it.
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <NavBar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-xs text-[var(--muted)]">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            Where-to-watch data provided by JustWatch.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
