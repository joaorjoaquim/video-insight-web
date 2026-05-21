"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CustomSelect({ options, value, onChange, className }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-3 border border-[var(--rule)] rounded-[6px] px-3 py-2 min-w-[170px] text-[11px] font-medium tracking-[0.1em] bg-white dark:bg-zinc-900 text-[var(--ink-2)] focus:outline-none focus:border-[var(--bars)] transition-colors"
        style={{ fontFamily: "var(--font-mono-br, monospace)" }}
      >
        <span>{selected?.label ?? ""}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          className={cn("flex-shrink-0 transition-transform duration-150", open && "rotate-180")}
          aria-hidden
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="custom-select-panel absolute top-full mt-1 left-0 z-50 min-w-full bg-white dark:bg-zinc-900 border border-[var(--rule)] rounded-[8px] shadow-lg py-1 overflow-hidden"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); close(); }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-[11px] font-medium tracking-[0.1em] transition-colors",
                    isSelected
                      ? "bg-[var(--bars)] text-white"
                      : "text-[var(--ink-2)] hover:bg-[var(--rule-soft)] hover:text-[var(--ink-1)]"
                  )}
                  style={{ fontFamily: "var(--font-mono-br, monospace)" }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
