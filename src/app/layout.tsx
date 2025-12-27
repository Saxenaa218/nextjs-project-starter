import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Concatenator - Merge Multiple Videos",
  description: "Upload, reorder, and concatenate multiple videos into a single file using browser-based processing",
  keywords: ["video", "concatenate", "merge", "ffmpeg", "video editor", "nextjs"],
  authors: [{ name: "Abhishek Saxena" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
