#!/usr/bin/env node
/**
 * Capture a full-page PNG of a localhost (or any) URL for visual comparison in Cursor.
 *
 * Usage:
 *   npm run screenshot -- http://localhost:3000
 *   npx screenshot-local http://localhost:3000
 *   npm run screenshot -- --url http://localhost:5173 --out ./.screenshots/my-page.png
 *   npx screenshot-local --help
 *
 * Workflow: start your dev server, run this, attach the PNG in Cursor with:
 *   "Compare this screenshot to the Figma mockup and fix spacing/typography."
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, ".screenshots");

function parseArgs(argv) {
  const args = {
    url: "http://localhost:3000",
    out: null,
    width: 1920,
    height: 1080,
    fullPage: true,
    waitUntil: "networkidle0",
    deviceScaleFactor: 2,
    timeout: 60_000,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") return { help: true };
    if (a === "--url" || a === "-u") {
      args.url = argv[++i];
      continue;
    }
    if (a === "--out" || a === "-o") {
      args.out = argv[++i];
      continue;
    }
    if (a === "--width" || a === "-W") {
      args.width = Number(argv[++i]);
      continue;
    }
    if (a === "--height" || a === "-H") {
      args.height = Number(argv[++i]);
      continue;
    }
    if (a === "--no-full-page") {
      args.fullPage = false;
      continue;
    }
    if (a === "--wait-until") {
      args.waitUntil = argv[++i];
      continue;
    }
    if (a === "--dpr" || a === "--device-scale-factor") {
      args.deviceScaleFactor = Number(argv[++i]);
      continue;
    }
    if (a === "--timeout") {
      args.timeout = Number(argv[++i]);
      continue;
    }
    if (a.startsWith("-")) {
      console.error(`Unknown option: ${a}`);
      process.exit(1);
    }
    if (!a.startsWith("http://") && !a.startsWith("https://")) {
      console.error(`Expected URL starting with http(s)://, got: ${a}`);
      process.exit(1);
    }
    args.url = a;
  }

  return args;
}

function printHelp() {
  console.log(`
Puppeteer screenshot — capture a page for Cursor / Figma comparison

Usage:
  npm run screenshot -- [url] [options]
  npm run puppeteer -- [url] [options]
  npx screenshot-local [url] [options]

Arguments:
  url                     Default: http://localhost:3000

Options:
  -u, --url <url>         Page URL to capture
  -o, --out <path>        Output PNG path (default: .screenshots/screenshot-<timestamp>.png)
  -W, --width <px>        Viewport width (default: 1920)
  -H, --height <px>       Viewport height (default: 1080)
      --no-full-page      Capture viewport only (not full scrollable page)
      --wait-until <mode> load | domcontentloaded | networkidle0 | networkidle2 (default: networkidle0)
      --dpr <n>           Device pixel ratio for sharper text (default: 2)
      --timeout <ms>      Navigation timeout (default: 60000)
  -h, --help              Show this help

Example:
  npm run screenshot -- http://localhost:3000
  npx screenshot-local http://localhost:3000
  npm run screenshot -- -u http://127.0.0.1:4173 -o ./.screenshots/preview.png
`);
}

function defaultOutputPath() {
  fs.mkdirSync(DEFAULT_OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(DEFAULT_OUT_DIR, `screenshot-${stamp}.png`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  const outPath = path.resolve(parsed.out ?? defaultOutputPath());
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });

  console.error(`Opening ${parsed.url} …`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: parsed.width,
      height: parsed.height,
      deviceScaleFactor: parsed.deviceScaleFactor,
    });
    await page.goto(parsed.url, {
      waitUntil: parsed.waitUntil,
      timeout: parsed.timeout,
    });
    await page.screenshot({
      path: outPath,
      fullPage: parsed.fullPage,
      type: "png",
    });
    console.log(outPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  const msg = String(err?.message ?? err);
  if (msg.includes("Could not find Chrome")) {
    console.error(
      "\nInstall the bundled browser: npm run puppeteer:install\n"
    );
  }
  process.exit(1);
});
