import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  description: "Building tools that fit how people work.",
  keywords: ["portfolio", "engineering", "AI", "automation", "web development", "industrial engineering"],
  authors: [{ name: "Sergio Arath Guzman" }],
  creator: "Sergio Arath Guzman",
  metadataBase: new URL("https://arath.site"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Arath Industries",
    title: "Arath Industries",
    description: "Building tools that fit how people work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arath Industries",
    description: "Building tools that fit how people work.",
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
        <Header />
        <main className="flex-1 relative z-[1]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
