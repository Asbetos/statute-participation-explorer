"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "./SiteHeader";

// The study's dashboard, written by the study repo (eval/compare_dashboard.py --site) as one self-contained page.
// It is shown in a frame so its charts and scripts stay as built; inside the frame it takes the site's typeface
// and colours, drops its own title and theme button, and follows the theme switch in this header.
// A folder with an index.html, not dashboard.html: Vercel serves .html files only at their extension-less address,
// so a ".html" link breaks there while it works on a plain file server; "/embed/dashboard/" works on both.
const DASHBOARD = "/embed/dashboard/";

export default function DashboardView() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  // On a first visit the frame can finish loading before this page is interactive, so its load event is missed:
  // check once on mount as well.
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (doc && doc.readyState === "complete" && doc.URL.endsWith(DASHBOARD)) setLoaded(true);
  }, []);
  return (
    <div className="app">
      <SiteHeader
        active="dashboard"
        title="Q1 Results Dashboard"
        lede={<>How Claude Fable 5.2 and Qwen3.6-27B, given the same instructions, compare with the coders’ final
          labels on the 3,000 statute sections: every measure explained, where each goes wrong, and how sure each was.</>}
        tools={<a className="btn ghost" href={DASHBOARD} target="_blank" rel="noreferrer">Open as a full page</a>}
      />
      <div className="dash-frame">
        {!loaded ? <div className="state" role="status">Loading the dashboard…</div> : null}
        <iframe ref={frame} src={DASHBOARD} onLoad={() => setLoaded(true)}
                title="Q1 results dashboard: Claude Fable 5.2 and Qwen3.6-27B against the coders’ final labels" />
      </div>
    </div>
  );
}
