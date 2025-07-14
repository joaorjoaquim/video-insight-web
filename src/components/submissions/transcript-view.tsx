"use client";
import React from "react";

import { TranscriptBlock } from "../../types/submission";

interface TranscriptViewProps {
  transcript: TranscriptBlock[];
}

export default function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <div className="space-y-4">
      {transcript.map((block, i) => (
        <div key={i} className="flex gap-4 items-start">
          <span className="text-xs font-mono text-zinc-400 min-w-[56px]">{block.time}</span>
          <span className="text-zinc-700 dark:text-zinc-200">{block.text}</span>
        </div>
      ))}
    </div>
  );
} 