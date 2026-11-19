import { readFileSync } from "node:fs";
import path from "node:path";

import index from "./registry-index.json";

export type Item = {
  name: string;
  title: string;
  type: "ui" | "site" | "product" | "visual" | "block" | "hook" | "lib";
  surface: "site" | "product" | "both";
  description: string;
  kinds: string[];
  use_for: string;
  never: string[];
  source?: string;
  /** Blocks only: the rail group (section blocks, page templates or app shells). */
  group?: "blocks" | "pages" | "shells";
  paths: string[];
  dependencies: string[];
  npm: string[];
  examples: string[];
  body: string;
  exports: string[];
  client: boolean;
};

export const registryName = index.name;
export const registryUrl = index.url;
export const REPO = "https://github.com/anwarlemu/mireye-brand-cli";
export const BRAND_SITE = "https://mireye.com";
export const INSTALL_COMMAND = "npm install --save-dev github:anwarlemu/mireye-brand-cli#release";
export const CLI_COMMAND = "npx -y github:anwarlemu/mireye-brand-cli#release";
export const items = (index.items as Item[]).filter((i) => i.type !== "lib" && i.type !== "hook").sort((a, b) => a.title.localeCompare(b.title));

export const findItem = (name: string) => items.find((i) => i.name === name);

const root = path.join(process.cwd(), "../../registry");
export const sourceOf = (rel: string) => readFileSync(path.join(root, rel), "utf8");
export const exampleSource = (name: string) => sourceOf(`examples/${name}.tsx`);

// These demos open overlays, lock scrolling or take the whole viewport. Keep those effects inside a frame.
const FRAMED = new Set(["alert-dialog", "combobox", "command", "context-menu", "date-picker", "dialog", "drawer", "dropdown-menu", "hover-card", "menubar", "navigation-menu", "popover", "select", "sheet", "sidebar", "sonner", "toast", "tooltip"]);
// Blocks (sections, pages and app shells) render in a frame too, so their breakpoints follow the frame's width.
export const needsPreviewFrame = (item: Pick<Item, "name" | "type">) => FRAMED.has(item.name) || item.type === "block";
