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
    ];
  },
};

export default nextConfig;
