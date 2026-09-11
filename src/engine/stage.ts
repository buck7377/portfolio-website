import gsap from "gsap";
import { SECTIONS, SECTION_INDEX } from "../data/sections";
import type { Section, StoryPage } from "../data/types";
import { renderPageInto } from "../render/renderPage";
import { createTurnTimeline } from "../animation/turnTimeline";
import { createPageIntroTimeline, resetIntro } from "../animation/pageIntro";
import { prefersReducedMotion } from "../animation/motionConfig";

export type Phase = "idle" | "turning" | "intro" | "section-transition";

export interface EngineCallbacks {
  onStateChange: (state: {
    sectionIndex: number;
    pageIndex: number;
    section: Section;
    phase: Phase;
  }) => void;
  getTabElement: (sectionId: string) => HTMLElement;
}

export class StageEngine {
  readonly stage: HTMLElement;
  readonly stageWindow: HTMLElement;
  /** inset window inside the folder — the only thing with perspective */
  readonly panel: HTMLElement;
  readonly rotor: HTMLElement;
  private faces: [HTMLElement, HTMLElement];
  private currentFaceIdx = 0;

  sectionIndex = 0;
  pageIndexBySection: Record<string, number> = {};
  phase: Phase = "idle";

  private radius = 0;
  private introTl: gsap.core.Timeline | null = null;
  private callbacks: EngineCallbacks;
  /** pages that have already played their intro — they re-enter fully built */
  private visited = new Set<string>();

  constructor(stageWindow: HTMLElement, callbacks: EngineCallbacks) {
    this.stageWindow = stageWindow;
    this.callbacks = callbacks;

    this.stage = document.createElement("div");
    this.stage.className = "story-stage";
    this.panel = document.createElement("div");
    this.panel.className = "story-panel";
    this.rotor = document.createElement("div");
    this.rotor.className = "rotor";

    const faceA = document.createElement("section");
    const faceB = document.createElement("section");
    for (const f of [faceA, faceB]) {
      f.className = "face";
      this.rotor.appendChild(f);
    }
    this.faces = [faceA, faceB];
    this.panel.appendChild(this.rotor);
    this.stage.appendChild(this.panel);
    stageWindow.appendChild(this.stage);

    for (const s of SECTIONS) this.pageIndexBySection[s.id] = 0;

    this.layout();
    window.addEventListener("resize", () => this.layout());
  }

  get section(): Section {
    return SECTIONS[this.sectionIndex];
  }

  get pageIndex(): number {
    return this.pageIndexBySection[this.section.id];
  }

  get page(): StoryPage {
    return this.section.pages[this.pageIndex];
  }

  get currentFace(): HTMLElement {
    return this.faces[this.currentFaceIdx];
  }

  get incomingFace(): HTMLElement {
    return this.faces[1 - this.currentFaceIdx];
  }

  /** Recompute box depth from stage height and re-seat both faces. */
  layout(): void {
    this.radius = this.panel.clientHeight / 2;
    this.rotor.style.transform = `translateZ(${-this.radius}px) rotateX(0deg)`;
    this.currentFace.style.transform = `rotateX(0deg) translateZ(${this.radius}px)`;
    this.currentFace.style.visibility = "visible";
    this.incomingFace.style.visibility = "hidden";
  }

  /** the folder sheet is static, but its colour/theme follow the section */
  private syncFolder(): void {
    this.stage.style.setProperty("--folder-bg", this.page.background);
    this.stage.dataset.theme = this.page.theme;
  }

  private notify(): void {
    this.callbacks.onStateChange({
      sectionIndex: this.sectionIndex,
      pageIndex: this.pageIndex,
      section: this.section,
      phase: this.phase,
    });
  }

  private setAccessibility(): void {
    this.currentFace.removeAttribute("aria-hidden");
    this.currentFace.removeAttribute("inert");
    this.incomingFace.setAttribute("aria-hidden", "true");
    this.incomingFace.setAttribute("inert", "");
  }

  private navigateToSection = (sectionId: string, face = 0): void => {
    this.goToSection(sectionId, face);
  };

  /** First paint: render current page with its intro. */
  init(sectionId?: string, pageIdx?: number): void {
    if (sectionId && sectionId in SECTION_INDEX) {
      this.sectionIndex = SECTION_INDEX[sectionId];
      if (pageIdx !== undefined) {
        this.pageIndexBySection[sectionId] = Math.min(
          Math.max(pageIdx, 0),
          this.section.pages.length - 1,
        );
      }
    }
    renderPageInto(this.currentFace, this.page, this.navigateToSection);
    this.syncFolder();
    this.setAccessibility();
    resetIntro(this.currentFace);
    this.visited.add(this.page.id);
    this.playIntro();
    this.notify();
  }

  private playIntro(): void {
    this.phase = "intro";
    this.introTl?.kill();
    this.introTl = createPageIntroTimeline(this.currentFace);
    this.introTl.eventCallback("onComplete", () => {
      this.phase = "idle";
      this.notify();
    });
  }

