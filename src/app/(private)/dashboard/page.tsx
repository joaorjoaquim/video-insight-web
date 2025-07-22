"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Type, Static } from "@sinclair/typebox";
import { zodResolver } from "@hookform/resolvers/zod"; // typebox resolver pode ser custom, ajustar se necessário
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayCircle02Icon } from "@hugeicons/core-free-icons";
import PrivateHeader from "../../../components/layout/private-header";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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

// Typebox schema
const VideoURLSchema = Type.Object({
  url: Type.String({ format: "uri" }),
});
type VideoURLForm = Static<typeof VideoURLSchema>;

export default function DashboardPage() {
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // TanStack Query hook for video submission
  const submitVideoMutation = useSubmitVideo();

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<VideoURLForm>({
    // resolver: typeboxResolver(VideoURLSchema), // Use a resolver for typebox if available
    defaultValues: { url: "" },
  });

  const watchedUrl = watch("url");

  // Função para extrair metadados quando a URL muda
  React.useEffect(() => {
    const extractMetadata = async () => {
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
          setVideoMetadata({
            platform: detectPlatform(watchedUrl),
            url: watchedUrl,
            title: "Preview not available",
          });
          setMetadataError(
            "Could not fetch preview for this platform, but you can still submit your video."
          );
        }
      } catch (error) {
        setVideoMetadata({
          platform: detectPlatform(watchedUrl),
          url: watchedUrl,
          title: "Preview not available",
        });
        setMetadataError(
          "Could not fetch preview for this platform, but you can still submit your video."
        );
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(extractMetadata, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchedUrl]);

  const handleRemoveVideo = () => {
    setVideoMetadata(null);
    setValue("url", "");
  };

  const handleProcessVideo = async () => {
    if (!videoMetadata) return;

    try {
      await submitVideoMutation.mutateAsync({
        videoUrl: videoMetadata.url,
      });

      // Reset form after successful submission
      setVideoMetadata(null);
      setValue("url", "");
    } catch (error) {
      console.error("Error processing video:", error);
    }
  };

  const onSubmit = async () => {
    if (videoMetadata) await handleProcessVideo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
      <PrivateHeader />
      <main className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        {/* Header + Submission Form */}
        <section className="flex flex-col items-center text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
            Turn Any Video into Instant Insights
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6 max-w-2xl">
            Extract knowledge, summaries, and key takeaways from any video in
            minutes.
          </p>
          <form className="w-full max-w-2xl flex flex-col gap-2 bg-white dark:bg-zinc-900 shadow-lg rounded-lg p-3 mb-4 border border-zinc-200 dark:border-zinc-800">
            <label
              htmlFor="video-url"
              className="text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1"
            >
              Paste your URL.{" "}
              <span className="text-zinc-500">
                We support YouTube, Vimeo, Twitter, and other video platforms.
              </span>
            </label>
            <div className="flex flex-row gap-2">
              <Input
                id="video-url"
                {...register("url", { required: true })}
                placeholder="Paste a video link..."
                className="flex-1 h-12 rounded-md border-border focus:ring-0 bg-transparent"
                disabled={isSubmitting || isLoadingMetadata}
              />
            </div>
            {/* Video Preview */}
            {isLoadingMetadata && (
              <div className="w-full max-w-2xl mx-auto mt-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-zinc-600 dark:text-zinc-300">
                      Loading video metadata...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {videoMetadata && (
              <div className="w-full max-w-2xl mx-auto mt-4">
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
          {errors.url && (
            <span className="text-red-500 text-sm">
              Please enter a valid video URL.
            </span>
          )}
        </section>

        {/* Submissions List */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            Your Submissions
          </h2>
          <p className="text-zinc-500 mb-4">
            Track the progress of your video processing jobs
          </p>
          <SubmissionList />
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-5xl mx-auto mt-16">
          <FAQAccordion />
        </section>
      </main>
    </div>
  );
}
