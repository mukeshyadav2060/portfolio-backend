import type { MetadataRoute } from "next";

/** Nothing here is for search engines except the uploaded images the public site shows. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/uploads/", disallow: "/" },
  };
}
