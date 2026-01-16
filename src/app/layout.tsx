import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Arath Pena | Design Engineer",
    template: "%s | Arath Pena",
  },
  description: "Design Engineer exploring AI and automation. Building tools that bridge engineering and technology.",
  keywords: ["portfolio", "engineering", "AI", "automation", "web development", "civil engineering"],
  authors: [{ name: "Arath Pena" }],
  creator: "Arath Pena",
  metadataBase: new URL("https://arathpena.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Arath Pena",
    title: "Arath Pena | Design Engineer",
    description: "Design Engineer exploring AI and automation. Building tools that bridge engineering and technology.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arath Pena | Design Engineer",
    description: "Design Engineer exploring AI and automation. Building tools that bridge engineering and technology.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
