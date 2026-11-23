/** One model run, as described in public/data/index.json. */
export interface Run {
  key: RunKey;
  name: string;          // "Claude Fable 5.2"
  short: string;         // "Fable"
  study: "this run" | "November";
  family: "claude" | "qwen";
  dash: boolean;         // November runs: dashed line, paler fill
  note: string;          // setting and prompt layout
}

export type RunKey = "fable" | "qwen_block" | "opus" | "qwen_chat";
export type Label = "Yes" | "No";

/** One section in the index: enough to filter, count and step through all 3,000 without loading their text. */
export interface IndexSection {
  i: string;             // section id
  v: number;             // volume
  o: number;             // order in the volume
  l: string;             // law
  n: number;             // characters
  f: Label;              // coders' final label
  fs: string;            // "agreed" | "disputed" | "single coder"
  c: string;             // coders' first answers, labels only, e.g. "Yes · No"
  r: 0 | 1;              // grants a power to write regulations and names no outside process
  y: (Label | null)[];   // each run's label, in run order (null: no answer)
  k: (number | null)[];  // each run's stated confidence, in run order
}

export interface IndexFile {
  runs: Run[];
  generated: string;
  length_edges: number[];
  n: number;
  sections: IndexSection[];
}

/** One run's full answer for one section (public/data/sections/<id>.json). */
export interface Answer {
  y: Label | null;       // label (null: no answer)
  c?: number | null;     // stated confidence, 0-1
  w?: string;            // stated reason
  s?: string;            // quoted passage, as the model wrote it
  h?: [number, number][];// where that passage sits in the section text (character offsets)
  m?: "full" | "partial" | "none" | "empty";
  b?: string;            // reasoning written before the answer (November runs)
  p?: number | null;     // Qwen: P(Yes) from its own output
  e?: string;            // why there is no answer
}

export interface SectionFile {
  i: string;
  t: string;             // the section text, exactly as the models saw it
  a: Record<RunKey, Answer>;
}

export type Outcome = "caught" | "missed" | "false alarm" | "correct No" | "no answer";
