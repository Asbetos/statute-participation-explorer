import type { Metadata } from "next";
import DashboardView from "@/components/DashboardView";

export const metadata: Metadata = {
  title: "Q1 Results Dashboard",
  description:
    "How Claude Fable 5.2 and Qwen3.6-27B, given the same instructions, compare with the coders’ final labels on " +
    "3,000 coded U.S. statute sections for Q1 (does this section recommend or require participation?).",
};

export default function Page() {
  return <DashboardView />;
}
