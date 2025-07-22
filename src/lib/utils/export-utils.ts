import jsPDF from "jspdf";

// Simple logo placeholder - we'll create a proper logo later
const createLogoPlaceholder = (
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // Draw a rounded rectangle for the logo background
  pdf.setFillColor(255, 255, 255, 0.95);
  pdf.roundedRect(x, y, width, height, 4, 4, "F");

  // Draw a simple icon (play button)
  pdf.setFillColor(99, 102, 241); // Indigo color
  pdf.circle(x + width / 2, y + height / 2, width / 3, "F");

  // Draw play triangle
  pdf.setFillColor(255, 255, 255);
  const triangleSize = width / 5;
  pdf.moveTo(
    x + width / 2 - triangleSize / 2,
    y + height / 2 - triangleSize / 2
  );
  pdf.lineTo(
    x + width / 2 - triangleSize / 2,
    y + height / 2 + triangleSize / 2
  );
  pdf.lineTo(x + width / 2 + triangleSize / 2, y + height / 2);
  pdf.closePath();
  pdf.fill();
};

// Function to add logo to PDF
const addLogoToPDF = (
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  try {
    // Use our custom logo placeholder
    createLogoPlaceholder(pdf, x, y, width, height);
  } catch (error) {
    console.warn("Could not add logo to PDF:", error);
    // Fallback: draw a simple placeholder
    pdf.setFillColor(255, 255, 255, 0.2);
    pdf.rect(x, y, width, height, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.text("LOGO", x + width / 2 - 10, y + height / 2 + 2);
  }
};

// Utility function to format content for different export types
export const formatContentForExport = (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
): string => {
  const timestamp = new Date().toLocaleString();
  const header = `Video Insights - ${videoTitle}\nGenerated on: ${timestamp}\n\n`;

  switch (type) {
    case "summary":
      return `${header}SUMMARY\n${"=".repeat(50)}\n\n${
        data.summary?.text || "No summary available."
      }\n\nMETRICS\n${"=".repeat(50)}\n${
        data.summary?.metrics
          ?.map((metric: any) => `${metric.label}: ${metric.value}`)
          .join("\n") || "No metrics available."
      }\n\nTOPICS\n${"=".repeat(50)}\n${
        data.summary?.topics?.join("\n") || "No topics available."
      }`;

    case "transcript":
      const transcriptText =
        data.transcript
          ?.map((item: any) => `[${item.time}] ${item.text}`)
          .join("\n") || "No transcript available.";
      return `${header}TRANSCRIPT\n${"=".repeat(50)}\n\n${transcriptText}`;

    case "insights":
      const insightsText =
        data.insights?.sections
          ?.map(
            (section: any) =>
              `${section.title}\n${"-".repeat(30)}\n${section.items
                ?.map(
                  (item: any) =>
                    `• ${item.text}${
                      item.confidence ? ` (${item.confidence}% confidence)` : ""
                    }`
                )
                .join("\n")}`
          )
          .join("\n\n") || "No insights available.";
      return `${header}INSIGHTS\n${"=".repeat(50)}\n\n${insightsText}`;

    default:
      return "No content available.";
  }
};

// Download PDF function
export const downloadAsPDF = (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Set up colors
    const primaryColor = [99, 102, 241] as [number, number, number]; // Indigo
    const secondaryColor = [107, 114, 128] as [number, number, number]; // Gray
    const accentColor = [139, 92, 246] as [number, number, number]; // Purple

    // Header section with gradient-like effect
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 50, "F");

    // Add a subtle gradient effect with a lighter rectangle
    pdf.setFillColor(139, 92, 246, 0.1); // Light purple overlay
    pdf.rect(0, 0, pageWidth, 50, "F");

    // Add logo to header
    addLogoToPDF(pdf, margin, 10, 25, 25);

    // App branding
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("Video Insights", margin + 35, 25);

    pdf.setTextColor(255, 255, 255, 0.8);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin + 35, 35);

    // Video title section
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(videoTitle, margin, 70);

    let yPosition = 90;

    switch (type) {
      case "summary":
        yPosition = generateSummaryPDF(
          pdf,
          data,
          yPosition,
          margin,
          maxWidth,
          pageHeight,
          primaryColor,
          secondaryColor,
          accentColor
        );
        break;
      case "transcript":
        yPosition = generateTranscriptPDF(
          pdf,
          data,
          yPosition,
          margin,
          maxWidth,
          pageHeight,
          primaryColor,
          secondaryColor
        );
        break;
      case "insights":
        yPosition = generateInsightsPDF(
          pdf,
          data,
          yPosition,
          margin,
          maxWidth,
          pageHeight,
          primaryColor,
          secondaryColor,
          accentColor
        );
        break;
    }

    const filename = `${videoTitle
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_${type}.pdf`;
    pdf.save(filename);

    console.log(`PDF downloaded: ${filename}`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

// Generate Summary PDF
const generateSummaryPDF = (
  pdf: any,
  data: any,
  startY: number,
  margin: number,
  maxWidth: number,
  pageHeight: number,
  primaryColor: number[],
  secondaryColor: number[],
  accentColor: number[]
) => {
  let yPosition = startY;

  // Summary section header with better styling
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(margin - 5, yPosition - 10, 120, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Summary", margin, yPosition);
  yPosition += 25;

  // Summary text
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  const summaryText = data.summary?.text || "No summary available.";
  const summaryLines = pdf.splitTextToSize(summaryText, maxWidth);

  for (let i = 0; i < summaryLines.length; i++) {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(summaryLines[i], margin, yPosition);
    yPosition += 6;
  }
  yPosition += 15;

  // Metrics section
  if (data.summary?.metrics && data.summary.metrics.length > 0) {
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(margin - 5, yPosition - 10, 100, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Metrics", margin, yPosition);
    yPosition += 25;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const metricsPerRow = 2;
    let currentX = margin;

    data.summary.metrics.forEach((metric: any, index: number) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }

      // Metric box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(currentX, yPosition - 5, 80, 25, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(currentX, yPosition - 5, 80, 25, "S");

      // Metric content
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(metric.label, currentX + 5, yPosition + 2);

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(metric.value, currentX + 5, yPosition + 12);

      if ((index + 1) % metricsPerRow === 0) {
        currentX = margin;
        yPosition += 35;
      } else {
        currentX += 90;
      }
    });

    if (data.summary.metrics.length % metricsPerRow !== 0) {
      yPosition += 35;
    }
    yPosition += 15;
  }

  // Topics section
  if (data.summary?.topics && data.summary.topics.length > 0) {
    pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.rect(margin - 5, yPosition - 10, 100, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Topics", margin, yPosition);
    yPosition += 25;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    data.summary.topics.forEach((topic: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }

      // Topic bullet
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.circle(margin + 3, yPosition - 2, 2, "F");
      pdf.text(topic, margin + 10, yPosition);
      yPosition += 8;
    });
  }

  return yPosition;
};

// Generate Transcript PDF
const generateTranscriptPDF = (
  pdf: any,
  data: any,
  startY: number,
  margin: number,
  maxWidth: number,
  pageHeight: number,
  primaryColor: number[],
  secondaryColor: number[]
) => {
  let yPosition = startY;

  // Transcript section header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin - 5, yPosition - 10, 120, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Transcript", margin, yPosition);
  yPosition += 25;

  // Transcript entries
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");

  const transcript = data.transcript || [];

  transcript.forEach((item: any) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }

    // Timestamp
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(`[${item.time}]`, margin, yPosition);

    // Text
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const textLines = pdf.splitTextToSize(item.text, maxWidth - 50);

    // First line of text
    pdf.text(textLines[0], margin + 30, yPosition);
    yPosition += 8;

    // Additional lines if text is long
    for (let i = 1; i < textLines.length; i++) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(textLines[i], margin + 30, yPosition);
      yPosition += 8;
    }

    yPosition += 12; // More space between transcript entries
  });

  return yPosition;
};

