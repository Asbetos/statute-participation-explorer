"use client";

import { useEffect, useMemo, useRef } from "react";
import { familyColor } from "@/lib/model";
import type { Answer, Run, RunKey } from "@/lib/types";

interface Props {
  text: string | null;
  answers: Record<RunKey, Answer> | null;
  runs: Run[];
  hoverRun: number | null;
}

// The extracted statute text often has a blank line between lines; close those up for reading. Each piece is
// tidied after it is cut, so the quoted-passage offsets (which index the original text) stay exact.
const tidy = (t: string) => t.replace(/\n[ \t]*(?:\n[ \t]*)+/g, "\n");

/** One underline per run that quoted the piece: solid for this run, dashed for November, in the family colour,
 *  stacked 3px apart, over a faint background. */
function stripes(rs: Run[]): React.CSSProperties {
  const img: string[] = [], size: string[] = [], pos: string[] = [];
  rs.forEach((r, j) => {
    const c = familyColor(r);
    img.push(r.dash ? `repeating-linear-gradient(90deg, ${c} 0 6px, transparent 6px 9px)` : `linear-gradient(${c}, ${c})`);
    size.push("100% 2px");
    pos.push(`0 calc(100% - ${j * 3}px)`);
  });
  img.push("linear-gradient(var(--mark-bg), var(--mark-bg))");
  size.push("100% 100%");
  pos.push("0 0");
  return { backgroundImage: img.join(", "), backgroundSize: size.join(", "), backgroundPosition: pos.join(", "),
           paddingBottom: `${rs.length * 3}px` };
}

export default function SectionText({ text, answers, runs, hoverRun }: Props) {
  const box = useRef<HTMLDivElement>(null);

  const pieces = useMemo(() => {
    if (text == null || !answers) return null;
    const on = runs.map((r, k) => ({ r, k, h: answers[r.key]?.h ?? [] })).filter(x => x.h.length);
    const cuts = new Set<number>([0, text.length]);
    for (const x of on) for (const [a, b] of x.h) { cuts.add(a); cuts.add(b); }
    const pts = [...cuts].sort((a, b) => a - b);
    const out: { text: string; who: number[] }[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const who = on.filter(x => x.h.some(([s, e]) => s <= a && b <= e)).map(x => x.k);
      out.push({ text: tidy(text.slice(a, b)), who });
    }
    return out;
  }, [text, answers, runs]);

  // open each section at its first quoted passage
  useEffect(() => {
    const el = box.current;
    const first = el?.querySelector("mark");
    if (el && first) el.scrollTop = Math.max(0, (first as HTMLElement).offsetTop - el.offsetTop - 28);
  }, [pieces]);

  if (!pieces) {
    return (
      <div className="statute loading" aria-busy="true">
        <span className="skel w90" /><span className="skel w75" /><span className="skel w85" /><span className="skel w60" />
      </div>
    );
  }
  return (
    <div className="statute" ref={box} tabIndex={0}>
      {pieces.map((p, i) => {
        if (!p.who.length) return <span key={i}>{p.text}</span>;
        const rs = p.who.map(k => runs[k]);
        const cls = hoverRun === null ? "" : p.who.includes(hoverRun) ? " lift" : " fade";
        return (
          <mark key={i} className={`q${cls}`} style={stripes(rs)}
                title={`Quoted by ${rs.map(r => `${r.name} (${r.study})`).join(", ")}`}>
            {p.text}
          </mark>
        );
      })}
    </div>
  );
}
