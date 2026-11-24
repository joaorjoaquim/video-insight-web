export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SummaryVideos",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: "https://summaryvideos.com",
    description:
      "Web app that turns a public YouTube video into an AI-written summary, transcript, key points and mind map.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        "100 free credits on signup. Each video uses 5. A balance below 100 is restored to 100 every week. No paid plans.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
