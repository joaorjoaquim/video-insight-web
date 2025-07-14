"use client";
import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index === 0 && (
            <Link
              href={item.href || "#"}
              className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="text-lg" /> {item.label}
            </Link>
          )}
          {index > 0 && (
            <>
              <span className="text-zinc-300">/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-indigo-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 