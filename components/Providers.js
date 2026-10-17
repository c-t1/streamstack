"use client";

import { AuthProvider } from "@/context/AuthContext";
import { TrackerProvider } from "@/context/TrackerContext";

// layout.js is a Server Component and can't hold state itself, so it renders
// this client component, which holds the Context providers.
// TrackerProvider sits inside AuthProvider because it needs to know the user.
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <TrackerProvider>{children}</TrackerProvider>
    </AuthProvider>
  );
}
