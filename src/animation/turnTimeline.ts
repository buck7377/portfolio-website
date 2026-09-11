import gsap from "gsap";
import { MOTION } from "./motionConfig";

export type TurnDirection = "forward" | "backward";

export interface TurnOptions {
  direction: TurnDirection;
  rotor: HTMLElement;
  currentFace: HTMLElement;
  incomingFace: HTMLElement;
  /** half the stage height — the box depth */
  radius: number;
  onComplete: () => void;
}

/**
 * True shared-edge box turnover.
 *
 * Faces are placed with `rotateX(a) translateZ(r)` (rotate BEFORE translate,
 * so the face sits on the surface of a box of depth 2r), and the rotor turns
 * the whole box with `translateZ(-r) rotateX(angle)` so the front face sits
 * exactly on the z=0 plane of the stage. CSS transform strings are written
 * directly because the composition order matters and must not be reordered
 * by a tweening library's transform model.
 */
export function createTurnTimeline(options: TurnOptions): gsap.core.Timeline {
  const { direction, rotor, currentFace, incomingFace, radius, onComplete } = options;
  const forward = direction === "forward";

  // forward: incoming is the bottom face of the box, box turns +90deg.
  // backward: incoming is the top face, box turns -90deg.
  const incomingAngle = forward ? -90 : 90;
  const targetRotor = forward ? 90 : -90;

  currentFace.style.transform = `rotateX(0deg) translateZ(${radius}px)`;
  incomingFace.style.transform = `rotateX(${incomingAngle}deg) translateZ(${radius}px)`;
  incomingFace.style.visibility = "visible";

  const state = { angle: 0 };
  const tl = gsap.timeline({
    onComplete: () => {
      // land exactly front-facing, then hand both faces back for recycling
      rotor.style.transform = `translateZ(${-radius}px) rotateX(0deg)`;
      incomingFace.style.transform = `rotateX(0deg) translateZ(${radius}px)`;
      currentFace.style.visibility = "hidden";
      onComplete();
    },
  });

  tl.to(state, {
    angle: targetRotor,
    duration: MOTION.turnDuration,
    ease: MOTION.turnEase,
    onUpdate: () => {
      rotor.style.transform = `translateZ(${-radius}px) rotateX(${state.angle}deg)`;
    },
  });

  // outgoing information softens; its structural lines stay near-solid
  const outContent = currentFace.querySelector(".face-content");
  const outStructure = currentFace.querySelector(".face-structure");
  if (outContent) {
    tl.to(
      outContent,
      { opacity: MOTION.outgoingContentOpacity, duration: MOTION.turnDuration * 0.7 },
      0,
    );
  }
  if (outStructure) {
    tl.to(
      outStructure,
      { opacity: MOTION.outgoingStructureOpacity, duration: MOTION.turnDuration },
      0,
    );
  }

  return tl;
}
