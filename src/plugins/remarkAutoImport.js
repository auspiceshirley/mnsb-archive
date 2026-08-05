// @ts-check
// src/plugins/remarkAutoImport.js
import { parse } from "acorn";

export function remarkAutoImport() {
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    if (!file.path || !file.path.endsWith(".mdx")) return;

    const importStatements = `
      import { Aside, Badge, CardGrid, Code, FileTree, LinkButton, LinkCard, Steps, TabItem, Tabs } from "@astrojs/starlight/components";
      import MasonryGrid from "/src/components/MasonryGrid.astro";
      import LinkPreview from "/src/components/LinkPreview.astro";
      import Bilibili from "/src/components/Bilibili.astro";
      import ColorBar from "/src/components/ColorBar.astro";
      import TextMask from "/src/components/TextMask.astro";
      import YouTube from "/src/components/YouTube.astro";
      import Card from "/src/components/Card.astro";
      import Icon from "/src/components/Icon.astro";
      import { Tweet } from "astro-embed";
    `;

    const estree = parse(importStatements, {
      sourceType: "module",
      ecmaVersion: "latest",
    });

    tree.children.unshift({
      type: "mdxjsEsm",
      value: importStatements,
      data: { estree },
    });
  };
}
