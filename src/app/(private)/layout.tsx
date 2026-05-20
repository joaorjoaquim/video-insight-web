"use client";
import { ScrollToTop } from "../../components/ui/scroll-to-top";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
