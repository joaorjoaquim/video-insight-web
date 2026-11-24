"use client";
import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { useT } from "../../lib/i18n";

const FAQ_ITEMS = [
  { question: "faq.1.q", answer: "faq.1.a" },
  { question: "faq.2.q", answer: "faq.2.a" },
  { question: "faq.3.q", answer: "faq.3.a" },
  { question: "faq.4.q", answer: "faq.4.a" },
  { question: "faq.5.q", answer: "faq.5.a" },
  { question: "faq.6.q", answer: "faq.6.a" },
] as const;

export function FAQAccordion() {
  const t = useT();
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
                {t(item.question)}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-[var(--ink-2)] text-sm leading-relaxed max-w-[40rem]">
                {t(item.answer)}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
