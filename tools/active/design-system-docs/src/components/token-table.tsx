"use client";

import { useMemo, useState } from "react";

function isHex(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-5 w-5 shrink-0 rounded border border-gray-900/10 align-middle dark:border-white/20"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mb-3 w-full max-w-sm rounded-md border border-gray-200 bg-white px-3 py-2 text-body text-gray-900 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    />
  );
}

export interface TokenRow {
  path: string;
  value: string;
  type: string;
  description: string;
  resolved?: string;
}

export function TokenTable({
  rows,
  searchPlaceholder = "Search tokens",
  showType = true,
}: {
  rows: TokenRow[];
  searchPlaceholder?: string;
  showType?: boolean;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (r) =>
        r.path.toLowerCase().includes(query) ||
        r.value.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        (r.resolved ?? "").toLowerCase().includes(query)
    );
  }, [q, rows]);

  return (
    <div>
      <SearchInput value={q} onChange={setQ} placeholder={searchPlaceholder} />
      <p className="mb-2 text-sub text-gray-500 dark:text-gray-400">
        {filtered.length} of {rows.length} tokens
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full border-collapse text-sub">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Token</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Value</th>
              {showType && (
                <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
              )}
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900/50">
            {filtered.slice(0, 400).map((r) => (
              <tr key={r.path} className="border-t border-gray-100 dark:border-gray-800/70">
                <td className="px-3 py-2 font-mono text-[12px] text-gray-800 dark:text-gray-200">{r.path}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    {isHex(r.resolved) && <Swatch hex={r.resolved as string} />}
                    <span className="font-mono text-[12px] text-gray-700 dark:text-gray-300">{r.value}</span>
                    {r.resolved && r.resolved !== r.value && (
                      <span className="font-mono text-[11px] text-gray-400">→ {r.resolved}</span>
                    )}
                  </span>
                </td>
                {showType && <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{r.type}</td>}
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 400 && (
          <p className="border-t border-gray-100 px-3 py-2 text-sub text-gray-500 dark:border-gray-800">
            Showing the first 400 matches. Refine your search to see the rest.
          </p>
        )}
      </div>
    </div>
  );
}

export interface SemanticColorRow {
  path: string;
  light: string;
  dark: string | null;
  lightRef: string | null;
  darkRef: string | null;
  description: string;
}

export function SemanticColorTable({ rows }: { rows: SemanticColorRow[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(
      (r) =>
        r.path.toLowerCase().includes(query) ||
        r.light.toLowerCase().includes(query) ||
        (r.dark ?? "").toLowerCase().includes(query) ||
        (r.lightRef ?? "").toLowerCase().includes(query) ||
        (r.darkRef ?? "").toLowerCase().includes(query)
    );
  }, [q, rows]);

  return (
    <div>
      <SearchInput value={q} onChange={setQ} placeholder="Search semantic color tokens" />
      <p className="mb-2 text-sub text-gray-500 dark:text-gray-400">
        {filtered.length} of {rows.length} tokens
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full border-collapse text-sub">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Token</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Light</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Dark</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900/50">
            {filtered.slice(0, 400).map((r) => (
              <tr key={r.path} className="border-t border-gray-100 dark:border-gray-800/70">
                <td className="px-3 py-2 font-mono text-[12px] text-gray-800 dark:text-gray-200">{r.path}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    {isHex(r.light) && <Swatch hex={r.light} />}
                    <span className="font-mono text-[12px] text-gray-700 dark:text-gray-300">{r.light}</span>
                    {r.lightRef && (
                      <span className="font-mono text-[11px] text-gray-400">{r.lightRef}</span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    {isHex(r.dark) && <Swatch hex={r.dark as string} />}
                    <span className="font-mono text-[12px] text-gray-700 dark:text-gray-300">
                      {r.dark ?? "—"}
                    </span>
                    {r.darkRef && <span className="font-mono text-[11px] text-gray-400">{r.darkRef}</span>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 400 && (
          <p className="border-t border-gray-100 px-3 py-2 text-sub text-gray-500 dark:border-gray-800">
            Showing the first 400 matches. Refine your search to see the rest.
          </p>
        )}
      </div>
    </div>
  );
}
