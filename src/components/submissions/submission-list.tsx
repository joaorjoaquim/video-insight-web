import React, { useState, useMemo } from "react";
import { SubmissionCard, SubmissionStatus } from "./submission-card";
import { useVideos } from "../../lib/api/hooks";
import { formatSubmissionDate } from "../../lib/utils/date-formatter";
import { useT } from "../../lib/i18n";
import type { TranslationKey } from "../../lib/i18n/locales/en";

type StatusOption = { labelKey: TranslationKey; value: SubmissionStatus | "all" };

const STATUS_OPTIONS: StatusOption[] = [
  { labelKey: "list.allStatuses", value: "all" },
  { labelKey: "list.pending",     value: "pending" },
  { labelKey: "list.downloaded",  value: "downloaded" },
  { labelKey: "list.transcribing",value: "transcribing" },
  { labelKey: "list.completed",   value: "completed" },
  { labelKey: "list.failed",      value: "failed" },
];

export function SubmissionList() {
  const t = useT();
  const [status, setStatus] = useState<SubmissionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data: videosData, isLoading, error } = useVideos();

  const filtered = useMemo(() => {
    if (!videosData?.videos) return [];
    return videosData.videos.filter((video: any) => {
      const matchesStatus = status === "all" || video.status === status;
      const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [videosData, status, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="bars-loader"><i/><i/><i/><i/></div>
        <span className="br-eyebrow">{t("list.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--led-failed)] text-sm mb-1">{t("list.error.load")}</p>
        <p className="br-eyebrow">{t("common.tryAgain")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | "all")}
          className="border border-[var(--rule)] rounded-[6px] px-3 py-2 text-[11px] font-medium tracking-[0.1em] bg-white dark:bg-zinc-900 text-[var(--ink-2)] focus:outline-none focus:border-[var(--bars)] transition-colors"
          style={{ fontFamily: "var(--font-mono-br, monospace)" }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
          ))}
        </select>
        <input
          placeholder={t("list.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[var(--rule)] rounded-[6px] px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
        />
        <span className="br-eyebrow self-center ml-1">
          {filtered.length} of {videosData?.videos?.length ?? 0}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-[var(--rule)] rounded-[10px]">
          <div className="br-eyebrow mb-2">{t("list.empty.title")}</div>
          <p className="text-[var(--ink-2)] text-sm">{t("list.empty.sub")}</p>
        </div>
      ) : (
        <div className="stagger-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video: any) => (
            <SubmissionCard
              key={video.id}
              id={video.id}
              title={video.title}
              status={video.status as SubmissionStatus}
              thumbnail={video.thumbnail}
              createdAt={formatSubmissionDate(video.createdAt)}
              progress={video.progress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
