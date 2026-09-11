#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const workTs = join(root, "src/data/work.ts");
const publicWork = join(root, "public/work");
const pagesRoot = join(publicWork, "pages");
const previewsRoot = join(publicWork, "previews");

function parseWork() {
  const src = readFileSync(workTs, "utf8");
  const items = [];
  const re =
    /pdfProject\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",[\s\S]*?,\s*(\d+)\),/g;

  for (const m of src.matchAll(re)) {
    items.push({
      id: m[1],
      number: m[2],
      title: m[3],
      category: m[4],
      pageCount: Number(m[5]),
    });
  }

  return items.sort((a, b) => Number(a.number) - Number(b.number));
}

function pdfPages(pdf) {
  if (!existsSync(pdf)) return null;
  try {
    const out = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
    return Number(out.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0) || null;
  } catch {
    return null;
  }
}

function expectedPageName(pageCount, page) {
  return `p-${String(page).padStart(String(pageCount).length, "0")}.png`;
}

function assetStatus(item) {
  const pdf = join(publicWork, `${item.id}.pdf`);
  const pdfPageCount = pdfPages(pdf);
  const pageDir = join(pagesRoot, item.id);
  const pageImages = existsSync(pageDir)
    ? readdirSync(pageDir).filter((f) => /^p-\d+\.png$/.test(f)).length
    : 0;
  const preview = existsSync(join(previewsRoot, `${item.id}.png`));
  const missingPages = [];

  for (let i = 1; i <= item.pageCount; i++) {
    const page = expectedPageName(item.pageCount, i);
    if (!existsSync(join(pageDir, page))) missingPages.push(page);
  }

  return {
    ...item,
    pdf: existsSync(pdf),
    pdfPageCount,
    pageImages,
    preview,
    localComplete:
      existsSync(pdf) &&
      pdfPageCount === item.pageCount &&
      pageImages === item.pageCount &&
      missingPages.length === 0 &&
      preview,
    missingPages,
  };
}

function render(id) {
  const pdf = join(publicWork, `${id}.pdf`);
  const pages = pdfPages(pdf);
  if (!pages) throw new Error(`Invalid PDF: ${pdf}`);

  const pageDir = join(pagesRoot, id);
  rmSync(pageDir, { recursive: true, force: true });
  mkdirSync(pageDir, { recursive: true });
  mkdirSync(previewsRoot, { recursive: true });

  execFileSync("pdftoppm", ["-png", "-r", "144", pdf, join(pageDir, "p")], {
    stdio: "ignore",
  });
  execFileSync(
    "pdftoppm",
    ["-png", "-f", "1", "-singlefile", "-scale-to", "900", pdf, join(previewsRoot, id)],
    { stdio: "ignore" },
  );

  return pages;
}

const cmd = process.argv[2] ?? "audit";

if (cmd === "audit") {
  const items = parseWork().map(assetStatus);
  const missing = items.filter((x) => !x.localComplete);
  console.log(
    JSON.stringify(
      {
        total: items.length,
        complete: items.length - missing.length,
        missing: missing.map((x) => ({
          id: x.id,
          pdf: x.pdf,
          expectedPages: x.pageCount,
          pdfPageCount: x.pdfPageCount,
          pageImages: x.pageImages,
          preview: x.preview,
          missingPages: x.missingPages,
        })),
      },
      null,
      2,
    ),
  );
} else if (cmd === "render") {
  const id = process.argv[3];
  if (!id) throw new Error("Usage: node scripts/portfolio-assets.mjs render <id>");
  console.log(render(id));
} else {
  throw new Error(`Unknown command: ${cmd}`);
}
