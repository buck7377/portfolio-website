# Zachary Clark Portfolio

An editorial copywriting portfolio built with vanilla TypeScript, GSAP, and
Vite. The site opens on a work index and uses a 3D folder/page-turn interaction
to move through portfolio categories.

## Run Locally

```bash
npm install
npm run dev
npm run build
npm run preview
```

The dev server defaults to `http://localhost:5173`.

## Structure

- `src/main.ts` builds the fixed shell, section tabs, routing, and viewer boot.
- `src/data/sections.ts` owns About, Experience, Contact, and section-level copy.
- `src/data/work.ts` owns the live portfolio index.
- `src/render/renderPage.ts` renders the data-driven face layouts.
- `src/viewer/projectViewer.ts` opens PDFs in the in-site reader.
- `src/styles/` contains the visual system split by shell, stage, editorial,
  and portfolio-specific styles.
- `public/` contains all runtime assets Vite ships as-is.
- `pdfs/` contains the original source PDFs grouped by portfolio category.

## Portfolio Content

The live work index is organized into four faces:

- SEO Blogs & Articles
- Website & Brand Copy
- Email & Outreach
- Social, Ads & Scripts

Each item in `src/data/work.ts` points to:

- `public/work/<id>.pdf`
- `public/work/previews/<id>.png`
- `public/work/pages/<id>/p-*.png`

The site uses the rendered page images for fast in-site reading and links to the
full local PDF for download/opening.

## Adding Or Replacing A Sample

1. Add the source PDF to the right folder under `pdfs/`.
2. Copy it to `public/work/<id>.pdf`.
3. Render reader assets:

```bash
mkdir -p public/work/pages/<id> public/work/previews
pdftoppm -png -r 144 public/work/<id>.pdf public/work/pages/<id>/p
pdftoppm -png -f 1 -singlefile -scale-to 900 public/work/<id>.pdf public/work/previews/<id>
```

4. Add or update the matching `pdfProject(...)` entry in `src/data/work.ts`.
5. Run `npm run build`.

## Publishing Notes

The repo includes `.github/workflows/deploy.yml`, which builds the Vite app and
publishes `dist/` to GitHub Pages on every push to `main`.

Commit source and runtime assets, but do not commit generated dependencies or
local build output:

- Commit: `src/`, `public/`, `pdfs/`, `scripts/`, `index.html`,
  `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`,
  `.github/`, `.gitignore`, and `README.md`.
- Ignore: `node_modules/` and `dist/`.

In the GitHub repository settings, set Pages to deploy from **GitHub Actions**.
The Vite `base: "./"` setting keeps asset paths portable for project-page
hosting.
