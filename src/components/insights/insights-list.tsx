"use client";
import React from "react";

interface InsightItem {
  text: string;
  confidence?: number;
  key?: boolean;
  quote?: boolean;
}

interface InsightSection {
  title: string;
  icon?: any;
  items: InsightItem[];
}

interface InsightsListProps {
  chips: Array<{ label: string; variant: "secondary" | "destructive" }>;
  sections: InsightSection[];
}

export default function InsightsList({ chips, sections }: InsightsListProps) {
  return (
    <>
      {/* Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="br-eyebrow border px-2.5 py-1.5 rounded-[4px]"
            style={{
              borderColor: chip.variant === "destructive" ? "var(--play)" : "var(--rule)",
              color: chip.variant === "destructive" ? "var(--play)" : "var(--ink-2)",
            }}
          >
            {chip.label}
          </span>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-10 max-w-3xl">
        {sections.map((section, i) => (
          <div key={i}>
            {/* Section header with logo-bars */}
            <div className="flex items-center gap-3 mb-5">
              <span className="logo-bars"><i/><i/><i/></span>
              <span className="br-eyebrow text-[var(--play-700)]">0{i + 1}</span>
              <h3
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.3rem", letterSpacing: "-0.01em" }}
                className="text-[var(--ink-1)]"
              >
                {section.title}
              </h3>
            </div>

            {/* Items */}
            <div className="space-y-4 ml-9">
              {section.items.map((item, j) => (
                <div key={j} className="grid grid-cols-[56px_1fr] gap-4 items-start">
                  <div>
                    {item.confidence !== undefined && (
                      <span
                        className="br-eyebrow tabular-nums"
                        style={{ color: item.confidence >= 90 ? "var(--led-completed)" : "var(--ink-3)", fontFamily: "var(--font-mono-br, monospace)" }}
                      >
                        {item.confidence}%
                      </span>
                    )}
                  </div>
                  <div>
                    {item.key && (
                      <span
                        className="br-eyebrow mr-2"
                        style={{ color: "var(--play)", borderBottom: "1px solid var(--play)", paddingBottom: 1 }}
                      >
                        Key
                      </span>
                    )}
                    {item.quote ? (
                      <div className="pull-quote mt-1">
                        <div className="body">{item.text}</div>
                      </div>
                    ) : (
                      <span className="text-[var(--ink-1)] text-sm leading-relaxed">{item.text}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
