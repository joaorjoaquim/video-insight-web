import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

const FAQ_ITEMS = [
  {
    question: "How does SummaryVideos work?",
    answer:
      "Just paste a public video URL (YouTube, Vimeo, etc.).\n\nWe'll:\n- Download it using **VideoDownCut (by Megafuji)**\n- Transcribe & analyze it with **OpenAI's advanced models**\n\nYou'll get:\n- ✅ Concise summary\n- 🧠 Key insights & highlights\n- 🗺️ Interactive mind map\n- 📝 Time-stamped transcript\n\nProcessing takes **2–5 minutes** on average.",
  },
  {
    question: "What videos can I analyze?",
    answer:
      "You can analyze any **publicly accessible video** URL from platforms like:\n- YouTube, Vimeo, Twitter, or direct hosted links\n\nRecommended for:\n- Courses, lectures, meetings, interviews, product demos\n\n⚠️ Limit: **2 hours** per video. Private or restricted videos aren't supported.",
  },
  {
    question: "How do credits work?",
    answer:
      "- 🎁 New accounts get **100 free credits**\n- 💡 Each submission uses **5–15 credits**, based on video length\n- 🔁 Failed submissions? Credits are **automatically refunded**\n- 📊 Track usage in the **Credits & Wallet** page\n\n**Credit breakdown:**\n\n| Video Length | Credits Used |\n|--------------|---------------|\n| 0–10 min     | ~5 credits     |\n| 10–30 min    | ~8 credits     |\n| 30+ min      | ~12–15 credits |",
  },
  {
    question: "What results do I receive?",
    answer:
      "Each video submission provides:\n\n- 📄 **Summary**: Key ideas in 2–4 paragraphs\n- 💡 **Insights**: Notable quotes, topics, and takeaways\n- 🗺️ **Mind Map**: Visual concept breakdown\n- 📝 **Transcript**: Fully searchable, with timestamps\n- 📊 **Stats**: Confidence scores, token usage & complexity level",
  },
  {
    question: "How accurate is the analysis?",
    answer:
      "Very. We use GPT-4 and advanced transcription models:\n\n- ~95% accuracy with multiple accents\n- Supports technical language\n- Highlights important sections\n\n⚠️ Accuracy may drop with low audio quality or background noise.",
  },
  {
    question: "How do I manage my videos & account?",
    answer:
      "- 🔐 Login via Google, Discord or email\n- 🎞️ Submissions are tracked with real-time status\n- 📈 Full history is available in your dashboard\n- 📁 Export content as TXT, PDF, or JSON\n- 🔒 Videos can't be deleted (yet)\n- 📘 Full API & frontend documentation available on [GitHub](https://github.com/joaorjoaquim)",
  },
];

// Function to render markdown-like content with proper formatting
const renderAnswer = (answer: string) => {
  return answer.split("\n").map((line, index) => {
    // Handle bold text
    const boldText = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Handle links
    const linkText = boldText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline">$1</a>'
    );

    // Handle table rows
    if (line.includes("|")) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

      // Skip separator rows (lines with only dashes and pipes)
      if (cells.every((cell) => cell.replace(/[-|]/g, "").trim() === "")) {
        return null;
      }

      return (
        <div key={index} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
            <tbody>
              <tr className="border-b border-zinc-300 dark:border-zinc-700">
                {cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-3 py-2 text-sm border-r border-zinc-300 dark:border-zinc-700 last:border-r-0 bg-zinc-50 dark:bg-zinc-800"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: cell.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong>$1</strong>"
                        ),
                      }}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Handle empty lines
    if (line.trim() === "") {
      return <br key={index} />;
    }

    // Handle bullet points and emojis
    if (line.trim().startsWith("-")) {
      return (
        <div key={index} className="flex items-start mb-2">
          <span className="mr-2 text-zinc-500 mt-0.5">•</span>
          <span
            className="flex-1"
            dangerouslySetInnerHTML={{ __html: linkText }}
          />
        </div>
      );
    }

    // Handle regular text
    return (
      <div
        key={index}
        className="mb-2"
        dangerouslySetInnerHTML={{ __html: linkText }}
      />
    );
  });
};

export function FAQAccordion() {
  return (
    <div className="w-full border-t border-[var(--rule)]">
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem
            value={item.question}
            key={item.question}
            className="border-b border-[var(--rule)]"
          >
            <AccordionTrigger className="text-left py-5 hover:no-underline group">
              <span
                style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "1.1rem", letterSpacing: "-0.01em" }}
                className="text-[var(--ink-1)] flex-1 text-left"
              >
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="text-[var(--ink-2)] text-sm leading-relaxed max-w-[40rem]">
                {renderAnswer(item.answer)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
