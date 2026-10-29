import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API reads a live database on every request, so the app opts out of the
  // prerender-by-default model; the frontend owns caching.
  cacheComponents: false,
  serverExternalPackages: ["@libsql/client", "libsql"],
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        // The CMS and API must never appear in search: the public site is the frontend.
        // Uploads stay indexable because the frontend's pages and sitemap use them as images.
        source: "/((?!uploads/).*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
