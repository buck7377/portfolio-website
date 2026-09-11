import type { ExperimentEntry } from "./types";

/**
 * Experiments — things in progress, half-formed arguments, notes.
 *
 * Add a new entry object to the TOP of this array and the site rebuilds
 * itself: the Experiments index gains a row and the entry gets its own
 * face you can turn to. Nothing else to wire up.
 *
 * Keep paragraphs as separate strings — each renders as its own paragraph.
 * `tags` is optional.
 *
 * Entry shape:
 * {
 *   id: "short-slug",
 *   date: "10 Sep 2026",
 *   title: "Title of the note.",
 *   paragraphs: ["First paragraph.", "Second paragraph."],
 *   tags: ["drafts"],
 * }
 */
export const EXPERIMENTS: ExperimentEntry[] = [];
