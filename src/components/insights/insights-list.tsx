"use client";
import React from "react";
import { Badge } from "../ui/badge";

import { InsightItem, InsightSection } from "../../types/submission";

interface InsightsListProps {
  chips: Array<{ label: string; variant: "secondary" | "destructive" }>;
  sections: InsightSection[];
}

export default function InsightsList({ chips, sections }: InsightsListProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {chips.map((chip, i) => (
          <Badge key={i} variant={chip.variant}>
            {chip.label}
          </Badge>
        ))}
      </div>
      <div className="space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="border-l-2 border-purple-200 pl-4">
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</h3>
            </div>
            <div className="space-y-3 ml-6">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="flex gap-2 mt-0.5">
                    {item.confidence && (
                      <Badge variant="secondary" className="text-xs font-mono font-semibold">
                        {item.confidence}%
                      </Badge>
                    )}
                    {item.key && (
                      <Badge variant="destructive" className="text-xs">
                        Key
                      </Badge>
                    )}
                  </div>
                  <span className={`text-zinc-700 dark:text-zinc-200 ${item.quote ? "italic text-zinc-500" : ""}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 