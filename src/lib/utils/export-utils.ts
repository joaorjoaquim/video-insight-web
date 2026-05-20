import jsPDF from "jspdf";

// Brand palette (matches globals.css tokens)
const BRAND = {
  play:    [242, 162,  64] as [number, number, number], // --play  #F2A240
  bars:    [126,  29, 253] as [number, number, number], // --bars  #7E1DFD
  bg:      [242, 240, 234] as [number, number, number], // --briefing-bg #F2F0EA
  ink1:    [ 24,  24,  27] as [number, number, number], // ~zinc-900
  ink3:    [113, 113, 122] as [number, number, number], // ~zinc-500
  white:   [255, 255, 255] as [number, number, number],
};

function addHeader(pdf: jsPDF, title: string) {
  const pw = pdf.internal.pageSize.getWidth();
  const margin = 20;

  // Orange header bar
  pdf.setFillColor(...BRAND.play);
  pdf.rect(0, 0, pw, 44, "F");

  // Brand name
  pdf.setTextColor(...BRAND.white);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("SummaryVideos", margin, 20);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(`summaryvideos.com  ·  ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, margin, 32);

  // Purple accent stripe
  pdf.setFillColor(...BRAND.bars);
  pdf.rect(0, 44, pw, 3, "F");

  // Video title
  pdf.setTextColor(...BRAND.ink1);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(title, pw - margin * 2);
  pdf.text(titleLines.slice(0, 2), margin, 62);
}

function sectionLabel(pdf: jsPDF, label: string, y: number, margin: number) {
  pdf.setFillColor(...BRAND.bars);
  pdf.rect(margin, y, 3, 10, "F");
  pdf.setTextColor(...BRAND.bars);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(label.toUpperCase(), margin + 7, y + 7);
  return y + 18;
}

function maybeAddPage(pdf: jsPDF, y: number, margin: number): number {
  const ph = pdf.internal.pageSize.getHeight();
  if (y > ph - margin - 10) {
    pdf.addPage();
    return margin + 10;
  }
  return y;
}

export const downloadAsPDF = (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
) => {
  try {
    const pdf = new jsPDF();
    const pw  = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxW  = pw - margin * 2;

    addHeader(pdf, videoTitle);
    let y = 82;

    if (type === "summary") {
      y = sectionLabel(pdf, "Summary", y, margin);
      pdf.setTextColor(...BRAND.ink1);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(data.summary?.text || "No summary available.", maxW);
      for (const line of lines) {
        y = maybeAddPage(pdf, y, margin);
        pdf.text(line, margin, y);
        y += 6;
      }
      y += 10;

      if (data.summary?.metrics?.length) {
        y = maybeAddPage(pdf, y, margin);
        y = sectionLabel(pdf, "Metrics", y, margin);
        for (const m of data.summary.metrics) {
          y = maybeAddPage(pdf, y, margin);
          pdf.setTextColor(...BRAND.ink3);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text(m.label, margin, y);
          pdf.setTextColor(...BRAND.ink1);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(String(m.value), margin + 60, y);
          y += 8;
        }
        y += 8;
      }

      if (data.summary?.topics?.length) {
        y = maybeAddPage(pdf, y, margin);
        y = sectionLabel(pdf, "Topics", y, margin);
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        for (const topic of data.summary.topics) {
          y = maybeAddPage(pdf, y, margin);
          pdf.setFillColor(...BRAND.play);
          pdf.circle(margin + 2, y - 2, 1.5, "F");
          pdf.text(topic, margin + 8, y);
          y += 7;
        }
      }
    }

    if (type === "transcript") {
      y = sectionLabel(pdf, "Transcript", y, margin);
      const transcript = data.transcript || [];
      pdf.setFontSize(10);
      for (const item of transcript) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.bars);
        pdf.setFont("helvetica", "bold");
        pdf.text(`[${item.time}]`, margin, y);
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(item.text, maxW - 28);
        pdf.text(lines[0], margin + 22, y);
        y += 6;
        for (let i = 1; i < lines.length; i++) {
          y = maybeAddPage(pdf, y, margin);
          pdf.text(lines[i], margin + 22, y);
          y += 6;
        }
        y += 4;
      }
    }

    if (type === "insights") {
      y = sectionLabel(pdf, "Insights", y, margin);
      const sections = data.insights?.sections || [];
      for (const section of sections) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.bars);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(section.title, margin, y);
        y += 10;

        pdf.setTextColor(...BRAND.ink1);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        for (const item of (section.items || [])) {
          y = maybeAddPage(pdf, y, margin);
          pdf.setFillColor(...BRAND.bars);
          pdf.circle(margin + 2, y - 2, 1.5, "F");
          let text = item.text || "";
          if (item.confidence) text += ` (${item.confidence}%)`;
          const lines = pdf.splitTextToSize(text, maxW - 10);
          pdf.text(lines[0], margin + 8, y);
          y += 6;
          for (let i = 1; i < lines.length; i++) {
            y = maybeAddPage(pdf, y, margin);
            pdf.text(lines[i], margin + 8, y);
            y += 6;
          }
          y += 3;
        }
        y += 8;
      }
    }

    const filename = `${videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${type}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

export const downloadFullReportPDF = (data: any, videoTitle: string) => {
  try {
    const pdf = new jsPDF();
    const pw = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pw - margin * 2;

    addHeader(pdf, videoTitle);
    let y = 82;

    // ── Summary ──────────────────────────────────────────
    y = sectionLabel(pdf, "Summary", y, margin);
    pdf.setTextColor(...BRAND.ink1);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const summaryLines = pdf.splitTextToSize(data.summary?.text || "No summary available.", maxW);
    for (const line of summaryLines) {
      y = maybeAddPage(pdf, y, margin);
      pdf.text(line, margin, y);
      y += 6;
    }
    y += 10;

    if (data.summary?.metrics?.length) {
      y = maybeAddPage(pdf, y, margin);
      y = sectionLabel(pdf, "Metrics", y, margin);
      for (const m of data.summary.metrics) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.ink3);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(m.label, margin, y);
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(m.value), margin + 60, y);
        y += 8;
      }
      y += 8;
    }

    if (data.summary?.topics?.length) {
      y = maybeAddPage(pdf, y, margin);
      y = sectionLabel(pdf, "Topics", y, margin);
      pdf.setTextColor(...BRAND.ink1);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      for (const topic of data.summary.topics) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setFillColor(...BRAND.play);
        pdf.circle(margin + 2, y - 2, 1.5, "F");
        pdf.text(topic, margin + 8, y);
        y += 7;
      }
      y += 10;
    }

    // ── Transcript ───────────────────────────────────────
    const transcript = data.transcript || [];
    if (transcript.length) {
      y = maybeAddPage(pdf, y, margin);
      y = sectionLabel(pdf, "Transcript", y, margin);
      pdf.setFontSize(10);
      for (const item of transcript) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.bars);
        pdf.setFont("helvetica", "bold");
        pdf.text(`[${item.time}]`, margin, y);
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFont("helvetica", "normal");
        const tlines = pdf.splitTextToSize(item.text, maxW - 28);
        pdf.text(tlines[0], margin + 22, y);
        y += 6;
        for (let i = 1; i < tlines.length; i++) {
          y = maybeAddPage(pdf, y, margin);
          pdf.text(tlines[i], margin + 22, y);
          y += 6;
        }
        y += 4;
      }
      y += 10;
    }

    // ── Insights ─────────────────────────────────────────
    const insightSections = data.insights?.sections || [];
    if (insightSections.length) {
      y = maybeAddPage(pdf, y, margin);
      y = sectionLabel(pdf, "Insights", y, margin);
      for (const section of insightSections) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.bars);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(section.title, margin, y);
        y += 10;
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        for (const item of (section.items || [])) {
          y = maybeAddPage(pdf, y, margin);
          pdf.setFillColor(...BRAND.bars);
          pdf.circle(margin + 2, y - 2, 1.5, "F");
          let text = item.text || "";
          if (item.confidence) text += ` (${item.confidence}%)`;
          const ilines = pdf.splitTextToSize(text, maxW - 10);
          pdf.text(ilines[0], margin + 8, y);
          y += 6;
          for (let i = 1; i < ilines.length; i++) {
            y = maybeAddPage(pdf, y, margin);
            pdf.text(ilines[i], margin + 8, y);
            y += 6;
          }
          y += 3;
        }
        y += 8;
      }
      y += 10;
    }

    // ── Mind Map (text outline) ───────────────────────────
    const mindMap = data.mindMap;
    if (mindMap?.root) {
      y = maybeAddPage(pdf, y, margin);
      y = sectionLabel(pdf, "Mind Map", y, margin);
      pdf.setTextColor(...BRAND.ink1);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(mindMap.root, margin, y);
      y += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      for (const branch of (mindMap.branches || [])) {
        y = maybeAddPage(pdf, y, margin);
        pdf.setTextColor(...BRAND.bars);
        pdf.setFont("helvetica", "bold");
        pdf.text(`  ${branch.label || branch.name || ""}`, margin, y);
        y += 7;
        pdf.setTextColor(...BRAND.ink1);
        pdf.setFont("helvetica", "normal");
        for (const child of (branch.children || [])) {
          y = maybeAddPage(pdf, y, margin);
          pdf.setFillColor(...BRAND.ink3);
          pdf.circle(margin + 6, y - 2, 1, "F");
          pdf.text(`    ${child.label || child.name || child}`, margin + 2, y);
          y += 6;
        }
        y += 3;
      }
    }

    const filename = `${videoTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_report.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

export const copyFullReport = async (data: any, videoTitle: string) => {
  const sep = "─".repeat(40);
  const lines: string[] = [
    `SummaryVideos — ${videoTitle}`,
    new Date().toLocaleString(),
    "",
    `SUMMARY\n${sep}`,
    data.summary?.text || "",
    "",
  ];

  if (data.summary?.metrics?.length) {
    lines.push(`METRICS\n${sep}`);
    for (const m of data.summary.metrics) lines.push(`${m.label}: ${m.value}`);
    lines.push("");
  }
  if (data.summary?.topics?.length) {
    lines.push(`TOPICS\n${sep}`);
    lines.push(...data.summary.topics);
    lines.push("");
  }

  if (data.transcript?.length) {
    lines.push(`TRANSCRIPT\n${sep}`);
    for (const t of data.transcript) lines.push(`[${t.time}] ${t.text}`);
    lines.push("");
  }

  if (data.insights?.sections?.length) {
    lines.push(`INSIGHTS\n${sep}`);
    for (const s of data.insights.sections) {
      lines.push(s.title);
      for (const item of (s.items || [])) {
        let text = `  • ${item.text || ""}`;
        if (item.confidence) text += ` (${item.confidence}%)`;
        lines.push(text);
      }
      lines.push("");
    }
  }

  if (data.mindMap?.root) {
    lines.push(`MIND MAP\n${sep}`);
    lines.push(data.mindMap.root);
    for (const branch of (data.mindMap.branches || [])) {
      lines.push(`  ${branch.label || branch.name || ""}`);
      for (const child of (branch.children || [])) {
        lines.push(`    · ${child.label || child.name || child}`);
      }
    }
  }

  const content = lines.join("\n");
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    } else {
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  } catch (error) {
    console.error("Copy failed:", error);
    alert("Failed to copy. Please try again.");
  }
};

export const formatContentForExport = (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
): string => {
  const header = `SummaryVideos — ${videoTitle}\n${new Date().toLocaleString()}\n\n`;

  if (type === "summary") {
    const text   = data.summary?.text || "";
    const metrics = (data.summary?.metrics || []).map((m: any) => `${m.label}: ${m.value}`).join("\n");
    const topics  = (data.summary?.topics || []).join("\n");
    return `${header}SUMMARY\n${"─".repeat(40)}\n${text}\n\nMETRICS\n${"─".repeat(40)}\n${metrics}\n\nTOPICS\n${"─".repeat(40)}\n${topics}`;
  }

  if (type === "transcript") {
    const lines = (data.transcript || []).map((t: any) => `[${t.time}] ${t.text}`).join("\n");
    return `${header}TRANSCRIPT\n${"─".repeat(40)}\n${lines}`;
  }

  if (type === "insights") {
    const sections = (data.insights?.sections || [])
      .map((s: any) =>
        `${s.title}\n${"─".repeat(30)}\n` +
        (s.items || []).map((i: any) => `• ${i.text}${i.confidence ? ` (${i.confidence}%)` : ""}`).join("\n")
      ).join("\n\n");
    return `${header}INSIGHTS\n${"─".repeat(40)}\n${sections}`;
  }

  return "";
};

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
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  } catch (error) {
    console.error("Copy failed:", error);
    alert("Failed to copy. Please try again.");
  }
};

export const shareContent = async (
  type: "summary" | "transcript" | "insights",
  data: any,
  videoTitle: string
) => {
  try {
    const content = formatContentForExport(type, data, videoTitle);
    if (navigator.share) {
      await navigator.share({
        title: `SummaryVideos — ${videoTitle}`,
        text: content.slice(0, 1000) + (content.length > 1000 ? "…" : ""),
        url: window.location.href,
      });
    } else {
      await copyToClipboard(type, data, videoTitle);
    }
  } catch (error) {
    console.error("Share failed:", error);
  }
};