// Generate Insights PDF
const generateInsightsPDF = (
  pdf: any,
  data: any,
  startY: number,
  margin: number,
  maxWidth: number,
  pageHeight: number,
  primaryColor: number[],
  secondaryColor: number[],
  accentColor: number[]
) => {
  let yPosition = startY;

  // Insights section header
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(margin - 5, yPosition - 10, 120, 10, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Insights", margin, yPosition);
  yPosition += 25;

  const sections = data.insights?.sections || [];

  sections.forEach((section: any) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }

    // Section title with background
    pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2], 0.1);
    pdf.rect(margin - 3, yPosition - 8, 150, 12, "F");
    pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.text(section.title, margin, yPosition);
    yPosition += 20;

    // Section items
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    section.items?.forEach((item: any) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = 20;
      }

      // Item bullet
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.circle(margin + 3, yPosition - 2, 2, "F");

      // Item text
      let itemText = item.text;
      if (item.confidence) {
        itemText += ` (${item.confidence}% confidence)`;
      }
      if (item.key) {
        pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        pdf.setFont("helvetica", "bold");
        itemText += " [KEY INSIGHT]";
      }
      if (item.quote) {
        pdf.setTextColor(
          secondaryColor[0],
          secondaryColor[1],
          secondaryColor[2]
        );
        itemText = `"${itemText}"`;
      }

      // Reset text color for main text
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");

      const textLines = pdf.splitTextToSize(itemText, maxWidth - 10);
      pdf.text(textLines[0], margin + 10, yPosition);
      yPosition += 7;

      // Additional lines if text is long
      for (let i = 1; i < textLines.length; i++) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(textLines[i], margin + 10, yPosition);
        yPosition += 7;
      }

      yPosition += 10;
    });

    yPosition += 15;
  });

  return yPosition;
};

// Copy to clipboard function
export const copyToClipboard = async (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
) => {
  try {
    const content = formatContentForExport(type, data, videoTitle);

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    // Show success feedback
    console.log("Content copied to clipboard!");
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    alert("Failed to copy content. Please try again.");
  }
};

// Share function
export const shareContent = async (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
) => {
  try {
    const content = formatContentForExport(type, data, videoTitle);

    if (navigator.share) {
      await navigator.share({
        title: `Video Insights - ${videoTitle}`,
        text: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""),
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard and show message
      await copyToClipboard(type, data, videoTitle);
      console.log(
        "Content copied to clipboard! You can now share it manually."
      );
    }
  } catch (error) {
    console.error("Error sharing content:", error);
    alert("Failed to share content. Please try again.");
  }
};
