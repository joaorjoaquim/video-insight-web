"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import InsightsList from "../../../../components/insights/insights-list";
import MindMap from "../../../../components/insights/mind-map";
import PrivateHeader from "../../../../components/layout/private-header";
import SubmissionHeader from "../../../../components/submissions/submission-header";
import SummaryMetrics from "../../../../components/submissions/summary-metrics";
import TranscriptView from "../../../../components/submissions/transcript-view";
import ActionButtons from "../../../../components/ui/action-buttons";
import Breadcrumb from "../../../../components/ui/breadcrumb";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import ViewToggle from "../../../../components/ui/view-toggle";
import { useVideo, useVideoStatus } from "../../../../lib/api/hooks";
import { formatSubmissionDate } from "../../../../lib/utils/date-formatter";

const mockSubmission: any = {
  id: "1",
  title: "How to Build a SaaS Application",
  status: "completed",
  thumbnailUrl: undefined,
  createdAt: "Processed on May 15, 2023",
  duration: "12:45",
  platform: "YouTube",
  summary: {
    text: `This video provides a comprehensive guide to building a SaaS (Software as a Service) application from scratch. The presenter covers everything from initial planning and architecture to deployment and scaling.\n\nKey areas covered include choosing the right tech stack for different types of SaaS applications, implementing authentication and authorization systems, setting up payment processing with Stripe, and designing database schemas that can scale with your business.\n\nThe presenter emphasizes the importance of starting with a minimum viable product (MVP) and iterating based on user feedback. They demonstrate how to set up a continuous integration and deployment pipeline to streamline the development process.`,
    metrics: [
      { label: "Duration", value: "12:45" },
      { label: "Main Topics", value: "5" },
      { label: "Key Insights", value: "12" },
      { label: "Complexity", value: "Intermediate" },
    ],
    topics: [
      "Tech Stack Selection",
      "Authentication & Authorization", 
      "Payment Processing",
      "Database Design",
      "Continuous Deployment"
    ]
  },
  transcript: [
    { time: "00:00", text: "Welcome to the SaaS Application course." },
    { time: "01:15", text: "Let's start with planning and architecture." },
    { time: "03:30", text: "Choosing the right tech stack is crucial." },
    { time: "05:00", text: "Implementing authentication and authorization." },
    { time: "08:20", text: "Setting up payment processing with Stripe." },
    { time: "10:00", text: "Designing scalable database schemas." },
    { time: "12:00", text: "Continuous integration and deployment." },
  ],
  insights: {
    chips: [
      { label: "15 insights extracted", variant: "secondary" as const },
      { label: "5 main topics", variant: "secondary" as const },
      { label: "3 key takeaways", variant: "destructive" as const },
      { label: "87% confidence", variant: "secondary" as const },
    ],
    sections: [
      {
        title: "Tech Stack Selection",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4BB)}</span>,
        items: [
          { text: "Frontend frameworks like React, Vue, or Angular are ideal for SaaS UIs", confidence: 95, key: false, quote: false },
          { text: "Node.js and Express are recommended for backend API development", confidence: 92, key: false, quote: false },
          { text: "Choose your tech stack based on team expertise rather than trends", key: true, confidence: undefined, quote: false },
        ],
      },
      {
        title: "Authentication & Authorization",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F512)}</span>,
        items: [
          { text: "OAuth 2.0 is recommended for secure third-party authentication", confidence: 88, key: false, quote: false },
          { text: "JWT tokens provide stateless authentication for scalable applications", confidence: 90, key: false, quote: false },
          { text: '"Always implement role-based access control from day one"', quote: true, key: false, confidence: undefined },
        ],
      },
      {
        title: "Payment Processing",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4B3)}</span>,
        items: [
          { text: "Stripe is recommended for subscription management and payment processing", confidence: 94, key: false, quote: false },
          { text: "Implement usage-based billing for better customer value alignment", key: true, confidence: undefined, quote: false },
        ],
      },
      {
        title: "Database Design",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F4C8)}</span>,
        items: [
          { text: "Multi-tenant architecture with database isolation improves security", confidence: 89, key: false, quote: false },
          { text: "Consider NoSQL for flexibility or SQL for complex relationships", confidence: 85, key: false, quote: false },
        ],
      },
      {
        title: "Deployment & Scaling",
        icon: <span className="text-purple-400">{String.fromCodePoint(0x1F680)}</span>,
        items: [
          { text: "CI/CD pipelines are essential for reliable deployments", confidence: 91, key: false, quote: false },
          { text: "Containerization with Docker simplifies environment consistency", confidence: 87, key: false, quote: false },
          { text: "Start with an MVP and iterate based on user feedback", key: true, confidence: undefined, quote: false },
        ],
      },
    ],
  },
  mindMap: {
    root: "Video Insights",
    branches: [
      {
        label: "Problems",
        children: [
          { label: "Fighting Fires" },
          { label: "Urgent vs. Important" }
        ]
      },
      {
        label: "Tips", 
        children: [
          { label: "Focus on Micro Tasks" },
          { label: "Use Just-in-Time Learning" }
        ]
      }
    ]
  }
};

