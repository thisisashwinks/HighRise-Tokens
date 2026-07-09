import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, type NavComponent } from "@/components/sidebar";
import { componentIndex, CATEGORY_LABELS, categoryLabel } from "@/lib/data";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "HighRise Design System",
  description:
    "Documentation for the HighRise token system: primitives, semantics, component tokens, dark mode, and white-label theming.",
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("hr-theme");
    var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const byCategory: Record<string, NavComponent[]> = {};
  for (const c of componentIndex) {
    (byCategory[c.category] ??= []).push({ slug: c.slug, name: c.name, category: c.category });
  }
  const labels: Record<string, string> = { ...CATEGORY_LABELS };
  for (const cat of Object.keys(byCategory)) labels[cat] = categoryLabel(cat);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Sidebar componentsByCategory={byCategory} categoryLabels={labels} />
        <main className="ml-[280px] min-h-screen">
          <div className="mx-auto max-w-[940px] px-8 py-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
