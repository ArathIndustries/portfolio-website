import type { NextConfig } from "next";

/**
 * No bundler wiring is needed for the RemotionPlayer block any more.
 *
 * It used to need three things here: a "@remotion-lab" alias into the checkout
 * beside this repo, turbopack.root raised to the folder holding both, and
 * aliases forcing one copy of remotion because the checkout has its own
 * node_modules. All three built on this desktop and would have failed on
 * Vercel, which builds this repository from GitHub and has no such checkout.
 * The four files the composition needs are vendored into src/remotion/mathviz/
 * instead (see that folder's README.md), so every import resolves inside this
 * repo and the single-copy problem cannot arise. Measured 2026-11-22 by
 * counting a string that appears only in remotion/dist/esm/index.mjs across
 * .next/static/chunks: 1 occurrence, with no aliases at all.
 *
 * transpilePackages is likewise unnecessary: the vendored .tsx sits under this
 * directory, which Next compiles by default.
 */
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
