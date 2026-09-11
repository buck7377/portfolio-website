import type { PageContent, StoryPage } from "../data/types";
import {
  CHAPTERS,
  chapterProjectCount,
  hasLocalPages,
  previewPath,
  WORK_BY_ID,
  type WorkProject,
} from "../data/work";

type Nav = (sectionId: string, face?: number) => void;

/** Ask the shell to open the in-site project reader. */
function openProject(id: string, context: string[], rect?: DOMRect): void {
  document.dispatchEvent(new CustomEvent("open-project", { detail: { id, context, rect } }));
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

/** Wrap a node in an overflow-hidden mask so it can slide in from below. */
function mask(node: HTMLElement): HTMLElement {
  const wrap = el("div", "text-mask");
  node.classList.add("mask-inner");
  node.dataset.reveal = "mask";
  wrap.appendChild(node);
  return wrap;
}

function fade(node: HTMLElement, delayGroup = 0): HTMLElement {
  node.dataset.reveal = "fade";
  node.dataset.revealGroup = String(delayGroup);
  return node;
}

/** A 1px rule that lives in the content flow, so it always aligns with text. */
function contentRule(delay = 0.15): HTMLElement {
  const rule = el("div", "content-rule");
  rule.dataset.reveal = "line";
  rule.dataset.delay = String(delay);
  return rule;
}

/** Absolute top-edge rule for grid/flex rows. */
function rowRule(delay: number): HTMLElement {
  const rule = el("div", "row-rule");
  rule.dataset.reveal = "line";
  rule.dataset.delay = String(delay);
  return rule;
}

function heading(text: string, cls = "ed-display"): HTMLElement {
  const block = el("div", "heading-block");
  block.append(mask(el("h2", cls, text)), contentRule());
  return block;
}

function eyebrowEl(text: string): HTMLElement {
  return mask(el("p", "ed-eyebrow", text));
}

function bodyEl(text: string): HTMLElement {
  return fade(el("p", "ed-body", text));
}

function structureLayer(page: StoryPage): HTMLElement {
  const layer = el("div", "face-structure");
  for (const line of page.gridLines) {
    const isH = line.orientation === "horizontal";
    const rule = el("div", `rule ${isH ? "rule--h" : "rule--v"}`);
    rule.style.left = line.x;
    rule.style.top = line.y;
    if (isH) rule.style.width = line.length;
    else rule.style.height = line.length;
    rule.dataset.origin = line.origin;
    rule.dataset.delay = String(line.delay ?? 0);
    layer.appendChild(rule);
  }
  return layer;
}

/* ---------- per-layout content renderers ---------- */

function renderHero(c: Extract<PageContent, { layout: "hero" }>, nav: Nav): HTMLElement[] {
  const eyebrow = el("div", "hero-eyebrow");
  eyebrow.appendChild(eyebrowEl(c.eyebrow));

  const main = el("div", "hero-main");
  const h1 = el("h1", "ed-hero-title");
  for (const line of c.title) {
    const m = mask(el("span", undefined, line));
    h1.appendChild(m);
  }
  main.appendChild(h1);
  main.appendChild(bodyEl(c.subhead));
  main.appendChild(fade(el("p", "hero-support", c.support), 1));

  const foot = el("div", "hero-foot");
  const primary = el("button", "ed-cta");
  primary.append(el("span", undefined, c.primaryCta.label), el("span", "cta-arrow", "→"));
  primary.addEventListener("click", () => nav(c.primaryCta.section));
  const secondary = el("button", "ed-cta");
  secondary.append(el("span", undefined, c.secondaryCta.label), el("span", "cta-arrow", "→"));
  secondary.addEventListener("click", () => nav(c.secondaryCta.section));
  foot.append(fade(primary, 2), fade(secondary, 2));

  return [eyebrow, main, foot];
}

function renderStatement(c: Extract<PageContent, { layout: "statement" }>): HTMLElement[] {
  const cols = el("div", "statement-cols");
  c.columns.forEach((col, i) => {
    const box = el("div", "statement-col");
    box.append(rowRule(0.3 + i * 0.1), el("h3", undefined, col.title), el("p", undefined, col.text));
    cols.appendChild(fade(box, 1 + i));
  });
  return [heading(c.heading), bodyEl(c.body), cols];
}

function renderStats(c: Extract<PageContent, { layout: "stats" }>): HTMLElement[] {
  const grid = el("div", "stats-grid");
  c.stats.forEach((s, i) => {
    const block = el("div", "stat-block");
    block.append(
      rowRule(0.25 + i * 0.1),
      mask(el("span", "stat-value", s.value)),
      fade(el("span", "stat-label", s.label), 1 + i),
    );
    grid.appendChild(block);
  });
  return [heading(c.heading), grid];
}

function renderIndex(
  c: Extract<PageContent, { layout: "index" }>,
  nav: Nav,
): HTMLElement[] {
  const rows = el("div", "index-rows");
  c.rows.forEach((r, i) => {
    const link = c.rowLink;
    const row = el(link ? "button" : "div", "index-row");
    if (link) {
      row.classList.add("is-link");
      row.addEventListener("click", () => nav(link.section, link.faceOffset + i));
    }
    row.append(
      rowRule(0.2 + i * 0.08),
      el("span", "row-title", r.title),
      el("span", "row-desc", r.desc),
    );
    rows.appendChild(fade(row, 1 + i));
  });
  return [heading(c.heading), bodyEl(c.intro), rows];
}

function renderDiary(c: Extract<PageContent, { layout: "diary" }>): HTMLElement[] {
  const meta = el("div", "diary-meta");
  meta.appendChild(mask(el("p", "ed-eyebrow", c.date)));
  const body = el("div", "diary-body");
  c.paragraphs.forEach((p, i) => body.appendChild(fade(el("p", "ed-body", p), 1 + i)));
  const out: HTMLElement[] = [meta, heading(c.title), body];
  if (c.tags?.length) {
    const tags = el("ul", "callout-list");
    c.tags.forEach((t, i) => tags.appendChild(fade(el("li", undefined, t), 4 + i)));
    out.push(tags);
  }
  return out;
}

function renderFeature(c: Extract<PageContent, { layout: "feature" }>): HTMLElement[] {
  const out: HTMLElement[] = [heading(c.heading), bodyEl(c.body)];
  if (c.callouts) {
    const list = el("ul", "callout-list");
    c.callouts.forEach((t, i) => list.appendChild(fade(el("li", undefined, t), 1 + i)));
    out.push(list);
  } else if (c.strip) {
    out.push(renderStrip(c.strip));
  }
  if (c.fact) {
    const fact = el("div", "feature-fact");
    fact.appendChild(el("p", "fact-lede", c.fact.lede));
    if (c.fact.note) fact.appendChild(el("p", "ed-meta", c.fact.note));
    out.push(fade(fact, 3));
  }
  if (c.callouts && c.strip) out.splice(2, 0, renderStrip(c.strip));
  return out;
}

function renderStrip(items: string[]): HTMLElement {
  const strip = el("div", "proof-strip");
  items.forEach((t, i) => {
    if (i > 0) strip.appendChild(el("span", "strip-arrow", "→"));
    strip.appendChild(fade(el("span", undefined, t), 2 + i));
  });
  return strip;
}

function renderBiglist(c: Extract<PageContent, { layout: "biglist" }>): HTMLElement[] {
  const list = el("ul", "biglist");
  c.items.forEach((t, i) => {
    const li = el("li");
    li.append(el("span", "li-index", String(i + 1).padStart(2, "0")));
    li.append(document.createTextNode(t));
    list.appendChild(mask(li));
  });
  const out = [heading(c.heading), bodyEl(c.body), list];
  if (c.note) out.push(fade(el("p", "ed-meta", c.note), 4));
  return out;
}

function renderSequence(c: Extract<PageContent, { layout: "sequence" }>): HTMLElement[] {
  const head = el("div", "seq-head");
  head.append(heading(c.heading), bodyEl(c.body));

  const words = el("ul", "seq-words");
  c.words.forEach((w, i) => {
    const li = el("li");
    li.append(el("span", "seq-idx", String(i + 1).padStart(2, "0")), el("span", undefined, w));
    words.appendChild(mask(li));
  });

  const side = el("div", "seq-side");
  side.appendChild(fade(el("p", "ed-body", c.side), 3));

  return [head, words, side];
}

function renderMatrix(c: Extract<PageContent, { layout: "matrix" }>): HTMLElement[] {
  const grid = el("div", "matrix");
  c.columns.forEach((col, i) => {
    const box = el("div", "matrix-col");
    box.appendChild(el("h3", undefined, col.title));
    const ul = el("ul");
    col.items.forEach((t) => ul.appendChild(el("li", undefined, t)));
    box.appendChild(ul);
    grid.appendChild(fade(box, 1 + i));
  });
  return [heading(c.heading), grid];
}

function renderKeywords(c: Extract<PageContent, { layout: "keywords" }>): HTMLElement[] {
  const wall = el("ul", "keyword-wall");
  c.words.forEach((w) => wall.appendChild(mask(el("li", undefined, w))));
  return [heading(c.heading), bodyEl(c.body), wall];
}

function renderStep(c: Extract<PageContent, { layout: "step" }>): HTMLElement[] {
  const num = el("div", "step-num");
  num.appendChild(mask(el("span", "ed-num", c.number)));

  const main = el("div", "step-main");
  main.append(heading(c.heading), bodyEl(c.body));

  const aux = el("div", "step-aux");
  if (c.labels) {
    const ul = el("ul", "step-labels");
    c.labels.forEach((t, i) => ul.appendChild(fade(el("li", undefined, t), 2 + i)));
    aux.appendChild(ul);
  }
  if (c.diagram) {
    const diag = el("div", "step-diagram");
    c.diagram.forEach((t, i) => {
      const item = el("div", "diag-item");
      if (i > 0) item.appendChild(el("span", "diag-arrow", "↓"));
      item.appendChild(el("span", undefined, t));
      diag.appendChild(fade(item, 2 + i));
    });
    aux.appendChild(diag);
  }
  if (c.proof) {
    const proof = el("div", "step-proof");
    c.proof.forEach((t) => proof.appendChild(el("p", undefined, t)));
    aux.appendChild(fade(proof, 3));
  }
  return [num, main, aux];
}

function renderBio(c: Extract<PageContent, { layout: "bio" }>): HTMLElement[] {
  const body = el("div", "bio-body");
  c.paragraphs.forEach((p, i) => body.appendChild(fade(el("p", "ed-body", p), 1 + i)));
  const out: HTMLElement[] = [heading(c.heading), body];

  // the two marks sit either side of the page's vertical rule. They are
  // painted as masks, so both take the face's own text colour.
  if (c.art) {
    const art = el("div", "bio-art");
    art.setAttribute("aria-hidden", "true");
    (["left", "right"] as const).forEach((side) => {
      const mark = el("div", `bio-art-mark bio-art-${side}`);
      mark.style.setProperty("--art-src", `url("${c.art![side]}")`);
      art.appendChild(mark);
    });
    out.push(fade(art, 4));
  }
  return out;
}

function renderTimeline(c: Extract<PageContent, { layout: "timeline" }>): HTMLElement[] {
  const list = el("div", "timeline");
  c.entries.forEach((e, i) => {
    const entry = el("div", "timeline-entry");
    // the first entry sits directly under the heading's rule — no second line
    if (i > 0) entry.appendChild(rowRule(0.25 + i * 0.1));
    const role = el("div", "tl-role");
    role.append(
      el("strong", undefined, e.role),
      el("span", undefined, `${e.org} — ${e.orgNote}`),
      el("span", "tl-dates", e.dates),
    );
    entry.append(role, el("span", "tl-notes", e.notes));
    list.appendChild(fade(entry, 1 + i));
  });
  return [heading(c.heading), list];
}

function renderContact(c: Extract<PageContent, { layout: "contact" }>): HTMLElement[] {
  const main = el("div", "contact-main");
  main.append(heading(c.heading, "ed-display"), mask(el("p", "ed-display", c.secondary)));
  main.appendChild(bodyEl(c.body));
  const email = el("a", "contact-email", c.email) as HTMLAnchorElement;
  email.href = `mailto:${c.email}`;
  main.appendChild(fade(email, 2));
  const cta = el("a", "ed-cta") as HTMLAnchorElement;
  cta.href = `mailto:${c.email}`;
  cta.append(el("span", undefined, c.cta), el("span", "cta-arrow", "→"));
  main.appendChild(fade(cta, 3));

  let art: HTMLElement | null = null;
  if (c.art) {
    art = el("div", "contact-art");
    const img = el("img") as HTMLImageElement;
    img.src = c.art.src;
    img.alt = c.art.alt;
    art.appendChild(img);
    fade(art, 3);
  }

  const foot = el("div", "contact-foot");
  foot.appendChild(rowRule(0.4));
  foot.appendChild(fade(el("span", "ed-meta", c.location), 4));
  if (c.availability) foot.appendChild(fade(el("span", "ed-meta", c.availability), 4));
  const out: HTMLElement[] = [main, foot];
  if (art) out.push(art);
  if (c.expertiseLine) {
    const line = el("p", "ed-meta", c.expertiseLine);
    out.splice(1, 0, fade(line, 4));
  }
  return out;
}

/* ---------- work: shared row ---------- */

function splitTitle(title: string): [string, string | null] {
  const i = title.indexOf(": ");
  if (i === -1) return [title, null];
  return [title.slice(0, i + 1), title.slice(i + 2)];
}

function workRow(
  p: WorkProject,
  context: () => string[],
  opts: { delayGroup?: number; thumb?: boolean; noRule?: boolean } = {},
): HTMLElement {
  const row = el("button", "work-row") as HTMLButtonElement;
  row.type = "button";
  row.dataset.projectId = p.id;
  row.setAttribute("aria-label", `Read: ${p.title}`);
  // the heading already draws a rule; a row rule right under it would double up
  if (!opts.noRule) row.appendChild(rowRule(0.15 + (opts.delayGroup ?? 0) * 0.06));

  const title = el("span", "work-row-title");
  const [a, b] = splitTitle(p.title);
  title.appendChild(el("span", undefined, a));
  if (b) title.appendChild(el("span", undefined, b));
  row.appendChild(title);

  row.appendChild(el("span", "work-row-meta", p.category));

  if (opts.thumb && hasLocalPages(p)) {
    row.classList.add("work-row--thumb");
    const img = el("img", "work-row-thumb") as HTMLImageElement;
    img.src = previewPath(p);
    img.alt = "";
    img.loading = "lazy";
    row.appendChild(img);
  }

  const isLocal = hasLocalPages(p);
  row.classList.toggle("work-row--external", !isLocal);
  row.appendChild(el("span", "work-row-arrow", isLocal ? "→" : "↗"));
  row.addEventListener("click", () => {
    if (isLocal) openProject(p.id, context(), row.getBoundingClientRect());
    else window.open(p.originalUrl, "_blank", "noopener");
  });
  return row;
}

/* ---------- layout: work-toc ---------- */

function renderWorkToc(
  c: Extract<PageContent, { layout: "work-toc" }>,
  nav: Nav,
): HTMLElement[] {
  const rows = el("div", "toc-rows");
  CHAPTERS.forEach((ch, i) => {
    const row = el("button", "toc-row") as HTMLButtonElement;
    row.type = "button";
    row.setAttribute("aria-label", `Open chapter: ${ch.titleLines.join(" ")}`);
    row.appendChild(rowRule(0.2 + i * 0.08));
    const title = el("span", "toc-row-title", ch.titleLines.join(" "));
    row.appendChild(title);
    const meta = el("span", "toc-row-meta");
    meta.append(
      el("span", undefined, ch.toc),
      el("span", "toc-row-count", `${chapterProjectCount(ch)} pieces`),
    );
    row.appendChild(meta);
    row.appendChild(el("span", "work-row-arrow", "→"));
    row.addEventListener("click", () => nav("portfolio", i + 1));
    rows.appendChild(fade(row, 1 + i));
  });
  return [heading(c.heading), bodyEl(c.intro), rows];
}

/* ---------- layout: work-chapter ---------- */

function renderWorkChapter(
  c: Extract<PageContent, { layout: "work-chapter" }>,
): HTMLElement[] {
  const head = el("div", "chapter-head");
  const h2 = el("h2", "ed-display chapter-heading");
  c.headingLines.forEach((line) => h2.appendChild(mask(el("span", undefined, line))));
  head.append(h2, contentRule());

  const allIds = c.groups.flatMap((g) => g.ids);
  const groupsBox = el("div", "chapter-groups");
  let delay = 0;
  c.groups.forEach((group, gi) => {
    const box = el("div", "chapter-group");
    if (group.label) box.appendChild(fade(el("p", "ed-meta chapter-group-label", group.label), 1));
    group.ids.forEach((id, ri) => {
      const p = WORK_BY_ID[id];
      const underHeading = gi === 0 && ri === 0 && !group.label;
      box.appendChild(
        fade(
          workRow(p, () => allIds, { delayGroup: delay, thumb: true, noRule: underHeading }),
          2 + delay,
        ),
      );
      delay++;
    });
    groupsBox.appendChild(box);
  });

  const out: HTMLElement[] = [head, groupsBox];
  if (c.extras) {
    const extras = el("div", "chapter-extras");
    extras.appendChild(el("p", "ed-meta", c.extras.label));
    const list = el("ul", "chapter-extras-list");
    c.extras.items.forEach((item) => list.appendChild(el("li", undefined, item)));
    extras.appendChild(list);
    out.push(fade(extras, 8));
  }
  return out;
}

/* ---------- entry point ---------- */

export function renderPageInto(face: HTMLElement, page: StoryPage, nav: Nav): void {
  face.innerHTML = "";
  face.style.setProperty("--page-bg", page.background);
  face.dataset.theme = page.theme;
  face.dataset.pageId = page.id;

  face.appendChild(structureLayer(page));

  const content = el("div", `face-content layout-${page.content.layout}`);
  let children: HTMLElement[];
  const c = page.content;
  switch (c.layout) {
    case "hero":
      children = renderHero(c, nav);
      break;
    case "statement":
      children = renderStatement(c);
      break;
    case "stats":
      children = renderStats(c);
      break;
    case "work-toc":
      children = renderWorkToc(c, nav);
      break;
    case "work-chapter":
      children = renderWorkChapter(c);
      break;
    case "index":
      children = renderIndex(c, nav);
      break;
    case "diary":
      children = renderDiary(c);
      break;
    case "feature":
      children = renderFeature(c);
      break;
    case "biglist":
      children = renderBiglist(c);
      break;
    case "sequence":
      children = renderSequence(c);
      break;
    case "matrix":
      children = renderMatrix(c);
      break;
    case "keywords":
      children = renderKeywords(c);
      break;
    case "step":
      children = renderStep(c);
      break;
    case "bio":
      children = renderBio(c);
      break;
    case "timeline":
      children = renderTimeline(c);
      break;
    case "contact":
      children = renderContact(c);
      break;
  }
  children.forEach((child) => content.appendChild(child));
  face.appendChild(content);
}
