"use client";

import { useEffect, useState } from "react";
import { useCompareStore } from "@/store/compare-store";

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
    // Rehydrate from sessionStorage after client mount
    const rehydrateAndNotify = async () => {
      await useCompareStore.persist.rehydrate();
      setHasHydrated(true);
    };

    rehydrateAndNotify();
  }, []);

  return hasHydrated;
}
