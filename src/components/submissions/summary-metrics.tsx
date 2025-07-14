"use client";
import React from "react";

import { SummaryMetric } from "../../types/submission";

interface SummaryMetricsProps {
  metrics: SummaryMetric[];
}

export default function SummaryMetrics({ metrics }: SummaryMetricsProps) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
      {metrics.map((metric, index) => (
        <div key={index}>
          <div className="text-zinc-500 mb-1">{metric.label}</div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{metric.value}</div>
        </div>
      ))}
    </div>
  );
} 