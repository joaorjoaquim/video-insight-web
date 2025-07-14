"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";

interface MindMapProps {
  data?: any; // TODO: Tipagem específica para os dados do mind map
}

export default function MindMap({ data }: MindMapProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
          <div className="text-center">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Mind Map View</h3>
            <p className="text-zinc-500 text-sm mb-4">Interactive mind map visualization coming soon</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">Tech Stack</div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Authentication</div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Payment</div>
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">Database</div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">Deployment</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 