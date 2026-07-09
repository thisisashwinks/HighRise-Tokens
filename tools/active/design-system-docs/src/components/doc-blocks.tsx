import type { ReactNode } from "react";
import { figmaEmbedUrl, figmaNodeLink } from "@/lib/data";

/** Reusable example card: soft checkered canvas, label, optional caption. */
export function ExamplePreview({
  label,
  caption,
  children,
  padded = true,
}: {
  label?: string;
  caption?: string;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-gray-200 shadow-card dark:border-surface-line">
      {label && (
        <figcaption className="border-b border-gray-200 bg-white px-4 py-2 text-sub font-medium text-gray-700 dark:border-surface-line dark:bg-surface-raised dark:text-gray-300">
          {label}
        </figcaption>
      )}
      <div className={`example-canvas flex min-h-[120px] flex-wrap items-center justify-center gap-4 ${padded ? "p-6" : "p-3"}`}>
        {children}
      </div>
      {caption && (
        <p className="border-t border-gray-200 bg-white px-4 py-2 text-[12px] text-gray-500 dark:border-surface-line dark:bg-surface-raised dark:text-gray-400">
          {caption}
        </p>
      )}
    </figure>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
        <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function XIcon() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
        <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Visual Do / Don't card with a mini illustration, a headline, and extra bullets. */
export function DoDontCard({
  kind,
  headline,
  bullets = [],
  sketch,
}: {
  kind: "do" | "dont";
  headline: string;
  bullets?: string[];
  sketch?: ReactNode;
}) {
  const isDo = kind === "do";
  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isDo
          ? "border-emerald-200 dark:border-emerald-900"
          : "border-red-200 dark:border-red-900"
      }`}
    >
      {sketch && (
        <div
          className={`flex min-h-[110px] items-center justify-center border-b p-5 ${
            isDo
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-900/10"
              : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10"
          }`}
        >
          {sketch}
        </div>
      )}
      <div className={`p-4 ${isDo ? "bg-emerald-50/30 dark:bg-emerald-900/5" : "bg-red-50/30 dark:bg-red-900/5"}`}>
        <div className="flex items-start gap-2.5">
          {isDo ? <CheckIcon /> : <XIcon />}
          <div className="flex-1">
            <p className={`text-body font-semibold ${isDo ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
              {isDo ? "Do" : "Don't"}
            </p>
            <p className="mt-0.5 text-body text-gray-700 dark:text-gray-300">{headline}</p>
            {bullets.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sub text-gray-600 dark:text-gray-400">
                {bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface PropRow {
  name: string;
  options: string;
  defaultValue: string;
  description: string;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-surface-line">
      <table className="w-full border-collapse text-sub">
        <thead className="bg-gray-50 dark:bg-surface-raised">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Prop</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type / options</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Default</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-surface-raised/50">
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-gray-100 dark:border-surface-line/70">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[12px] font-medium text-primary-700 dark:text-primary-400">
                {r.name}
              </td>
              <td className="px-3 py-2 font-mono text-[11.5px] text-gray-600 dark:text-gray-400">{r.options}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11.5px] text-gray-500">{r.defaultValue || "—"}</td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Figma page embed for a component. */
export function FigmaEmbed({ nodeId, title }: { nodeId: string; title: string }) {
  const src = figmaEmbedUrl(nodeId);
  if (!src) return null;
  return (
    <iframe
      src={src}
      title={title}
      width="100%"
      height={560}
      allowFullScreen
      loading="lazy"
      className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-surface-line dark:bg-surface-raised"
    />
  );
}

export function FigmaNodeLink({ nodeId, children }: { nodeId: string; children: ReactNode }) {
  return (
    <a href={figmaNodeLink(nodeId)} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
