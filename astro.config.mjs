// @ts-check
import { remarkAutoImport } from "./src/plugins/remarkAutoImport.js";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import md3Theme from "starlight-theme-md3";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";


// https://astro.build/config
export default defineConfig({
  site: "https://mnsb-archive.auspiceshirley.org",
  markdown: {
    processor: unified({
      remarkPlugins: [remarkAutoImport],
    }),
  },
  redirects: {
    "/": "/zh-hans",
  },
  integrations: [
    icon(),
    starlight({
      title: "Manosaba Archive",
      tableOfContents: false,
      logo: {
        src: "./src/assets/logo_title.webp",
      },
      favicon: "./favicon.ico",
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: "https://cdn.auspiceshirley.dev/preview-card/mnsb-archive/preview-card.webp" } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: "https://cdn.auspiceshirley.dev/preview-card/mnsb-archive/preview-card.webp" } },
        { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png", } },
        { tag: "link", attrs: { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png", } },
        { tag: "link", attrs: { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png", } },
        { tag: "link", attrs: { rel: "manifest", href: "/site.webmanifest" } },
      ],
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
        Pagination: "./src/components/Pagination.astro",
        Footer: "./src/components/Footer.astro",
        Head: "./src/components/Head.astro",
      },
      defaultLocale: "zh-hans",
      locales: {
        "zh-hans": { label: "简体中文", lang: "zh-Hans" },
        "zh-hant": { label: "繁體中文", lang: "zh-Hant" },
        en: { label: "English", lang: "en" },
        ja: { label: "日本語", lang: "ja" },
        ko: { label: "한국어", lang: "ko"},
      },
      plugins: [
        md3Theme({
          seed: "#6495ED",
          variant: "expressive",
          density: "comfortable",
          shape: "medium",
          tonalSurface: true,
          motion: true,
        }),
      ],
      customCss: ["./src/styles/index.css"],
      social: [],
    }),
    mdx(),
  ],
});
