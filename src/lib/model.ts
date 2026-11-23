import type { IndexSection, Label, Outcome, Run } from "./types";

/** Colour follows the model family, as on the slides: orange is always Claude, blue is always Qwen.
 *  The study is the line style: solid for this run, dashed (and paler fills) for November. */
export const familyColor = (run: Run) => (run.family === "claude" ? "var(--claude)" : "var(--qwen)");
export const familyPale = (run: Run) => (run.family === "claude" ? "var(--claude-pale)" : "var(--qwen-pale)");

export const OUTCOMES: Outcome[] = ["caught", "missed", "false alarm", "correct No"];

/** The one-line subtitle on each card (the full notes are in "How to read this"). */
export const RUN_TAG: Record<string, string> = {
  fable: "This run · high reasoning setting",
  qwen_block: "This run · thinking off",
  opus: "November · medium reasoning setting",
  qwen_chat: "November · thinking off, chat layout",
};

export function outcomeOf(label: Label | null | undefined, final: Label): Outcome {
  if (!label) return "no answer";
  if (label === "Yes") return final === "Yes" ? "caught" : "false alarm";
  return final === "Yes" ? "missed" : "correct No";
}

export const isError = (o: Outcome) => o === "missed" || o === "false alarm";

/** True when the runs that answered do not all give the same label. */
export function modelsDisagree(s: IndexSection): boolean {
  const ys = s.y.filter((y): y is Label => !!y);
  return ys.length > 1 && ys.some(y => y !== ys[0]);
}

export interface Filters {
  model: number;               // index into runs: whose outcome the outcome filter uses
  outcome: Outcome | "all";
  disagree: boolean;
  query: string;
}

export const DEFAULT_FILTERS: Filters = { model: 0, outcome: "all", disagree: false, query: "" };

/** A query that looks like a law or section id is matched against the index; anything else needs the
 *  full-text search file. */
export const isLookup = (q: string) => /^[\d\s\-–.:/a-z]*\d[\d\s\-–.:/a-z]*$/i.test(q) && !/[a-z]{4,}/i.test(q);

export function matchesLookup(s: IndexSection, q: string): boolean {
  const norm = (x: string) => x.toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ");
  const n = norm(q).trim();
  return norm(s.l).includes(n) || s.i.toLowerCase().includes(n);
}

export function fmtConfidence(c: number | null | undefined): string {
  return c == null ? "—" : c.toFixed(2);
}

export function fmtPYes(p: number | null | undefined): string {
  if (p == null) return "—";
  if (p < 0.001) return "below 0.001";
  if (p > 0.999) return "above 0.999";
  return p.toFixed(3);
}

export const fmtInt = (n: number) => n.toLocaleString("en-US");
