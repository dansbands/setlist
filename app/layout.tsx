import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Set List",
  description: "Build, share, print, and export setlists for gigs and lessons.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
