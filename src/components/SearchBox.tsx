"use client";

import type { RefObject } from "react";

interface Props {
  value: string;
  searching: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (q: string) => void;
}

/** A law number (e.g. "90-72") is found at once from the index; words are searched in every section's text and
 *  reasons once the search file has loaded. */
export default function SearchBox({ value, searching, inputRef, onChange }: Props) {
  return (
    <div className="search" role="search">
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      <input ref={inputRef} type="search" value={value} aria-label="Search a law or words"
             placeholder="Search a law (90-72) or words" onChange={e => onChange(e.target.value)} />
      {searching ? <span className="search-note">searching…</span> : <kbd className="kbd" title="Press / to search">/</kbd>}
    </div>
  );
}
