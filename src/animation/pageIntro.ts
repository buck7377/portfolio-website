import gsap from "gsap";
import { MOTION, prefersReducedMotion } from "./motionConfig";

/** ?instant=1 snaps every intro to its finished state (dev testing/screenshots). */
const INSTANT = import.meta.env.DEV && new URLSearchParams(location.search).has("instant");

/**
 * Put every intro element of a face back to its unbuilt state so the
 * assembly can (re)play — including on re-entry to a visited face.
 */
export function resetIntro(face: HTMLElement): void {
  const rules = face.querySelectorAll<HTMLElement>(".face-structure .rule");
  rules.forEach((rule) => {
    const origin = rule.dataset.origin ?? "left";
    const horizontal = rule.classList.contains("rule--h");
    const originMap: Record<string, string> = {
      left: "left center",
      right: "right center",
      top: "center top",
      bottom: "center bottom",
      center: "center center",
    };
    gsap.set(rule, {
      transformOrigin: originMap[origin] ?? "left center",
      scaleX: horizontal ? 0 : 1,
      scaleY: horizontal ? 1 : 0,
    });
  });

  gsap.set(face.querySelectorAll('[data-reveal="mask"]'), { yPercent: 110 });
  gsap.set(face.querySelectorAll('[data-reveal="fade"]'), { opacity: 0, y: 10 });
  gsap.set(face.querySelectorAll('[data-reveal="line"]'), {
    scaleX: 0,
    transformOrigin: "left center",
  });
}

/** Build the assembly timeline for a face that has just landed. */
export function createPageIntroTimeline(face: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();

  if (prefersReducedMotion()) {
    tl.set(face.querySelectorAll(".face-structure .rule"), { scaleX: 1, scaleY: 1 });
    tl.set(face.querySelectorAll('[data-reveal="mask"]'), { yPercent: 0 });
    tl.to(face.querySelectorAll('[data-reveal="fade"]'), {
      opacity: 1,
      y: 0,
      duration: 0.2,
    });
    tl.set(face.querySelectorAll('[data-reveal="line"]'), { scaleX: 1 });
    return tl;
  }

  tl.addLabel("structure", 0.03);
  face.querySelectorAll<HTMLElement>(".face-structure .rule").forEach((rule) => {
    const delay = parseFloat(rule.dataset.delay ?? "0");
    tl.to(
      rule,
      { scaleX: 1, scaleY: 1, duration: MOTION.ruleDuration, ease: "power2.out" },
      `structure+=${delay * 0.45}`,
    );
  });

  const masks = face.querySelectorAll('[data-reveal="mask"]');
  if (masks.length) {
    tl.to(
      masks,
      {
        yPercent: 0,
        duration: MOTION.textDuration,
        ease: "power3.out",
        stagger: MOTION.introStagger,
      },
      0.08,
    );
  }

  // fades run in numbered groups so lists build in reading order
  const fades = Array.from(face.querySelectorAll<HTMLElement>('[data-reveal="fade"]'));
  const groups = new Map<number, HTMLElement[]>();
  fades.forEach((node) => {
    const g = parseInt(node.dataset.revealGroup ?? "0", 10);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(node);
  });
  [...groups.keys()]
    .sort((a, b) => a - b)
    .forEach((g) => {
      tl.to(
        groups.get(g)!,
        { opacity: 1, y: 0, duration: MOTION.fadeDuration, ease: "power2.out", stagger: 0.022 },
        0.12 + g * 0.035,
      );
    });

  const lines = face.querySelectorAll<HTMLElement>('[data-reveal="line"]');
  lines.forEach((line) => {
    tl.to(
      line,
      { scaleX: 1, duration: 0.24, ease: "power2.out" },
      parseFloat(line.dataset.delay ?? "0.5") * 0.45,
    );
  });

  if (INSTANT) tl.progress(1);

  return tl;
}
