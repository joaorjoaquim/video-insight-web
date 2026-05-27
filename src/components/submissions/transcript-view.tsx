'use client';
import React from 'react';
import { TranscriptBlock } from '../../types/submission';

interface TranscriptViewProps {
  transcript: TranscriptBlock[];
  onSeek?: (seconds: number) => void;
}

function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

export default function TranscriptView({ transcript, onSeek }: TranscriptViewProps) {
  return (
    <div className="space-y-3">
      {transcript.map((block, i) => (
        <div key={i} className="flex gap-4 items-start">
          {onSeek ? (
            <button
              type="button"
              onClick={() => onSeek(timeToSeconds(block.time))}
              className="shrink-0 text-xs font-mono text-[var(--play)] min-w-[52px] hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--play)] rounded transition-colors"
            >
              {block.time}
            </button>
          ) : (
            <span className="shrink-0 text-xs font-mono text-[var(--ink-3)] min-w-[52px]">
              {block.time}
            </span>
          )}
          <span className="text-[var(--ink-1)] text-sm leading-relaxed">{block.text}</span>
        </div>
      ))}
    </div>
  );
}
