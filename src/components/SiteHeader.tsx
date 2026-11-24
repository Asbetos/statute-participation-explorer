"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { lastView } from "@/lib/state";

export const REPO_URL = "https://github.com/Asbetos/statute-participation-explorer";

export type Tab = "sections" | "dashboard";

interface Props {
  active: Tab;
  title: string;
  lede: React.ReactNode;
  /** The page's own tools (the viewer's search and help), on a second row under the tabs. */
  tools?: React.ReactNode;
}

/** The header both views share: the title of the current view on the left; on the right the two tabs, the
 *  GitHub link and the theme switch, with the view's own tools underneath. */
export default function SiteHeader({ active, title, lede, tools }: Props) {
  // Going back to the sections returns to the section and filters last on screen in this tab.
  const [sectionsHref, setSectionsHref] = useState("/");
  useEffect(() => { if (active !== "sections") setSectionsHref(`/${lastView()}`); }, [active]);

  return (
    <header className="top">
      <div className="brand">
        <p className="eyebrow">Citizen Voice project · Coding participation in U.S. public laws</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
      </div>
      <div className="top-side">
        <div className="top-row">
          <nav className="segmented tabs" aria-label="Views">
            <Link href={sectionsHref} className={`seg${active === "sections" ? " on" : ""}`}
                  aria-current={active === "sections" ? "page" : undefined}>
              <span className="seg-name">Sections</span>
            </Link>
            <Link href="/dashboard/" className={`seg${active === "dashboard" ? " on" : ""}`}
                  aria-current={active === "dashboard" ? "page" : undefined}>
              <span className="seg-name">Dashboard</span>
            </Link>
          </nav>
          <a className="btn ghost" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
          <ThemeToggle />
        </div>
        {tools ? <div className="top-row">{tools}</div> : null}
      </div>
    </header>
  );
}
