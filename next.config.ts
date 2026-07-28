import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
