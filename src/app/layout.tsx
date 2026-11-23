import type { Metadata, Viewport } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// The deck's typefaces: Source Serif 4 for headings and the statute text, Public Sans for everything else.
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Q1 Reasoning Viewer",
  description:
    "Step through 3,000 coded U.S. statute sections one at a time and see how four AI model runs answered Q1 " +
    "(does this section recommend or require participation?), with their confidence and stated reasons.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1B19" },
  ],
};

// Applies a saved light/dark choice before the first paint, so the page never flashes the wrong theme.
const themeScript = `try{var t=localStorage.getItem("q1v-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
