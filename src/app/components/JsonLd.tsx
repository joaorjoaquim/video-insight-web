export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SummaryVideos",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: "https://summaryvideos.com",
    description:
      "AI-powered video summarizer that turns YouTube, Vimeo, and Twitter videos into structured summaries, timestamped transcripts, and key insights.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "100 free credits on signup. Pay-per-use after that.",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "124",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
