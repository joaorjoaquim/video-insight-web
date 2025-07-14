import React, { useState, useMemo } from "react";
import { SubmissionCard, SubmissionCardProps, SubmissionStatus } from "./submission-card";
import { Input } from "../ui/input";

// Mock de submissões
const mockSubmissions: SubmissionCardProps[] = [
  {
    id: "1",
    title: "How to Build a SaaS Application",
    status: "completed",
    createdAt: "Submitted on May 15, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "2",
    title: "AI for Beginners - Complete Course",
    status: "processing",
    createdAt: "Submitted on May 14, 2023",
    progress: 65,
    thumbnailUrl: undefined,
  },
  {
    id: "3",
    title: "The Future of Web Development",
    status: "completed",
    createdAt: "Submitted on May 10, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "4",
    title: "React Advanced Patterns",
    status: "failed",
    createdAt: "Submitted on May 8, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "5",
    title: "Next.js 13 Full Course",
    status: "completed",
    createdAt: "Submitted on May 5, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "6",
    title: "TypeScript Crash Course",
    status: "processing",
    createdAt: "Submitted on May 2, 2023",
    progress: 30,
    thumbnailUrl: undefined,
  },
  {
    id: "7",
    title: "Building a Design System",
    status: "completed",
    createdAt: "Submitted on Apr 28, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "8",
    title: "AI in Product Management",
    status: "failed",
    createdAt: "Submitted on Apr 25, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "9",
    title: "Modern CSS Techniques",
    status: "completed",
    createdAt: "Submitted on Apr 20, 2023",
    thumbnailUrl: undefined,
  },
  {
    id: "10",
    title: "Serverless with AWS",
    status: "processing",
    createdAt: "Submitted on Apr 18, 2023",
    progress: 80,
    thumbnailUrl: undefined,
  },
];

const statusOptions: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
];

export function SubmissionList() {
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockSubmissions.filter((s) => {
      const matchesStatus = status === "all" || s.status === status;
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [status, search]);

  return (
    <div>
      {/* Filtro e busca */}
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center">
        <select
          className="border rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          value={status}
          onChange={e => setStatus(e.target.value as SubmissionStatus | "all")}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Input
          placeholder="Search submissions..."
          className="flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Lista responsiva */}
      {/* Mobile: horizontal scroll, snap-x; Desktop: grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x pb-2">
        {filtered.length === 0 ? (
          <div className="col-span-full w-full text-center text-zinc-500 py-12">No submissions found.</div>
        ) : (
          filtered.map(sub => (
            <div key={sub.id} className="min-w-[320px] max-w-xs md:min-w-0 md:max-w-none snap-start">
              <SubmissionCard {...sub} />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 