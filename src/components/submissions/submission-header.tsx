"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayCircle02Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";

import { SubmissionStep } from "../../types/submission";

interface SubmissionHeaderProps {
  title: string;
  status: string;
  duration: string;
  createdAt: string;
  platform: string;
  steps: SubmissionStep[];
}

export default function SubmissionHeader({
  title,
  status,
  duration,
  createdAt,
  platform,
  steps,
}: SubmissionHeaderProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            <div className="aspect-square w-24 h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <HugeiconsIcon icon={PlayCircle02Icon} className="text-4xl text-indigo-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{title}</h1>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                {status}
              </Badge>
            </div>
            <div className="text-zinc-500 text-sm mb-2 flex flex-wrap gap-2">
              <span>{duration} duration</span>
              <span>• {createdAt}</span>
              <span>• {platform}</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-2">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-1 text-sm">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className={`text-base ${step.done ? "text-green-500" : "text-zinc-400"}`} />
                  <span className={step.done ? "text-green-700 dark:text-green-200" : "text-zinc-400"}>{step.label}</span>
                  {i < steps.length - 1 && <span className="mx-1 text-zinc-300">—</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 