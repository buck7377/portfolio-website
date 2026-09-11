import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/stage.css";
import "./styles/editorial.css";
import "./styles/work.css";

import { SECTIONS } from "./data/sections";
import { CHAPTER_ROUTES, WORK } from "./data/work";
import { StageEngine } from "./engine/stage";
import { attachGestures } from "./engine/gestures";
import { applyFolderGap, measureFolderGap } from "./engine/folderGap";
import { closeProject, initProjectViewer, openProjectById } from "./viewer/projectViewer";
import { attachDebugPanel } from "./debug";

const app = document.getElementById("app")!;

/* ---------- fixed shell ---------- */

app.innerHTML = `
  <div class="site-shell">
    <header class="shell-header">
      <button class="brand" id="brand" aria-label="Zachary Clark — back to the work index">
        <strong>Zachary Clark</strong>
        <span>Marketing Copywriter</span>
      </button>
      <nav class="utility-nav" aria-label="Utility">
        <span class="nav-loc ed-meta">Goodrich, MI</span>
        <a href="mailto:clarkzac1997@gmail.com">Email</a>
      </nav>
    </header>

    <nav class="folder-tabs" role="tablist" aria-label="Sections"></nav>

    <main class="stage-window" id="stage-window" aria-live="polite"></main>

    <footer class="shell-footer">
      <a href="mailto:clarkzac1997@gmail.com">clarkzac1997@gmail.com</a>
    </footer>
  </div>

  <div class="scroll-cue" id="scroll-cue" aria-hidden="true">
    <span class="cue-label">Scroll to turn</span>
    <span class="cue-circle"><span class="cue-arrow">↓</span></span>
  </div>

  <nav class="face-progress" id="face-progress" aria-label="Pages in section"></nav>
`;

/* ---------- folder tabs ---------- */

const tabsNav = app.querySelector<HTMLElement>(".folder-tabs")!;
const tabEls = new Map<string, HTMLButtonElement>();

for (const section of SECTIONS) {
  const tab = document.createElement("button");
  tab.className = `folder-tab${section.theme === "dark" ? " theme-dark" : ""}`;
  tab.style.setProperty("--tab-bg", section.tabColor);
  tab.setAttribute("role", "tab");
  tab.id = `tab-${section.id}`;
  // left tabs sit in front of the ones to their right, like a real stack
  tab.style.setProperty("--tab-z", String(SECTIONS.length - SECTIONS.indexOf(section)));
  tab.innerHTML = `<span>${section.label}</span>`;
  tab.addEventListener("click", () => {
    closeProject(true);
    engine.goToSection(section.id);
  });
  tabsNav.appendChild(tab);
  tabEls.set(section.id, tab);
}

/* ---------- engine ---------- */

const stageWindow = document.getElementById("stage-window")!;
const progressNav = document.getElementById("face-progress")!;
const cue = document.getElementById("scroll-cue")!;

function updateHash(sectionId: string, pageIndex: number): void {
  const hash = pageIndex > 0 ? `#${sectionId}/${pageIndex}` : `#${sectionId}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function renderProgress(count: number, active: number): void {
  progressNav.innerHTML = "";
  // a lone dot says nothing — hide the rail in single-face sections
  progressNav.hidden = count < 2;
  if (count < 2) return;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Go to page ${i + 1}`);
    if (i === active) dot.classList.add("is-active");
    dot.addEventListener("click", () => engine.goToFace(i));
    progressNav.appendChild(dot);
  }
}

/** keep the folder's top edge broken exactly where the active tab joins it */
function syncFolderGap(): void {
  const tab = tabEls.get(engine.section.id);
  if (tab) applyFolderGap(stageWindow, measureFolderGap(tab, stageWindow));
}

const engine = new StageEngine(stageWindow, {
  getTabElement: (id) => tabEls.get(id)!,
  onStateChange: ({ section, pageIndex }) => {
    for (const [id, tab] of tabEls) {
      const active = id === section.id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      if (active) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    }
    renderProgress(section.pages.length, pageIndex);
    updateHash(section.id, pageIndex);
    cue.classList.toggle("on-dark", section.theme === "dark");
    // nothing to turn to in a single-face section
    cue.classList.toggle("is-unavailable", section.pages.length < 2);
    syncFolderGap();
  },
});

