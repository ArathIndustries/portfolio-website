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
    default: "Sergio Arath Guzman | Industrial Engineer",
    template: "%s | Sergio Arath Guzman",
  },
  description: "Industrial Engineer who cannot stop tinkering.",
  keywords: ["portfolio", "engineering", "AI", "automation", "web development", "industrial engineering", "civil engineering"],
  authors: [{ name: "Sergio Arath Guzman" }],
  creator: "Sergio Arath Guzman",
  metadataBase: new URL("https://arath.site"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sergio Arath Guzman",
    title: "Sergio Arath Guzman | Industrial Engineer",
    description: "Industrial Engineer who cannot stop tinkering.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sergio Arath Guzman | Industrial Engineer",
    description: "Industrial Engineer who cannot stop tinkering.",
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