const mindMapImg = "/mindmap-example.png"; // Use a local asset ou placeholder

export default function SubmissionDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  
  const [tab, setTab] = useState("summary");
  const [insightView, setInsightView] = useState<"list" | "mindmap">("list");
  
  // TanStack Query hooks
  const { data: video, isLoading, error } = useVideo(videoId);
  const { data: statusData } = useVideoStatus(
    videoId,
    video?.status === 'pending' || video?.status === 'downloaded' || video?.status === 'transcribing'
  );

  // Check if video is completed
  const isVideoCompleted = video?.status === 'completed';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
        <PrivateHeader />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-zinc-500">Loading video details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
        <PrivateHeader />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Failed to load video details</p>
            <p className="text-sm text-zinc-500">Please try again later</p>
          </div>
        </main>
      </div>
    );
  }

  // Video not completed state
  if (!isLoading && !error && !isVideoCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
        <PrivateHeader />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
          <div className="text-center py-12">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Video Still Processing
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                This video is currently being processed. The detailed analysis will be available once processing is complete.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-zinc-500">
                  <strong>Current Status:</strong> {video?.status ? (video.status.charAt(0).toUpperCase() + video.status.slice(1)) : "Unknown"}
                </p>
                <p className="text-sm text-zinc-500">
                  <strong>Video:</strong> {video?.title}
                </p>
              </div>
              <div className="mt-8 space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/submissions">
                  <Button variant="outline" className="w-full">
                    View All Submissions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Use real data if available, otherwise fallback to mock
  const videoData = video || mockSubmission;
  
  // Ensure videoData is not undefined
  if (!videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
        <PrivateHeader />
        <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Video data not available</p>
            <p className="text-sm text-zinc-500">Please try again later</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6fc] to-white dark:from-zinc-950 dark:to-zinc-900">
      <PrivateHeader />
      <main className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <Breadcrumb
          items={[
            { label: "Back to Dashboard", href: "/dashboard" },
            { label: videoData.title || "Untitled Video" },
          ]}
        />
        
        {/* Header Section */}
        <SubmissionHeader
          title={videoData.title || "Untitled Video"}
          status={videoData.status || "unknown"}
          duration={videoData.duration || ""}
          createdAt={videoData.createdAt ? formatSubmissionDate(videoData.createdAt) : "Unknown date"}
          platform="YouTube"
          steps={[]}
        />

        {/* Tabs Section */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Summary</CardTitle>
                  <ActionButtons downloadLabel="Download PDF" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-zinc-700 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                  {videoData.summary?.text ? videoData.summary.text : "No summary available."}
                </div>
                <SummaryMetrics metrics={videoData.summary?.metrics || []} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transcript</CardTitle>
                  <ActionButtons />
                </div>
              </CardHeader>
              <CardContent>
                <TranscriptView transcript={videoData.transcript || []} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <ViewToggle
                    currentView={insightView}
                    views={[
                      { value: "list", label: "List View" },
                      { value: "mindmap", label: "Mind Map" },
                    ]}
                    onViewChange={(view) => setInsightView(view as "list" | "mindmap")}
                  />
                  <ActionButtons showShare={true} />
                </div>
              </CardHeader>
              <CardContent>
                {insightView === "list" ? (
                  <InsightsList 
                    chips={videoData.insights?.chips || []} 
                    sections={videoData.insights?.sections || []} 
                  />
                ) : (
                  <MindMap data={videoData.mindMap || { root: "Video Insights", branches: [] }} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 