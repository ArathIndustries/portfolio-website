import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MouseGlow } from "@/components/neon";
import { NeonGrid } from "@/components/neon";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Arath Industries",
    template: "%s | Arath Industries",
  },
  description: "Building tools fit for how people work.",
  keywords: ["portfolio", "engineering", "AI", "automation", "web development", "industrial engineering"],
  authors: [{ name: "Sergio Arath Guzman" }],
  creator: "Sergio Arath Guzman",
  metadataBase: new URL("https://arathindustries.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Arath Industries",
    title: "Arath Industries",
    description: "Building tools fit for how people work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arath Industries",
    description: "Building tools fit for how people work.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="brick-wall" aria-hidden="true" />
        <MouseGlow />
        <Header />
        {/* MouseGlow provides global cursor light. On the landing page,
            SparkCanvas has its own mask — MouseGlow sits beneath it (same z-index,
            SparkCanvas mask overwrites via DOM order). */}
        <main className="flex-1 flex flex-col relative z-[2]">
          <NeonGrid>{children}</NeonGrid>
        </main>
        <Footer />
      </body>
    </html>
  );
}
