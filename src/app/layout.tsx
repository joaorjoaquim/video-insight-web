import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../core/providers/GlobalProvider";
import { AuthDialog } from '../components/AuthDialog';
import { I18nProvider } from "../lib/i18n";
import { ViewTransitions } from "next-view-transitions";
import { JsonLd } from "./components/JsonLd";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-br",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans-br",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono-br",
});

export const metadata: Metadata = {
  title: {
    default: "SummaryVideos — AI Video Summarizer",
    template: "%s | SummaryVideos",
  },
  description:
    "Turn a YouTube video into an AI summary, transcript, key points and mind map. Free, no credit card.",
  keywords: [
    "ai video summarizer",
    "youtube summary",
    "video transcript",
    "video insights",
    "ai video summary",
    "summarize video",
    "video to text",
  ],
  authors: [{ name: "SummaryVideos" }],
  creator: "SummaryVideos",
  metadataBase: new URL("https://summaryvideos.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "SummaryVideos — Turn a YouTube video into a brief",
    description:
      "Paste a public YouTube link and get a summary, transcript, key points and mind map.",
    url: "https://summaryvideos.com",
    siteName: "SummaryVideos",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SummaryVideos — AI Video Summarizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SummaryVideos — AI Video Summarizer",
    description:
      "Turn a YouTube video into a brief: summary, transcript, key points and mind map.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" data-scroll-behavior="smooth">
        <body className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
          <I18nProvider>
            <GlobalProvider>
              {children}
              <AuthDialog />
            </GlobalProvider>
          </I18nProvider>
          <JsonLd />
        </body>
      </html>
    </ViewTransitions>
  );
}
