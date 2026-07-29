import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 2026-07-28 ruling: arathindustries.com is primary. arath.site stays
      // registered forever and redirects in, so the resume PDF, GitHub profile,
      // and anything already printed keep resolving. www folds into the apex so
      // one canonical host serves. Host rules live here rather than in the
      // Vercel dashboard so they are version-controlled and deploy with the app.
      {
        source: "/:path*",
        has: [{ type: "host", value: "arath.site" }],
        destination: "https://arathindustries.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arath.site" }],
        destination: "https://arathindustries.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arathindustries.com" }],
        destination: "https://arathindustries.com/:path*",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/projects/:slug",
        destination: "/work/:slug",
        permanent: true,
      },
      // 2026-07-26 IA ruling: Blog + Publications merged into the one writing feed
      {
        source: "/blog",
        destination: "/forged/notes",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/forged/notes/:slug",
        permanent: true,
      },
      {
        source: "/publications",
        destination: "/forged/notes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
