import type { ReactNode } from "react";

// Minimal shadcn-style primitives, hand-written.

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "primary" | "success" | "warning" | "error";
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    error: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-canvas dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function Callout({
  children,
  tone = "info",
  title,
}: {
  children: ReactNode;
  tone?: "info" | "warning" | "success" | "error";
  title?: string;
}) {
  const tones: Record<string, string> = {
    info: "border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-900/20",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20",
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20",
    error: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20",
  };
  return (
    <div className={`mt-4 rounded-lg border p-4 text-body ${tones[tone]}`}>
      {title ? (
        <p className="!mt-0 mb-1 font-semibold text-gray-900 dark:text-gray-100">{title}</p>
      ) : null}
      <div className="[&>p]:!mt-0 text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 font-mono text-[12.5px] leading-5 text-gray-100 dark:border-gray-800 dark:bg-black">
      <code>{children}</code>
    </pre>
  );
}

export function Swatch({ hex, size = 20 }: { hex: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded border border-gray-900/10 align-middle dark:border-white/20"
      style={{ backgroundColor: hex, width: size, height: size }}
      title={hex}
    />
  );
}

export function TokenPath({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[12px] text-gray-800 dark:bg-gray-800 dark:text-gray-200">
      {children}
    </code>
  );
}
