import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "../core/providers/GlobalProvider";
import { AuthDialog } from '../components/AuthDialog';
import { I18nProvider } from "../lib/i18n";
import { ViewTransitions } from "next-view-transitions";

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
  title: "SummaryVideos — Turn any video into a brief",
  description: "Paste a public video URL and get a summary, searchable transcript, insights, and mind map in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
          <I18nProvider>
            <GlobalProvider>
              {children}
              <AuthDialog />
            </GlobalProvider>
          </I18nProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
