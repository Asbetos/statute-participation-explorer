import { DEFAULT_FILTERS, type Filters } from "./model";
import type { Outcome } from "./types";

/** The view lives in the URL hash (#m=0&o=missed&d=1&q=...&s=<section id>), so any section, with its
 *  filters, can be linked to. Hash, not query string: the site is static files. */
export interface ViewState extends Filters {
  section: string | null;
}

const OUTCOMES = new Set(["all", "caught", "missed", "false alarm", "correct No"]);

export function readHash(nRuns: number): ViewState {
  const p = new URLSearchParams(typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, ""));
  const m = Number(p.get("m"));
  const o = p.get("o") ?? "all";
  return {
    model: Number.isInteger(m) && m >= 0 && m < nRuns ? m : DEFAULT_FILTERS.model,
    outcome: (OUTCOMES.has(o) ? o : "all") as Outcome | "all",
    disagree: p.get("d") === "1",
    query: p.get("q") ?? "",
    section: p.get("s"),
  };
}

export function writeHash(v: ViewState): void {
  const p = new URLSearchParams();
  if (v.model !== DEFAULT_FILTERS.model) p.set("m", String(v.model));
  if (v.outcome !== "all") p.set("o", v.outcome);
  if (v.disagree) p.set("d", "1");
  if (v.query) p.set("q", v.query);
  if (v.section) p.set("s", v.section);
  const hash = p.toString();
  const url = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`;
  window.history.replaceState(null, "", url);
}
