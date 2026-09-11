import gsap from "gsap";
import { hasLocalPages, pagePath, pdfPath, WORK_BY_ID, type WorkProject } from "../data/work";
import { prefersReducedMotion } from "../animation/motionConfig";
import { track } from "../analytics";

/**
 * In-site project reader. Opens over the presentation stage as a document
 * pulled from the index: the sheet clips open from the clicked row (clip only,
 * never scale — text must not distort), then the actual pages are readable
 * and scrollable. Cube navigation is suspended while open (the shell checks
 * body.viewer-open); the face/filter state underneath is untouched, so
 * closing returns exactly where the visitor left off.
 */

let host: HTMLElement | null = null;
let overlay: HTMLElement | null = null;
let currentId: string | null = null;
let context: string[] = [];
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

export function initProjectViewer(stageWindow: HTMLElement): void {
  host = stageWindow;
}

export function isViewerOpen(): boolean {
  return overlay !== null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildOverlay(p: WorkProject): HTMLElement {
  const root = el("section", "project-viewer");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", p.title);

  /* header */
  const header = el("header", "pv-header");
  const headline = el("div", "pv-headline");
  headline.append(el("span", "pv-number", p.number), el("h2", "pv-title", p.title));
  const close = el("button", "pv-close") as HTMLButtonElement;
  close.type = "button";
  close.innerHTML = `<span>Close</span> <span aria-hidden="true">✕</span>`;
  close.addEventListener("click", () => closeProject());
  header.append(headline, close);

  /* context column */
  const aside = el("aside", "pv-context");
  const meta = (label: string, value: string) => {
    const box = el("div", "pv-meta");
    box.append(el("span", "pv-meta-label", label), el("span", "pv-meta-value", value));
    return box;
  };
  aside.append(
    meta("Category", p.category),
    meta("Audience", p.audience),
    meta("Format", p.formats.join(" / ")),
    meta("Brief", p.description),
  );
  const actions = el("div", "pv-actions");
  if (hasLocalPages(p)) {
    const fullPdf = el("a", "ed-cta") as HTMLAnchorElement;
    fullPdf.href = pdfPath(p);
    fullPdf.target = "_blank";
    fullPdf.rel = "noopener";
    fullPdf.append(el("span", undefined, "Open full PDF"), el("span", "cta-arrow", "↗"));
    actions.appendChild(fullPdf);
  }
  if (/^https?:\/\//.test(p.originalUrl)) {
    const original = el("a", "pv-original") as HTMLAnchorElement;
    original.href = p.originalUrl;
    original.target = "_blank";
    original.rel = "noopener";
    original.textContent = "Original doc ↗";
    actions.appendChild(original);
  }
  aside.appendChild(actions);

  /* the actual work */
  const reader = el("div", "pv-reader");
  reader.setAttribute("aria-label", "Document pages");
  reader.tabIndex = 0;
  if (hasLocalPages(p)) {
    for (let i = 1; i <= p.pageCount!; i++) {
      const pageBox = el("figure", "pv-page");
      const img = el("img") as HTMLImageElement;
      img.src = pagePath(p, i);
      img.alt = `${p.title} — page ${i} of ${p.pageCount}`;
      img.loading = i <= 2 ? "eager" : "lazy";
      if (p.id === "web-plastikgas-investor-pitch-deck") pageBox.classList.add("pv-page--wide");
      pageBox.appendChild(img);
      pageBox.appendChild(el("figcaption", "pv-page-num", `${i} / ${p.pageCount}`));
      reader.appendChild(pageBox);
    }
  } else {
    const external = el("div", "pv-external");
    external.append(
      el("p", "pv-external-kicker", "External sample"),
      el("h3", undefined, p.title),
      el(
        "p",
        undefined,
        "This piece opens in a separate source document.",
      ),
    );
    const open = el("a", "ed-cta") as HTMLAnchorElement;
    open.href = p.originalUrl;
    open.target = "_blank";
    open.rel = "noopener";
    open.append(el("span", undefined, "Open sample"), el("span", "cta-arrow", "↗"));
    external.appendChild(open);
    reader.appendChild(external);
  }

  /* footer: prev / next within the context the project was opened from */
  const footer = el("footer", "pv-footer");
  const idx = context.indexOf(p.id);
  const prev = el("button", "pv-nav") as HTMLButtonElement;
  prev.type = "button";
  const prevProject = idx > 0 ? WORK_BY_ID[context[idx - 1]] : null;
  const nextProject =
    idx >= 0 && idx < context.length - 1 ? WORK_BY_ID[context[idx + 1]] : null;
  prev.innerHTML = prevProject
    ? `<span aria-hidden="true">←</span> <span>${prevProject.title}</span>`
    : "";
  prev.disabled = !prevProject;
  if (prevProject) prev.addEventListener("click", () => switchProject(prevProject.id));
  const next = el("button", "pv-nav pv-nav--next") as HTMLButtonElement;
  next.type = "button";
  next.innerHTML = nextProject
    ? `<span>${nextProject.title}</span> <span aria-hidden="true">→</span>`
    : "";
  next.disabled = !nextProject;
  if (nextProject) next.addEventListener("click", () => switchProject(nextProject.id));
  footer.append(prev, next);

  const main = el("div", "pv-main");
  main.append(aside, reader);
  root.append(header, main, footer);
  return root;
}

function trackProjectView(p: WorkProject): void {
  track("view_project", {
    project_id: p.id,
    project_title: p.title,
    project_category: p.category,
  });
}

function switchProject(id: string): void {
  if (!overlay || !host) return;
  const p = WORK_BY_ID[id];
  if (!p) return;
  currentId = id;
  trackProjectView(p);
  const fresh = buildOverlay(p);
  overlay.replaceWith(fresh);
  overlay = fresh;
  if (!prefersReducedMotion()) {
    gsap.from(fresh.querySelector(".pv-main"), { opacity: 0, duration: 0.2 });
  }
  fresh.querySelector<HTMLElement>(".pv-reader")?.focus({ preventScroll: true });
}

export function openProjectById(
  id: string,
  ctx: string[],
  originRect?: DOMRect,
): void {
  if (!host || overlay) return;
  const p = WORK_BY_ID[id];
  if (!p) return;
  currentId = id;
  context = ctx.length ? ctx : [id];
  trackProjectView(p);

  overlay = buildOverlay(p);
  host.appendChild(overlay);
  document.body.classList.add("viewer-open");

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeProject();
    } else if (e.key === "ArrowLeft") {
      const idx = context.indexOf(currentId!);
      if (idx > 0) switchProject(context[idx - 1]);
    } else if (e.key === "ArrowRight") {
      const idx = context.indexOf(currentId!);
      if (idx >= 0 && idx < context.length - 1) switchProject(context[idx + 1]);
    }
  };
  window.addEventListener("keydown", keyHandler);

  if (prefersReducedMotion() || !originRect) {
    overlay.querySelector<HTMLElement>(".pv-reader")?.focus({ preventScroll: true });
    return;
  }

  // open from the clicked row: clip-path only, so text never inherits scale
  const hostRect = host.getBoundingClientRect();
  const top = originRect.top - hostRect.top;
  const bottom = hostRect.bottom - originRect.bottom;
  gsap.fromTo(
    overlay,
    { clipPath: `inset(${top}px 0px ${bottom}px 0px)` },
    {
      clipPath: "inset(0px 0px 0px 0px)",
      duration: 0.38,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(overlay, { clearProps: "clipPath" });
        overlay?.querySelector<HTMLElement>(".pv-reader")?.focus({ preventScroll: true });
      },
    },
  );
  gsap.from(overlay.querySelectorAll(".pv-header, .pv-main, .pv-footer"), {
    opacity: 0,
    duration: 0.26,
    delay: 0.2,
  });
}

export function closeProject(immediate = false): void {
  if (!overlay) return;
  const node = overlay;
  overlay = null;
  currentId = null;
  if (keyHandler) {
    window.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }
  document.body.classList.remove("viewer-open");

  if (immediate || prefersReducedMotion()) {
    node.remove();
    return;
  }
  gsap.to(node, {
    clipPath: "inset(0px 0px 100% 0px)",
    duration: 0.3,
    ease: "power3.inOut",
    onComplete: () => node.remove(),
  });
}
