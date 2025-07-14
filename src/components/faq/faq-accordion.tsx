import * as React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";

const FAQ_ITEMS = [
  {
    question: "How do credits work?",
    answer:
      "Credits are our platform’s currency. Each credit allows you to process one video regardless of its length. Credits never expire and can be used at any time.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. For certain regions, we also support alternative payment methods like PIX.",
  },
  {
    question: "Can I get a refund for unused credits?",
    answer:
      "Please contact our support team if you need a refund for unused credits.",
  },
  {
    question: "Do you offer custom packages for enterprise users?",
    answer:
      "Yes, we offer custom packages for enterprise users. Please contact us for more information.",
  },
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ_ITEMS.map((item, idx) => (
        <AccordionItem value={item.question} key={item.question}>
          <AccordionTrigger className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-zinc-600 dark:text-zinc-300 text-sm">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
} 