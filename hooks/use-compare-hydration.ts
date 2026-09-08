"use client";

import { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compare-store";

/**
 * Module-level single-flight hydration promise
 * Ensures rehydrate() is called once per store lifecycle
 */
let compareHydrationPromise: Promise<void> | null = null;

/**
 * Ensure compare store is hydrated (single-flight)
 * Returns same promise if hydration is in progress
 * Returns resolved promise if already hydrated
 */
function ensureCompareHydrated(): Promise<void> {
  // Already hydrated - return resolved promise
  if (useCompareStore.persist.hasHydrated()) {
    return Promise.resolve();
  }

  // Hydration in progress - return existing promise
  if (compareHydrationPromise) {
    return compareHydrationPromise;
  }

  // Start new hydration
  compareHydrationPromise = Promise.resolve(useCompareStore.persist.rehydrate());
  return compareHydrationPromise;
}

/**
 * Client-side hydration hook for compare store
 * Ensures SSR and first client render use identical state
 *
 * Usage:
 * const hasHydrated = useCompareHydration();
 *
 * Before hydration: render deterministic default state
 * After hydration: render persisted session state
 */
export function useCompareHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Ensure store is hydrated (single-flight across all hooks)
    const rehydrateAndNotify = async () => {
      await ensureCompareHydrated();
      setHasHydrated(true);
    };

    rehydrateAndNotify();
  }, []);

  return hasHydrated;
}
