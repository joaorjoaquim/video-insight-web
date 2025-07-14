"use client";
import React from "react";
import { Button } from "./button";

interface ViewToggleProps {
  currentView: string;
  views: Array<{ value: string; label: string }>;
  onViewChange: (view: string) => void;
}

export default function ViewToggle({ currentView, views, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      {views.map((view) => (
        <Button
          key={view.value}
          variant={currentView === view.value ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange(view.value)}
        >
          {view.label}
        </Button>
      ))}
    </div>
  );
} 