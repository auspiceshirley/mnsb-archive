// src/scripts/sync-docs.js
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "src", "content", "docs");

const sourceLocale = "zh-hans";
const targetLocales = ["zh-hant", "en", "ja", "ko"];

const sharedFolders = ["bilibili", "website", "youtube"];

const isWindows = process.platform === "win32";

for (const locale of targetLocales) {
  for (const folder of sharedFolders) {
    const srcPath = path.join(docsDir, sourceLocale, folder);
    const targetDir = path.join(docsDir, locale);
    const targetPath = path.join(targetDir, folder);

    // Skip if source directory does not exist
    if (!fs.existsSync(srcPath)) {
      console.warn(
        `[Sync Docs] Warning: Source path does not exist, skipping mapping -> ${srcPath}`,
      );
      continue;
    }

    // Ensure target locale directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Clean up stale symlinks or existing directories
    const stats = fs.lstatSync(targetPath, { throwIfNoEntry: false });
    if (stats) {
      try {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } catch (err) {
        console.error(
          `[Sync Docs] Failed to clean up existing mapping: ${targetPath}`,
          err,
        );
      }
    }

    // Use 'junction' on Windows to bypass administrator privileges; 'dir' on Linux/macOS
    const symlinkType = isWindows ? "junction" : "dir";

    try {
      fs.symlinkSync(srcPath, targetPath, symlinkType);
      console.log(
        `[Sync Docs] Mapped: ${sourceLocale}/${folder}  ==>  ${locale}/${folder}`,
      );
    } catch (err) {
      console.error(
        `[Sync Docs] Failed to create symlink (${folder}):`,
        err.message,
      );
    }
  }
}
