import type { StageEngine } from "./stage";

const WHEEL_THRESHOLD = 60;
const GESTURE_COOLDOWN_MS = 250;

/**
 * Wheel input is a page-advance gesture, not scrolling: accumulate deltas,
 * fire one turn at the threshold, then ignore the inertia tail until the
 * turn has settled plus a cooldown.
 */
export function attachGestures(engine: StageEngine, onFirstGesture: () => void): () => void {
  let accumulator = 0;
  let lastFireAt = 0;
  let fired = false;

  const fire = (dir: 1 | -1) => {
    accumulator = 0;
    lastFireAt = performance.now();
    if (!fired) {
      fired = true;
      onFirstGesture();
    }
    if (dir === 1) engine.next();
    else engine.prev();
  };

  /** On small screens face content may scroll internally; let it reach its
   * boundary before a gesture turns the page. */
  const scrollableUnder = (target: EventTarget | null, dir: 1 | -1): HTMLElement | null => {
    if (!(target instanceof HTMLElement)) return null;
    const box = target.closest<HTMLElement>(".chapter-groups, .face-content");
    if (!box || box.scrollHeight <= box.clientHeight + 1) return null;
    const atTop = box.scrollTop <= 0;
    const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
    if ((dir === 1 && !atBottom) || (dir === -1 && !atTop)) return box;
    return null;
  };

  // while the project reader is open, all input belongs to the document
  const viewerOpen = () => document.body.classList.contains("viewer-open");

  const onWheel = (e: WheelEvent) => {
    if (viewerOpen()) return;
    if (scrollableUnder(e.target, e.deltaY > 0 ? 1 : -1)) return;
    e.preventDefault();
    if (!engine.canNavigate()) {
      accumulator = 0;
      return;
    }
    if (performance.now() - lastFireAt < GESTURE_COOLDOWN_MS) return;

    // normalize: line-mode deltas (Firefox) are much smaller than pixels
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;

    // direction reversal resets the accumulator
    if (Math.sign(delta) !== Math.sign(accumulator)) accumulator = 0;
    accumulator += delta;

    if (accumulator > WHEEL_THRESHOLD) fire(1);
    else if (accumulator < -WHEEL_THRESHOLD) fire(-1);
  };

  const isTypingTarget = (t: EventTarget | null) =>
    t instanceof HTMLElement &&
    (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

  const onKeyDown = (e: KeyboardEvent) => {
    if (viewerOpen()) return;
    if (isTypingTarget(e.target)) return;
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
        e.preventDefault();
        if (!fired) (fired = true), onFirstGesture();
        engine.next();
        break;
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        if (!fired) (fired = true), onFirstGesture();
        engine.prev();
        break;
      case "Home":
        e.preventDefault();
        engine.goToFace(0);
        break;
      case "End":
        e.preventDefault();
        engine.goToFace(engine.section.pages.length - 1);
        break;
    }
  };

  // touch: vertical swipe advances/retreats one face
  let touchStartY: number | null = null;
  const onTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (viewerOpen()) return;
    // keep the document from rubber-banding while the stage owns the gesture
    if (e.target instanceof HTMLElement && !e.target.closest(".face-content")) {
      e.preventDefault();
    }
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (viewerOpen()) return;
    if (touchStartY === null) return;
    const dy = touchStartY - e.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(dy) < 50) return;
    if (scrollableUnder(e.target, dy > 0 ? 1 : -1)) return;
    if (!fired) (fired = true), onFirstGesture();
    if (dy > 0) engine.next();
    else engine.prev();
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  return () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  };
}
