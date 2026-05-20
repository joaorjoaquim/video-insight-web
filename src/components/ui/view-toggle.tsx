"use client";
import React from "react";

interface ViewToggleProps {
  currentView: string;
  views: Array<{ value: string; label: string }>;
  onViewChange: (view: string) => void;
}

export default function ViewToggle({ currentView, views, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-0 border border-[var(--rule)] rounded-[6px] overflow-hidden">
      {views.map((view) => {
        const isActive = currentView === view.value;
        return (
          <button
            key={view.value}
            type="button"
            onClick={() => onViewChange(view.value)}
            className={`px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors ${
              isActive
                ? "bg-[var(--bars)] text-white"
                : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--rule-soft)]"
            }`}
            style={{ fontFamily: "var(--font-mono-br, monospace)" }}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}
