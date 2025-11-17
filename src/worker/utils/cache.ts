import { cache } from "hono/cache";

export const addCache = (name: string, time: "1hr" | "4hr" | "12hr") => {
  const cacheControlMap: Record<string, string> = {
    "1hr": "public, max-age=3600, stale-while-revalidate=900",
    "4hr": "public, max-age=14400, stale-while-revalidate=3600",
    "12hr": "public, max-age=43200, stale-while-revalidate=10800",
  };

  return cache({
    cacheName: name,
    cacheControl: cacheControlMap[time],
  });
};

export const addSearchCache = (name: string) => {
  return cache({
    cacheName: name,
    cacheControl: "public, max-age=3600, stale-while-revalidate=900",
    keyGenerator: (c) => {
      const url = new URL(c.req.url);
      // Normalize query: lowercase, trim, extract params
      const q = url.searchParams.get("q")?.toLowerCase().trim() || "";
      const page = url.searchParams.get("page") || "1";
      const limit = url.searchParams.get("limit") || "20";

      // Create normalized cache key
      return `${url.pathname}?q=${q}&page=${page}&limit=${limit}`;
    },
  });
};
