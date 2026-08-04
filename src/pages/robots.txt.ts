import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) =>
  `
User-agent: *
Disallow: /pagefind/
Disallow: /404.html
Disallow: /_astro/

Sitemap: ${sitemapURL.href}
`.trim();

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
