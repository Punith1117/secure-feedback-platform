"use client";

import { useEffect } from "react";
import { syncFeedbackQueue } from "@/lib/offline/sync-feedback-queue";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const sync = () => syncFeedbackQueue();

    // initial sync on load
    sync();

    // sync when coming online
    window.addEventListener("online", sync);

    window.addEventListener("focus", sync);

    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            sync();
        }
    });

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <>{children}</>;
}