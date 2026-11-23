"use client";

import { familyColor, familyPale, fmtConfidence, fmtPYes, isError, outcomeOf, RUN_TAG } from "@/lib/model";
import type { Answer, Label, Run } from "@/lib/types";

interface Props {
  run: Run;
  label: Label | null;
  confidence: number | null;
  final: Label;
  answer: Answer | undefined;        // undefined while the section's file loads
  focused: boolean;                  // the run the outcome filter follows
  dimmed: boolean;                   // another card is being pointed at
  onHover: (on: boolean) => void;
}

const ICON = { caught: "✓", "correct No": "✓", missed: "✗", "false alarm": "✗", "no answer": "–" } as const;

export default function RunCard({ run, label, confidence, final, answer, focused, dimmed, onHover }: Props) {
  const outcome = outcomeOf(label, final);
  const c = familyColor(run);
  const pale = familyPale(run);
  const fill = run.dash ? `repeating-linear-gradient(135deg, ${c} 0 3px, ${pale} 3px 6px)` : c;
  const style = { "--c": c } as React.CSSProperties;
  return (
    <article className={`card run${run.dash ? " nov" : ""}${focused ? " focused" : ""}${dimmed ? " dimmed" : ""}`}
             style={style} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
             onFocus={() => onHover(true)} onBlur={() => onHover(false)}>
      <header className="run-head">
        <div className="run-title">
          <span className="run-name">{run.name}</span>
          <span className="run-study">{RUN_TAG[run.key] ?? `${run.study} · ${run.note}`}</span>
        </div>
      </header>

      {label ? (
        <>
          <div className="verdict">
            <span className={`answer ans-${label.toLowerCase()}`}>{label}</span>
            <span className={`outcome ${isError(outcome) ? (outcome === "missed" ? "o-missed" : "o-fa") : "o-ok"}`}>
              <span aria-hidden="true">{ICON[outcome]}</span> {outcome}
            </span>
          </div>
          <div className="confidence" title={`Stated confidence ${fmtConfidence(confidence)}`}>
            <span className="meter" role="img" aria-label={`Stated confidence ${fmtConfidence(confidence)}`}>
              {confidence != null ? <span style={{ width: `${Math.max(0, Math.min(1, confidence)) * 100}%`, background: fill }} /> : null}
            </span>
            <span className="conf-text"><b>{fmtConfidence(confidence)}</b> confidence</span>
            {run.family === "qwen" ? (
              <span className="pyes" title="The probability Qwen’s own output gave the word “Yes” where it wrote its label">
                P(Yes) {answer ? fmtPYes(answer.p) : "…"}
              </span>
            ) : null}
          </div>
          <div className="reason" tabIndex={0}>
            <h3>Reason given</h3>
            {answer ? <p>{answer.w || "—"}</p> : <p className="loading"><span className="skel w90" /><span className="skel w70" /></p>}
            {answer && (answer.m === "none" || answer.m === "partial") ? (
              <p className="note">
                Quoted passage{answer.m === "none" ? " (not found word for word in the section, so not underlined)" : " (only part of it found and underlined)"}:
                {" "}<q>{answer.s}</q>
              </p>
            ) : null}
            {answer && answer.m === "empty" ? <p className="note">No passage quoted.</p> : null}
            {answer?.b ? (
              <details className="before">
                <summary>Reasoning written before its answer</summary>
                <p>{answer.b}</p>
              </details>
            ) : null}
          </div>
        </>
      ) : (
        <p className="noans">{answer?.e === "not run yet" ? "Not answered yet: this run is still going." : `No answer${answer?.e ? ` (${answer.e})` : ""}.`}</p>
      )}
    </article>
  );
}