  /** Finish any in-flight intro instantly so a new navigation can start clean. */
  private settleIntro(): void {
    if (this.introTl) {
      this.introTl.progress(1).kill();
      this.introTl = null;
    }
  }

  canNavigate(): boolean {
    return this.phase === "idle" || this.phase === "intro";
  }

  next(): void {
    if (!this.canNavigate()) return;
    if (this.pageIndex >= this.section.pages.length - 1) return;
    this.turnTo(this.pageIndex + 1, "forward");
  }

  prev(): void {
    if (!this.canNavigate()) return;
    if (this.pageIndex <= 0) return;
    this.turnTo(this.pageIndex - 1, "backward");
  }

  goToFace(pageIdx: number): void {
    if (!this.canNavigate()) return;
    if (pageIdx === this.pageIndex || pageIdx < 0 || pageIdx >= this.section.pages.length)
      return;
    this.turnTo(pageIdx, pageIdx > this.pageIndex ? "forward" : "backward");
  }

  private turnTo(pageIdx: number, direction: "forward" | "backward"): void {
    this.settleIntro();
    const targetPage = this.section.pages[pageIdx];
    renderPageInto(this.incomingFace, targetPage, this.navigateToSection);
    this.syncFolder();

    // Turning the box is the animation — a face arrives fully built so the
    // content is simply there the moment the turn lands.
    this.visited.add(targetPage.id);

    this.pageIndexBySection[this.section.id] = pageIdx;

    if (prefersReducedMotion()) {
      this.swapFacesImmediate();
      return;
    }

    this.phase = "turning";
    this.notify();

    // a revisit fade-in may still be running on these layers — settle it
    gsap.killTweensOf(this.currentFace.querySelectorAll(".face-content, .face-structure"));

    createTurnTimeline({
      direction,
      rotor: this.rotor,
      currentFace: this.currentFace,
      incomingFace: this.incomingFace,
      radius: this.radius,
      onComplete: () => {
        this.currentFaceIdx = 1 - this.currentFaceIdx;
        this.setAccessibility();
        this.phase = "idle";
        this.notify();
      },
    });
  }

  /** Reduced-motion path: no rotation, quick swap. */
  private swapFacesImmediate(): void {
    this.incomingFace.style.transform = `rotateX(0deg) translateZ(${this.radius}px)`;
    this.incomingFace.style.visibility = "visible";
    this.currentFace.style.visibility = "hidden";
    this.currentFaceIdx = 1 - this.currentFaceIdx;
    this.setAccessibility();
    this.phase = "idle";
    this.notify();
  }

  /** Dev-only (?turntest): pose the box mid-turn to inspect shared-edge geometry. */
  debugFreezeTurn(angle: number): void {
    const nextPage = this.section.pages[Math.min(this.pageIndex + 1, this.section.pages.length - 1)];
    renderPageInto(this.incomingFace, nextPage, this.navigateToSection);
    this.settleIntro();
    createPageIntroTimeline(this.incomingFace).progress(1);
    createPageIntroTimeline(this.currentFace).progress(1);
    this.currentFace.style.transform = `rotateX(0deg) translateZ(${this.radius}px)`;
    this.incomingFace.style.transform = `rotateX(-90deg) translateZ(${this.radius}px)`;
    this.incomingFace.style.visibility = "visible";
    this.rotor.style.transform = `translateZ(${-this.radius}px) rotateX(${angle}deg)`;
    const content = this.currentFace.querySelector<HTMLElement>(".face-content");
    if (content) content.style.opacity = "0.25";
  }

  goToSection(sectionId: string, targetPage = 0): void {
    if (!(sectionId in SECTION_INDEX)) return;
    const targetIdx = SECTION_INDEX[sectionId];
    if (targetIdx === this.sectionIndex && targetPage === this.pageIndex) return;
    if (!this.canNavigate()) return;
    this.settleIntro();

    if (targetIdx === this.sectionIndex) {
      this.goToFace(targetPage);
      return;
    }

    // Tabs switch instantly — the folder is simply brought to the front.
    this.sectionIndex = targetIdx;
    this.pageIndexBySection[sectionId] = Math.min(
      Math.max(targetPage, 0),
      this.section.pages.length - 1,
    );

    // reset the box so the new section lands front-facing on the current face
    this.rotor.style.transform = `translateZ(${-this.radius}px) rotateX(0deg)`;
    renderPageInto(this.currentFace, this.page, this.navigateToSection);
    this.syncFolder();
    this.currentFace.style.transform = `rotateX(0deg) translateZ(${this.radius}px)`;
    this.currentFace.style.visibility = "visible";
    this.incomingFace.style.visibility = "hidden";
    this.setAccessibility();

    const layers = this.currentFace.querySelectorAll(".face-content, .face-structure");
    gsap.killTweensOf(layers);
    gsap.set(layers, { autoAlpha: 1 });

    if (this.visited.has(this.page.id)) {
      this.phase = "idle";
    } else {
      resetIntro(this.currentFace);
      this.visited.add(this.page.id);
      this.playIntro();
    }
    this.notify();
  }
}
