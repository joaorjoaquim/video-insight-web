"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Type, Static } from "@sinclair/typebox";
import PrivateHeader from "../../../components/layout/private-header";
import { SubmissionList } from "../../../components/submissions/submission-list";
import { FAQAccordion } from "../../../components/faq/faq-accordion";
import VideoPreview from "../../../components/submissions/video-preview";
import {
  getVideoMetadata,
  isValidVideoUrl,
  VideoMetadata,
  detectPlatform,
} from "../../../lib/utils/video-metadata";
import { useSubmitVideo } from "../../../lib/api/hooks";
import { useT } from "../../../lib/i18n";
import { Reveal } from "../../../components/ui/reveal";

const VideoURLSchema = Type.Object({ url: Type.String({ format: "uri" }) });
type VideoURLForm = Static<typeof VideoURLSchema>;

export default function DashboardPage() {
  const t = useT();
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const submitVideoMutation = useSubmitVideo();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<VideoURLForm>({
    defaultValues: { url: "" },
  });

  const watchedUrl = watch("url");

  React.useEffect(() => {
    const extract = async () => {
      if (!watchedUrl || !isValidVideoUrl(watchedUrl)) {
        setVideoMetadata(null);
        setMetadataError(null);
        return;
      }
      setIsLoadingMetadata(true);
      setMetadataError(null);
      try {
        const metadata = await getVideoMetadata(watchedUrl);
        if (metadata) {
          setVideoMetadata(metadata);
        } else {
          setVideoMetadata({ platform: detectPlatform(watchedUrl), url: watchedUrl, title: "Preview not available" });
          setMetadataError("Could not fetch preview, but you can still submit.");
        }
      } catch {
        setVideoMetadata({ platform: detectPlatform(watchedUrl), url: watchedUrl, title: "Preview not available" });
        setMetadataError("Could not fetch preview, but you can still submit.");
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    const timer = setTimeout(extract, 1000);
    return () => clearTimeout(timer);
  }, [watchedUrl]);

  const handleRemoveVideo = () => {
    setVideoMetadata(null);
    setValue("url", "");
  };

  const handleProcessVideo = async () => {
    if (!videoMetadata || submitVideoMutation.isPending) return;
    try {
      await submitVideoMutation.mutateAsync({
        videoUrl: videoMetadata.url,
        thumbnail: videoMetadata.thumbnail,
        title: videoMetadata.title,
      });
      setVideoMetadata(null);
      setValue("url", "");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--briefing-bg)]">
      <PrivateHeader />
      <main className="max-w-5xl mx-auto px-4 pt-14 pb-24" style={{ fontFamily: "var(--font-sans-br, system-ui, sans-serif)" }}>
        {/* Submit section */}
        <Reveal>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 01</span>
              </div>
              <div className="br-eyebrow">{t("dashboard.submit.section")}</div>
            </div>
            <div>
              <h1
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "clamp(1.8rem, 3vw + 0.5rem, 2.6rem)", letterSpacing: "-0.015em", lineHeight: 1.1 }}
                className="text-[var(--ink-1)] mb-3 max-w-[22ch]"
              >
                {t("dashboard.submit.headline")}{" "}
                <span className="ital-bar">{t("dashboard.submit.headlineAccent")}</span>{" "}
                {t("dashboard.submit.headlineSuffix")}
              </h1>
              <p className="text-[var(--ink-2)] text-sm leading-relaxed mb-6">
                {t("dashboard.submit.sub")}
              </p>

              <form onSubmit={handleSubmit(async () => { await handleProcessVideo(); })}>
                <label className="br-eyebrow block mb-2" htmlFor="video-url">
                  {t("dashboard.submit.label")}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="video-url"
                    {...register("url", { required: true })}
                    placeholder={t("dashboard.submit.placeholder")}
                    disabled={isSubmitting || isLoadingMetadata}
                    className="flex-1 border border-[var(--rule)] rounded-[6px] px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--bars)] transition-colors"
                  />
                  {!videoMetadata && (
                    <button
                      type="button"
                      onClick={handleProcessVideo}
                      disabled={true}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[6px] transition-colors whitespace-nowrap"
                    >
                      {t("dashboard.submit.button")}
                      <span className="inline-block w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white" />
                    </button>
                  )}
                </div>
                {errors.url && <p className="text-[var(--led-failed)] text-xs mt-1.5">{t("validation.url")}</p>}
                <p className="br-eyebrow mt-2">{t("dashboard.submit.hint")}</p>

                {isLoadingMetadata && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="bars-loader"><i/><i/><i/><i/></div>
                    <span className="br-eyebrow">{t("dashboard.submit.loadingMeta")}</span>
                  </div>
                )}

                {videoMetadata && (
                  <div className="mt-4">
                    <VideoPreview
                      metadata={videoMetadata}
                      onRemove={handleRemoveVideo}
                      onProcess={handleProcessVideo}
                      isProcessing={submitVideoMutation.isPending}
                      error={metadataError}
                    />
                  </div>
                )}
              </form>
            </div>
          </section>
        </Reveal>

        <hr className="border-[var(--rule)] mb-14" />

        {/* Submissions section */}
        <Reveal delay={1}>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-20">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 02</span>
              </div>
              <div className="br-eyebrow">{t("dashboard.recent.section")}</div>
            </div>
            <div>
              <h2
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                className="text-[var(--ink-1)] mb-1"
              >
                {t("dashboard.recent.headline")}
              </h2>
              <SubmissionList />
            </div>
          </section>
        </Reveal>

        <hr className="border-[var(--rule)] mb-14" />

        {/* FAQ section */}
        <Reveal delay={2}>
          <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 03</span>
              </div>
              <div className="br-eyebrow">{t("dashboard.faq.section")}</div>
            </div>
            <div>
              <h2
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                className="text-[var(--ink-1)] mb-6"
              >
                {t("dashboard.faq.headline")}
              </h2>
              <FAQAccordion />
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  );
}
