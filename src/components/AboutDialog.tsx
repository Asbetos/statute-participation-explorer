"use client";

import { useEffect, useRef } from "react";
import { familyColor } from "@/lib/model";
import type { Run } from "@/lib/types";

interface Props { open: boolean; onClose: () => void; runs: Run[]; generated: string }

export default function AboutDialog({ open, onClose, runs, generated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="about" onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className="about-body">
        <header>
          <h2>How to read this viewer</h2>
          <button type="button" className="btn ghost icon" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <h3>The four model runs</h3>
        <ul className="run-list">
          {runs.map(r => (
            <li key={r.key}>
              <span className={`key${r.dash ? " dash" : ""}`} style={{ borderTopColor: familyColor(r) }} aria-hidden="true" />
              <span><b>{r.name}</b>, {r.study}: {r.note}.</span>
            </li>
          ))}
        </ul>
        <p>Orange is always a Claude model and blue always Qwen, as on the project slides. A solid line marks this run;
          a dashed line, and a paler fill, mark the November runs.</p>

        <h3>On each screen</h3>
        <ul>
          <li><b>The section</b> is the statute text exactly as the models saw it. A line under a passage marks the text a
            model quoted as the basis for its answer. Point at a model’s card to bring its passage forward.</li>
          <li><b>The coders’ final label</b> is Yes when every coder’s final answer is Yes; the few sections still split
            in the final sheet count as Yes and say “still disputed”. The first answers are what each coder put down
            before they reconciled.</li>
          <li><b>Each card</b> gives a model’s answer and how it compares with the final label: <i>caught</i> (both Yes),
            <i> missed</i> (final Yes, model No), <i>false alarm</i> (final No, model Yes) or <i>correct No</i>. Then the
            confidence the model stated, from 0 to 1, and the reason it gave.</li>
          <li><b>P(Yes)</b>, for Qwen only, is the probability Qwen’s own output gave the word “Yes” where it wrote its
            label. It is almost always very close to 0 or 1.</li>
        </ul>

        <h3>The numbers behind it</h3>
        <p>The <b>Dashboard</b> tab sums up this run: how Claude Fable 5.2 and Qwen3.6-27B compare with the coders’ final
          labels on all 3,000 sections, what each measure means, where each model goes wrong and how sure it was.</p>

        <h3>Finding sections</h3>
        <p>Pick a model and an outcome to see, for example, only Fable’s false alarms; the counts on each choice update as
          you filter. <i>Models disagree</i> keeps the sections where the four runs do not all give the same answer.
          Search finds a law (such as “90-72”) or any words in the text and the reasons. Move with the buttons or the
          ← and → keys; press / to search. The address bar always holds a link to the section on screen.</p>

        <h3>Read with care</h3>
        <ul>
          <li>A stated reason is the model’s own account of its answer, written with it. It may not capture everything
            that produced the label. Fable and Opus can also think privately before answering, and did on most sections;
            that thinking was not saved.</li>
          <li>Stated confidence is the model’s own claim, not a measured probability.</li>
          <li>The final label is the coders’ reconciled judgement, not an absolute truth: some disagreements may be
            coding errors.</li>
        </ul>
        <p className="small">3,000 sections drawn at random from 19 volumes of coded U.S. public laws; the same sections and
          final labels in every run. Data built {generated}.</p>
      </div>
    </dialog>
  );
}
