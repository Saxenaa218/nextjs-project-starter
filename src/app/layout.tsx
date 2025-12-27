import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Compressor - Fast and Easy Video Compression",
  description: "Compress your videos quickly and easily with advanced compression options. Reduce file size while maintaining quality.",
  keywords: ["video", "compression", "video compressor", "compress video", "reduce video size"],
  authors: [{ name: "Video Compressor" }],
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
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
