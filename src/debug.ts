import { MOTION } from "./animation/motionConfig";
import type { StageEngine } from "./engine/stage";

/** Dev-only calibration panel, enabled with ?debug=1. */
export function attachDebugPanel(engine: StageEngine): void {
  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;top:60px;right:12px;z-index:99;background:#111;color:#eee;" +
    "font:11px monospace;padding:10px;display:grid;gap:6px;width:220px;opacity:0.92";

  const state = document.createElement("pre");
  panel.appendChild(state);

  const slider = (
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    apply: (v: number) => void,
  ) => {
    const row = document.createElement("label");
    row.style.cssText = "display:grid;gap:2px";
    const readout = document.createElement("span");
    readout.textContent = `${label}: ${value}`;
    const input = document.createElement("input");
    input.type = "range";
    Object.assign(input, { min, max, step, value });
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      readout.textContent = `${label}: ${v}`;
      apply(v);
    });
    row.append(readout, input);
    panel.appendChild(row);
  };

  slider("perspective", 800, 2600, 50, 1600, (v) => {
    engine.stage.style.perspective = `${v}px`;
  });
  slider("persp-origin-y", 40, 60, 1, 50, (v) => {
    engine.stage.style.perspectiveOrigin = `50% ${v}%`;
  });
  slider("turn duration", 0.3, 1.2, 0.02, MOTION.turnDuration, (v) => {
    MOTION.turnDuration = v;
  });
  slider("content fade", 0, 1, 0.05, MOTION.outgoingContentOpacity, (v) => {
    MOTION.outgoingContentOpacity = v;
  });

  const tick = () => {
    state.textContent = `section: ${engine.section.id}\nface: ${engine.pageIndex}\nphase: ${engine.phase}`;
    requestAnimationFrame(tick);
  };
  tick();

  document.body.appendChild(panel);
}