/* ---------- routing ---------- */

function parseHash(): { section?: string; page?: number } {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return {};
  const [section, page] = raw.split("/");
  return { section, page: page ? parseInt(page, 10) : undefined };
}

/* deep-link a chapter, e.g. /?work=seo — lands on that face */
const boot = new URLSearchParams(location.search);
const workParam = boot.get("work");
const initial = parseHash();
if (!initial.section && workParam && workParam in CHAPTER_ROUTES) {
  initial.section = "portfolio";
  initial.page = CHAPTER_ROUTES[workParam];
}
engine.init(initial.section, initial.page);

/* in-site project reader */
initProjectViewer(stageWindow);
document.addEventListener("open-project", (e) => {
  const { id, context, rect } = (e as CustomEvent).detail;
  openProjectById(id, context, rect);
});

/* deep-link a project, e.g. /?project=seo-brain-fog-head-injury */
const projectParam = boot.get("project");
if (projectParam && WORK.some((p) => p.id === projectParam)) {
  openProjectById(
    projectParam,
    WORK.map((p) => p.id),
  );
}

window.addEventListener("hashchange", () => {
  const { section } = parseHash();
  if (section && section !== engine.section.id) {
    closeProject(true);
    engine.goToSection(section);
  }
});

/* ---------- brand = home reset ---------- */

document.getElementById("brand")!.addEventListener("click", () => {
  closeProject(true);
  if (engine.section.id === "portfolio" && engine.pageIndex === 0) return;
  if (engine.section.id === "portfolio") engine.goToFace(0);
  else engine.goToSection("portfolio");
});

/* ---------- gestures + scroll cue ---------- */

attachGestures(engine, () => cue.classList.add("is-hidden"));

window.addEventListener("resize", syncFolderGap);
document.fonts?.ready.then(syncFolderGap);
syncFolderGap();

/* ---------- debug (?debug=1) ---------- */

const params = new URLSearchParams(location.search);

/* ?holdload=N delays the load event N ms (dev screenshot helper). */
if (import.meta.env.DEV && params.has("holdload")) {
  const img = new Image();
  img.src = `/slow?ms=${parseInt(params.get("holdload") || "3000", 10)}`;
}
if (import.meta.env.DEV && params.has("debug")) {
  attachDebugPanel(engine);
}
if (import.meta.env.DEV && params.has("turntest")) {
  const angle = parseFloat(params.get("turntest") || "45");
  engine.debugFreezeTurn(angle);
}

/* ?autotest: run turns + a section change at high speed, surface errors. */
if (import.meta.env.DEV && params.has("autotest")) {
  const { default: gsap } = await import("gsap");
  gsap.globalTimeline.timeScale(40);
  const badge = document.createElement("div");
  badge.id = "autotest-badge";
  badge.style.cssText =
    "position:fixed;top:2px;left:40%;z-index:999;background:#fff;color:#000;" +
    "font:12px monospace;padding:2px 8px;border:2px solid #000";
  badge.textContent = "autotest: running";
  document.body.appendChild(badge);
  const errors: string[] = [];
  window.addEventListener("error", (e) => errors.push(e.message));

  const steps: (() => void)[] = [
    () => engine.next(),
    () => engine.next(),
    () => engine.prev(),
    () => engine.goToSection("about"),
    () => engine.next(),
    () => engine.goToSection("contact"),
  ];
  let i = 0;
  const timer = setInterval(() => {
    if (!engine.canNavigate()) return;
    if (i < steps.length) steps[i++]();
    else {
      clearInterval(timer);
      badge.textContent = errors.length
        ? `autotest: FAIL ${errors.join(" | ")}`
        : `autotest: PASS section=${engine.section.id} face=${engine.pageIndex}`;
    }
  }, 30);
}


