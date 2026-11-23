"use client";

import { useEffect, useState } from "react";

/** Light / dark switch. The choice is remembered in this browser (if storage is allowed); otherwise the
 *  page follows the system setting. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const set = document.documentElement.getAttribute("data-theme");
    setDark(set ? set === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("q1v-theme", next); } catch { /* storage blocked */ }
    setDark(!dark);
  };
  return (
    <button type="button" className="btn ghost icon" onClick={flip} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            title={dark ? "Light theme" : "Dark theme"}>
      {dark ? (
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />{[0, 45, 90, 135, 180, 225, 270, 315].map(a => <path key={a} d="M10 2.2v2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${a} 10 10)`} />)}</svg>
      ) : (
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M15.5 12.6A6.2 6.2 0 0 1 7.4 4.5a6.2 6.2 0 1 0 8.1 8.1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      )}
    </button>
  );
}
