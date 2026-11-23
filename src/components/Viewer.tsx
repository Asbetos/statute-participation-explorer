"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutDialog from "./AboutDialog";
import FilterBar from "./FilterBar";
import RunCard from "./RunCard";
import SearchBox from "./SearchBox";
import SectionText from "./SectionText";
import ThemeToggle from "./ThemeToggle";
import { DEFAULT_FILTERS, fmtInt, isLookup, matchesLookup, modelsDisagree, outcomeOf, type Filters } from "@/lib/model";
import { readHash, writeHash } from "@/lib/state";
import type { IndexFile, IndexSection, Outcome, SectionFile } from "@/lib/types";

const REPO_URL = "https://github.com/Asbetos/statute-participation-explorer";

export default function Viewer() {
  const [index, setIndex] = useState<IndexFile | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [search, setSearch] = useState<string[] | null>(null);
  const [detail, setDetail] = useState<SectionFile | null>(null);
  const [hoverRun, setHoverRun] = useState<number | null>(null);
  const [about, setAbout] = useState(false);
  const cache = useRef(new Map<string, SectionFile>());
  const searchBox = useRef<HTMLInputElement>(null);

  /* ---- the index: every section's labels and confidences, enough to filter and step through */
  useEffect(() => {
    fetch("/data/index.json")
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`index.json: ${r.status}`))))
      .then((d: IndexFile) => {
        const v = readHash(d.runs.length);
        setFilters({ model: v.model, outcome: v.outcome, disagree: v.disagree, query: v.query });
        setCurrentId(v.section);
        setIndex(d);
      })
      .catch(e => setFailed(String(e)));
  }, []);

  /* ---- word search needs the text of every section: fetched once, the first time it is needed */
  const query = filters.query.trim().toLowerCase();
  const wordSearch = query.length > 0 && !isLookup(query);
  useEffect(() => {
    if (!wordSearch || search) return;
    fetch("/data/search.json").then(r => r.json()).then(setSearch).catch(() => setSearch([]));
  }, [wordSearch, search]);

  /* ---- the sections that match the filters, and the outcome counts shown on the filter chips */
  const { list, counts } = useMemo(() => {
    const empty = { list: [] as IndexSection[], counts: {} as Record<Outcome | "all", number> };
    if (!index) return empty;
    const pass: IndexSection[] = [];
    index.sections.forEach((s, i) => {
      if (filters.disagree && !modelsDisagree(s)) return;
      if (query) {
        if (!wordSearch) { if (!matchesLookup(s, query)) return; }
        else if (!search || !search[i]?.includes(query)) return;
      }
      pass.push(s);
    });
    const c = { all: pass.length, caught: 0, missed: 0, "false alarm": 0, "correct No": 0, "no answer": 0 };
    for (const s of pass) c[outcomeOf(s.y[filters.model], s.f)]++;
    const out = filters.outcome === "all" ? pass : pass.filter(s => outcomeOf(s.y[filters.model], s.f) === filters.outcome);
    return { list: out, counts: c };
  }, [index, filters, query, wordSearch, search]);

  /* ---- where we are in the filtered list; a section that drops out of it falls back to the first */
  const pos = useMemo(() => {
    const k = currentId ? list.findIndex(s => s.i === currentId) : -1;
    return k >= 0 ? k : 0;
  }, [list, currentId]);
  const sec = list[pos] ?? null;

  useEffect(() => {
    if (sec && sec.i !== currentId) setCurrentId(sec.i);
  }, [sec, currentId]);

  /* ---- the current section's text and answers, with its neighbours fetched ahead */
  const load = useCallback(async (id: string): Promise<SectionFile> => {
    const hit = cache.current.get(id);
    if (hit) return hit;
    const r = await fetch(`/data/sections/${encodeURIComponent(id)}.json`);
    if (!r.ok) throw new Error(`section ${id}: ${r.status}`);
    const d = (await r.json()) as SectionFile;
    cache.current.set(id, d);
    return d;
  }, []);

  useEffect(() => {
    if (!sec) { setDetail(null); return; }
    let live = true;
    const hit = cache.current.get(sec.i);
    setDetail(hit ?? null);
    if (!hit) load(sec.i).then(d => live && setDetail(d)).catch(() => live && setDetail(null));
    for (const k of [pos + 1, pos - 1, pos + 2]) if (list[k]) load(list[k].i).catch(() => undefined);
    return () => { live = false; };
  }, [sec, pos, list, load]);

  /* ---- keep the address bar in step, so the current view can be linked to */
  useEffect(() => {
    if (index) writeHash({ ...filters, section: sec?.i ?? null });
  }, [index, filters, sec]);

  const go = useCallback((step: number) => {
    const k = pos + step;
    if (k >= 0 && k < list.length) setCurrentId(list[k].i);
  }, [pos, list]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (about || e.altKey || e.ctrlKey || e.metaKey) return;
      if (!typing && (e.key === "ArrowRight" || e.key === "j")) { e.preventDefault(); go(1); }
      else if (!typing && (e.key === "ArrowLeft" || e.key === "k")) { e.preventDefault(); go(-1); }
      else if (!typing && e.key === "/") { e.preventDefault(); searchBox.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, about]);

  const update = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));

  if (failed) return <div className="fatal">The data could not be loaded ({failed}). Try reloading the page.</div>;

  const runs = index?.runs ?? [];
  const searching = wordSearch && !search;
  const active = filters.outcome !== "all" || filters.disagree || !!filters.query;

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <p className="eyebrow">Citizen Voice project · Coding participation in U.S. public laws</p>
          <h1>Q1 Reasoning Viewer</h1>
          <p className="lede">
            How four AI model runs answered <q>Does this section recommend or require participation?</q> for 3,000 coded
            statute sections, one section at a time.
          </p>
        </div>
        <div className="top-actions">
          <SearchBox value={filters.query} searching={searching} inputRef={searchBox} onChange={q => update({ query: q })} />
          <button type="button" className="btn ghost" onClick={() => setAbout(true)}>How to read this</button>
          <a className="btn ghost" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
          <ThemeToggle />
        </div>
      </header>

      <FilterBar runs={runs} filters={filters} counts={counts} active={active}
                 onChange={update} onReset={() => setFilters(f => ({ ...DEFAULT_FILTERS, model: f.model }))} />

      {!index ? (
        <div className="state">Loading the 3,000 sections…</div>
      ) : !sec ? (
        <div className="state">
          {searching ? "Searching every section…" : <>No section matches these filters. <button type="button" className="linkish"
            onClick={() => setFilters(f => ({ ...DEFAULT_FILTERS, model: f.model }))}>Clear the filters</button></>}
        </div>
      ) : (
        <>
          <div className="secbar">
            <div className="where" aria-live="polite">
              <span className="where-n">{fmtInt(pos + 1)}</span>
              <span className="where-of">of {fmtInt(list.length)}{list.length < index.n ? " matching" : ""}</span>
            </div>
            <div className="sec-facts">
              <span className={`final final-${sec.f.toLowerCase()}`}>
                Coders’ final label <b>{sec.f}</b>{sec.fs === "disputed" ? " · still disputed" : sec.fs === "single coder" ? " · one coder" : ""}
              </span>
              <span className="facts">
                Volume {sec.v} · {sec.l} · {fmtInt(sec.n)} characters · coders’ first answers: {sec.c || "—"}
              </span>
              {sec.r ? <span className="tag">Grants a power to write regulations</span> : null}
            </div>
            <div className="nav">
              <button type="button" className="btn nav-btn" onClick={() => go(-1)} disabled={pos === 0}
                      aria-label="Previous section" title="Previous section (←)">← Previous</button>
              <button type="button" className="btn nav-btn primary" onClick={() => go(1)} disabled={pos >= list.length - 1}
                      aria-label="Next section" title="Next section (→)">Next →</button>
            </div>
            <div className="progress" aria-hidden="true">
              <span style={{ width: `${((pos + 1) / list.length) * 100}%` }} />
            </div>
          </div>

          <main className="stage">
            <section className="panel text-panel" aria-label="Section text">
              <div className="panel-head">
                <h2>Section text</h2>
                <span className="hint">Underlined: the passage each model quoted. Point at it to see whose it is.</span>
              </div>
              <SectionText key={sec.i} text={detail?.i === sec.i ? detail.t : null} answers={detail?.i === sec.i ? detail.a : null}
                           runs={runs} hoverRun={hoverRun} />
            </section>
            <section className="cards" aria-label="Model answers" style={{ gridTemplateColumns: `repeat(${runs.length}, minmax(0, 1fr))` }}>
              {runs.map((run, k) => (
                <RunCard key={run.key} run={run} label={sec.y[k]} confidence={sec.k[k]} final={sec.f}
                         answer={detail?.i === sec.i ? detail.a[run.key] : undefined}
                         focused={filters.model === k} dimmed={hoverRun !== null && hoverRun !== k}
                         onHover={on => setHoverRun(on ? k : null)} />
              ))}
            </section>
          </main>
        </>
      )}

      <AboutDialog open={about} onClose={() => setAbout(false)} runs={runs} generated={index?.generated ?? ""} />
    </div>
  );
}
