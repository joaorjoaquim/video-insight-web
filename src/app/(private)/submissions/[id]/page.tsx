"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import InsightsList from "../../../../components/insights/insights-list";
import MindMap from "../../../../components/insights/mind-map";
import PrivateHeader from "../../../../components/layout/private-header";
import SummaryMetrics from "../../../../components/submissions/summary-metrics";
import TranscriptView from "../../../../components/submissions/transcript-view";
import ActionButtons from "../../../../components/ui/action-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { useVideo } from "../../../../lib/api/hooks";
import { formatSubmissionDate } from "../../../../lib/utils/date-formatter";
import { formatDuration } from "../../../../lib/utils";
import {
  downloadAsPDF,
  copyToClipboard,
  shareContent,
} from "../../../../lib/utils/export-utils";
import { useT } from "../../../../lib/i18n";
import { Reveal } from "../../../../components/ui/reveal";

const parseTranscription = (transcription: string, duration: number): Array<{ time: string; text: string }> => {
  if (!transcription) return [];
  const sentences = transcription.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const timePerSentence = duration / sentences.length;
  return sentences.map((sentence, index) => {
    const sec = index * timePerSentence;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return {
      time: `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      text: sentence.trim(),
    };
  });
};

export default function SubmissionDetailPage() {
  const t = useT();
  const params = useParams();
  const videoId = params.id as string;
  const [tab, setTab] = useState("summary");
  const [insightView, setInsightView] = useState<"list" | "mindmap">("list");

  const { data: video, isLoading, error } = useVideo(videoId);
  const isVideoCompleted = video?.status === "completed";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--briefing-bg)]">
        <PrivateHeader />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="bars-loader"><i/><i/><i/><i/></div>
          <span className="br-eyebrow">{t("detail.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--briefing-bg)]">
        <PrivateHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-[var(--led-failed)] text-sm mb-1">{t("detail.error")}</p>
          <p className="br-eyebrow">{t("common.tryAgain")}</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && video && !isVideoCompleted) {
    return (
      <div className="min-h-screen bg-[var(--briefing-bg)]">
        <PrivateHeader />
        <main className="max-w-4xl mx-auto px-4 pt-14 pb-24">
          <Link href="/dashboard" className="br-eyebrow hover:text-[var(--ink-1)] transition-colors inline-block mb-8">
            {t("detail.back")}
          </Link>
          <div className="border border-[var(--rule)] rounded-[10px] p-8 max-w-md">
            <div className="br-eyebrow mb-3">{t("common.processingVideos")}</div>
            <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.5rem" }} className="text-[var(--ink-1)] mb-4">
              {t("detail.processing.title")}
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bars-loader"><i/><i/><i/><i/></div>
              <span className={`led ${video.status}`}>{video.status}</span>
            </div>
            <p className="text-[var(--ink-2)] text-sm leading-relaxed mb-6">
              {t("detail.processing.sub")}
            </p>
            <Link href="/dashboard">
              <button className="br-eyebrow border border-[var(--ink-1)] px-4 py-2 rounded-[4px] hover:bg-[var(--ink-1)] hover:text-[var(--briefing-bg)] transition-colors">
                {t("detail.processing.back")}
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!video) return null;

  const transformedData = {
    ...video,
    summary:    { text: video.summary?.text || "", metrics: video.summary?.metrics || [], topics: video.summary?.topics || [] },
    transcript: video.transcript || parseTranscription(video.transcription || "", video.duration || 0),
    insights:   { chips: video.insights?.chips || [], sections: video.insights?.sections || [] },
    mindMap:    video.mindMap || { root: "Video Insights", branches: [] },
  };

  const titleWords = (transformedData.title || "").split(" ");
  const titleLead = titleWords.slice(0, -2).join(" ");
  const titleTail = titleWords.slice(-2).join(" ");

  const durationDisplay =
    typeof transformedData.duration === "number" && transformedData.duration > 0
      ? formatDuration(transformedData.duration)
      : transformedData.duration || "—";

  return (
    <div className="min-h-screen bg-[var(--briefing-bg)]" style={{ fontFamily: "var(--font-sans-br, system-ui, sans-serif)" }}>
      <PrivateHeader />
      <main className="max-w-4xl mx-auto px-4 pt-10 pb-24">
        <Link href="/dashboard" className="br-eyebrow hover:text-[var(--ink-1)] transition-colors inline-block mb-8">
          {t("detail.back")}
        </Link>

        {/* Title block */}
        <Reveal>
          <section className="pb-8 mb-8 border-b border-[var(--rule)]">
            <div className="flex items-center gap-3 mb-5">
              <span className="logo-bars lg"><i/><i/><i/></span>
              <span className="br-eyebrow">{t("detail.badge")}</span>
            </div>
            <h1
              style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "clamp(2rem, 4.5vw + 1rem, 4rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
              className="text-[var(--ink-1)] max-w-[22ch] mb-6"
            >
              {titleLead}{titleLead && " "}<span className="ital-bar">{titleTail}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="br-eyebrow">{transformedData.platform || "YouTube"}</span>
              <span className="text-[var(--rule)]">·</span>
              <span className="br-eyebrow">{t("detail.runtime")} {durationDisplay}</span>
              <span className="text-[var(--rule)]">·</span>
              <span className="br-eyebrow">
                {t("detail.submitted")}{" "}
                {transformedData.createdAt ? formatSubmissionDate(transformedData.createdAt) : "—"}
              </span>
              <span className="text-[var(--rule)]">·</span>
              <span className="led completed">completed</span>
            </div>
          </section>
        </Reveal>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-8 border-b border-[var(--rule)] rounded-none bg-transparent h-auto p-0 gap-0">
            {(["summary", "transcript", "insights"] as const).map((tabKey) => {
              const labels: Record<string, string> = {
                summary:    t("detail.tab.summary"),
                transcript: t("detail.tab.transcript"),
                insights:   t("detail.tab.insights"),
              };
              return (
                <TabsTrigger
                  key={tabKey}
                  value={tabKey}
                  className="px-5 py-2.5 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--play)] data-[state=active]:text-[var(--ink-1)] text-[var(--ink-3)]"
                  style={{ fontFamily: "var(--font-mono-br, monospace)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                  {labels[tabKey]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12">
              <article>
                <div className="flex justify-between items-center mb-5">
                  <span className="br-eyebrow">{t("detail.summary.section")}</span>
                  <ActionButtons
                    downloadLabel="PDF"
                    onDownload={() => downloadAsPDF("summary", transformedData, transformedData.title || "Untitled")}
                    onCopy={() => copyToClipboard("summary", transformedData, transformedData.title || "Untitled")}
                    onShare={() => shareContent("summary", transformedData, transformedData.title || "Untitled")}
                  />
                </div>
                <div className="text-[var(--ink-1)] leading-[1.75] text-[15px] whitespace-pre-line max-w-[38rem]">
                  {transformedData.summary?.text || "No summary available."}
                </div>
              </article>
              <aside>
                <div className="br-eyebrow mb-4">{t("detail.metadata")}</div>
                <div className="border-t border-[var(--rule)]">
                  <SummaryMetrics metrics={transformedData.summary?.metrics || []} />
                </div>
                {transformedData.summary?.topics?.length > 0 && (
                  <>
                    <div className="br-eyebrow mt-8 mb-3">{t("detail.topics")}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {transformedData.summary.topics.map((topic: string, i: number) => (
                        <span key={i} className="br-eyebrow border border-[var(--rule)] px-2 py-1 rounded-[4px]">{topic}</span>
                      ))}
                    </div>
                  </>
                )}
              </aside>
            </div>
          </TabsContent>

          {/* Transcript */}
          <TabsContent value="transcript">
            <div className="flex justify-between items-center mb-6">
              <span className="br-eyebrow">{t("detail.transcript.label")} · {transformedData.transcript?.length || 0} {t("detail.transcript.segments")}</span>
              <ActionButtons
                downloadLabel="PDF"
                onDownload={() => downloadAsPDF("transcript", transformedData, transformedData.title || "Untitled")}
                onCopy={() => copyToClipboard("transcript", transformedData, transformedData.title || "Untitled")}
                onShare={() => shareContent("transcript", transformedData, transformedData.title || "Untitled")}
              />
            </div>
            <div className="max-w-2xl">
              <TranscriptView transcript={transformedData.transcript || []} />
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="flex border border-[var(--rule)] rounded-[6px] overflow-hidden">
                {(["list", "mindmap"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setInsightView(v)}
                    className="px-4 py-2 text-[10px] font-medium tracking-[0.12em] uppercase transition-colors"
                    style={{
                      fontFamily: "var(--font-mono-br, monospace)",
                      background: insightView === v ? "var(--ink-1)" : "transparent",
                      color: insightView === v ? "var(--briefing-bg)" : "var(--ink-3)",
                    }}
                  >
                    {v === "list" ? t("detail.insights.list") : t("detail.insights.mindmap")}
                  </button>
                ))}
              </div>
              <ActionButtons
                showShare
                downloadLabel="PDF"
                onDownload={() => downloadAsPDF("insights", transformedData, transformedData.title || "Untitled")}
                onCopy={() => copyToClipboard("insights", transformedData, transformedData.title || "Untitled")}
                onShare={() => shareContent("insights", transformedData, transformedData.title || "Untitled")}
              />
            </div>
            {insightView === "list" ? (
              <InsightsList
                chips={transformedData.insights?.chips || []}
                sections={transformedData.insights?.sections || []}
              />
            ) : (
              <MindMap data={transformedData.mindMap || { root: "Video Insights", branches: [] }} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
