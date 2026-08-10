// src/components/StarlightIcons.ts
import { Icons as RawIcons } from "../../node_modules/@astrojs/starlight/components-internals/Icons";

export const Icons = RawIcons;
export type StarlightIcon = keyof typeof RawIcons;
