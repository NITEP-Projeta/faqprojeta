"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, logAnalyticsEvent } from "@/src/firebase/analytics.client";

export default function AnalyticsListener() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    // inicializa e dispara page_view a cada navegação
    (async () => {
      await initAnalytics();
      if (typeof window !== "undefined") {
        await logAnalyticsEvent("page_view", {
          page_location: window.location.href,
          page_path: pathname || "/",
          page_title: document?.title,
          debug_mode: true, // ajuda no DebugView
        });
      }
    })();
  }, [pathname, search]);

  return null;
}
