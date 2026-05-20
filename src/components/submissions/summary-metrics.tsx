"use client";
import React from "react";

import { SummaryMetric } from "../../types/submission";

interface SummaryMetricsProps {
  metrics: SummaryMetric[];
}

export default function SummaryMetrics({ metrics }: SummaryMetricsProps) {
  return (
    <div>
      {metrics.map((metric, index) => (
        <div key={index} className="flex justify-between items-baseline py-3 border-b border-[var(--rule-soft)]">
          <span className="br-eyebrow">{metric.label}</span>
          <span
            style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.5rem", letterSpacing: "-0.01em", color: "var(--ink-1)" }}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
} 