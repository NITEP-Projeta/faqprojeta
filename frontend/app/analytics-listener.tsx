'use client';

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, logAnalyticsEvent } from "@/src/firebase/analytics.client";

function AnalyticsInner() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
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

export default function AnalyticsListener() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}
