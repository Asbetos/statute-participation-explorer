"use client";

import { fmtInt, familyColor, OUTCOMES, type Filters } from "@/lib/model";
import type { Outcome, Run } from "@/lib/types";

const OUTCOME_LABEL: Record<Outcome | "all", string> = {
  all: "All", caught: "Caught", missed: "Missed", "false alarm": "False alarms", "correct No": "Correct No",
  "no answer": "No answer",
};
const OUTCOME_HELP: Record<Outcome | "all", string> = {
  all: "Every section that passes the other filters",
  caught: "Coders’ final label Yes, model Yes",
  missed: "Coders’ final label Yes, model No",
  "false alarm": "Coders’ final label No, model Yes",
  "correct No": "Coders’ final label No, model No",
  "no answer": "The model gave no answer",
};

interface Props {
  runs: Run[];
  filters: Filters;
  counts: Record<Outcome | "all", number>;
  active: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

/** The only filters: whose answers to look at (the buttons double as the colour key), the outcome of that
 *  model's answer (with live counts), and whether the four runs disagree. */
export default function FilterBar({ runs, filters, counts, active, onChange, onReset }: Props) {
  const chips: (Outcome | "all")[] = ["all", ...OUTCOMES, ...((counts["no answer"] ?? 0) > 0 ? ["no answer" as const] : [])];
  return (
    <div className="toolbar">
      <div className="tool">
        <span className="tool-label" id="lbl-model">Outcomes of</span>
        <div className="segmented" role="radiogroup" aria-labelledby="lbl-model"
             title="Choose whose answers the outcome buttons count">

          {runs.map((run, k) => (
            <button key={run.key} type="button" role="radio" aria-checked={filters.model === k}
                    className={`seg${filters.model === k ? " on" : ""}`} onClick={() => onChange({ model: k })}
                    title={`${run.name}, ${run.study}: ${run.note}`}>
              <span className={`key${run.dash ? " dash" : ""}`} style={{ borderTopColor: familyColor(run) }} aria-hidden="true" />
              <span className="seg-text">
                <span className="seg-name">{run.name.replace("Claude ", "").replace("3.6-27B", "")}</span>
                <span className="seg-sub">{run.study}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="chips" role="radiogroup" aria-label="Outcome">
        {chips.map(o => (
          <button key={o} type="button" role="radio" aria-checked={filters.outcome === o} title={OUTCOME_HELP[o]}
                  className={`chip${filters.outcome === o ? " on" : ""}`} onClick={() => onChange({ outcome: o })}>
            {OUTCOME_LABEL[o]} <span className="chip-n">{fmtInt(counts[o] ?? 0)}</span>
          </button>
        ))}
      </div>

      <label className="switch" title="Only sections where the four runs do not all give the same answer">
        <input type="checkbox" checked={filters.disagree} onChange={e => onChange({ disagree: e.target.checked })} />
        <span className="track" aria-hidden="true"><span className="thumb" /></span>
        <span>Models disagree</span>
      </label>

      {active ? <button type="button" className="linkish reset" onClick={onReset}>Reset filters</button> : null}
    </div>
  );
}
