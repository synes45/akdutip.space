// app/akis/page.tsx
// Server Component shell — renders the full-screen streaming dashboard.
// Keep this as a Server Component so metadata can be exported cleanly.

import type { Metadata } from "next";
import StreamingDashboard from "./StreamingDashboard";

export const metadata: Metadata = {
  title: "Akış Modu — Akdeniz Tıp",
  description:
    "Akdeniz Üniversitesi Tıp Fakültesi ders akış platformu. Videolar izleyin, notlar alın ve ilerlemenizi takip edin.",
};

export default function AkisPage() {
  return <StreamingDashboard />;
}
