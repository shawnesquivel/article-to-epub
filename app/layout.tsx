import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Footer from "../src/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "Blog to EPUB",
  description: "Convert any blog post into a downloadable EPUB for Apple Books.",
  openGraph: {
    title: "Blog to EPUB",
    description: "Convert any blog post into a downloadable EPUB for Apple Books.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Open book on a table" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog to EPUB",
    description: "Convert any blog post into a downloadable EPUB for Apple Books.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
