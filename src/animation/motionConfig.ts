export const MOTION = {
  turnDuration: 0.44,
  turnEase: "power3.inOut",
  outgoingContentOpacity: 0.2,
  outgoingStructureOpacity: 0.9,
  ruleDuration: 0.26,
  textDuration: 0.28,
  fadeDuration: 0.26,
  introStagger: 0.028,
};

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
