"use client";
import React from "react";
import { Card, CardContent } from "../ui/card";

interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

interface MindMapData {
  root: string;
  branches: MindMapNode[];
}

interface MindMapProps {
  data?: MindMapData;
}

const MindMapNode: React.FC<{
  node: MindMapNode;
  level: number;
  isRoot?: boolean;
}> = ({ node, level, isRoot = false }) => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-orange-100 text-orange-800 border-orange-200",
    "bg-red-100 text-red-800 border-red-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
  ];

  const colorClass = colors[level % colors.length];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`px-4 py-2 rounded-lg border-2 font-medium text-sm max-w-xs text-center ${colorClass} ${
          isRoot ? "text-lg font-bold" : ""
        }`}
      >
        {node.label}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {node.children.map((child, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-px h-4 bg-gray-300 mb-2"></div>
              <MindMapNode node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function MindMap({ data }: MindMapProps) {
  if (!data || !data.branches || data.branches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Mind Map View
              </h3>
              <p className="text-zinc-500 text-sm mb-4">
                No mind map data available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Root Node */}
          <div className="mb-8">
            <MindMapNode node={{ label: data.root }} level={0} isRoot={true} />
          </div>

          {/* Branches */}
          <div className="flex flex-wrap justify-center gap-8">
            {data.branches.map((branch, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-px h-6 bg-gray-300 mb-2"></div>
                <MindMapNode node={branch} level={1} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
