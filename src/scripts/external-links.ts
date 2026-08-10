// src/scripts/external-links.ts

function handleExternalLinks() {
  const currentHost = window.location.hostname;

  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[href^="http://"], a[href^="https://"]',
  );

  links.forEach((link) => {
    try {
      const url = new URL(link.href, window.location.href);

      if (url.hostname !== currentHost) {
        link.setAttribute("target", "_blank");

        const existingRel = link.getAttribute("rel") || "";
        const relSet = new Set(existingRel.split(" ").filter(Boolean));
        relSet.add("noopener");

        link.setAttribute("rel", Array.from(relSet).join(" "));
      }
    } catch {}
  });
}

document.addEventListener("astro:page-load", handleExternalLinks);

document.addEventListener(
  "click",
  (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest("a") as HTMLAnchorElement | null;

    if (link && link.href) {
      const isExternalScheme =
        link.href.startsWith("http://") || link.href.startsWith("https://");

      if (isExternalScheme) {
        try {
          const url = new URL(link.href, window.location.href);
          if (url.hostname !== window.location.hostname) {
            link.setAttribute("target", "_blank");

            const existingRel = link.getAttribute("rel") || "";
            const relSet = new Set(existingRel.split(" ").filter(Boolean));
            relSet.add("noopener");

            link.setAttribute("rel", Array.from(relSet).join(" "));
          }
        } catch {}
      }
    }
  },
  true,
);
