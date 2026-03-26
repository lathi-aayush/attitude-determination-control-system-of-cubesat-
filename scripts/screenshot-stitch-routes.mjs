#!/usr/bin/env node
/**
 * Capture the three Vite routes for side-by-side comparison with Stitch reference PNGs.
 *
 * Prerequisites: dev or preview server running (default http://127.0.0.1:5173).
 *
 *   npm run preview:web   # terminal 1 — serves dist after build
 *   npm run screenshot:stitch   # terminal 2
 *
 * Compare outputs with:
 *   stitch/project_page_glassmorphism_space_theme/screen.png
 *   stitch/learning_page_glassmorphism_space_theme/screen.png
 *   stitch/components_page_glassmorphism_space_theme/screen.png
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(REPO_ROOT, ".screenshots");

const BASE =
  process.env.VITE_SCREENSHOT_BASE?.replace(/\/$/, "") ?? "http://127.0.0.1:5173";

const ROUTES = [
  { path: "/", file: "vite-project.png", stitch: "stitch/project_page_glassmorphism_space_theme/screen.png" },
  { path: "/learning", file: "vite-learning.png", stitch: "stitch/learning_page_glassmorphism_space_theme/screen.png" },
  { path: "/components", file: "vite-components.png", stitch: "stitch/components_page_glassmorphism_space_theme/screen.png" },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    });

    for (const r of ROUTES) {
      const url = `${BASE}${r.path}`;
      const outPath = path.join(OUT_DIR, r.file);
      process.stderr.write(`Capturing ${url} …\n`);
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 90_000,
      });
      await new Promise((res) => setTimeout(res, 500));
      await page.screenshot({ path: outPath, fullPage: true, type: "png" });
      const ref = path.join(REPO_ROOT, r.stitch);
      process.stderr.write(`  → ${outPath}\n  → Reference: ${ref}\n---\n`);
      console.log(outPath);
    }
  } finally {
    await browser.close();
  }
  process.stderr.write(
    "\nIn Cursor: attach vite-*.png and the matching stitch screen.png; ask to align spacing/typography.\n"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
