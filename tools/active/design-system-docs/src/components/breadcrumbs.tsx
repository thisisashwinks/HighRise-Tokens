import Link from "next/link";
import { Fragment } from "react";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sub text-gray-500 dark:text-gray-400">
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 dark:hover:text-gray-100">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
