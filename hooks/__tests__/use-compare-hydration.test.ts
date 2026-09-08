import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Mock hydration manager for testing single-flight behavior
 * Simulates the ensureCompareHydrated() pattern
 */
class HydrationManager {
  private hydrated = false;
  private hydrationPromise: Promise<void> | null = null;
  private rehydrateCallCount = 0;

  hasHydrated(): boolean {
    return this.hydrated;
  }

  async rehydrate(): Promise<void> {
    this.rehydrateCallCount++;
    // Simulate async hydration
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.hydrated = true;
  }

  getRehydrateCallCount(): number {
    return this.rehydrateCallCount;
  }

  reset(): void {
    this.hydrated = false;
    this.hydrationPromise = null;
    this.rehydrateCallCount = 0;
  }

  async ensureHydrated(): Promise<void> {
    // Already hydrated
    if (this.hasHydrated()) {
      return Promise.resolve();
    }

    // Hydration in progress
    if (this.hydrationPromise) {
      return this.hydrationPromise;
    }

    // Start new hydration
    this.hydrationPromise = this.rehydrate();
    return this.hydrationPromise;
  }
}

describe("Compare Hydration Single-Flight", () => {
  let manager: HydrationManager;

  beforeEach(() => {
    manager = new HydrationManager();
  });

  it("should call rehydrate once when multiple callers before hydration", async () => {
    expect(manager.hasHydrated()).toBe(false);

    // Simulate multiple CompareToggle components calling ensureHydrated
    const promise1 = manager.ensureHydrated();
    const promise2 = manager.ensureHydrated();
    const promise3 = manager.ensureHydrated();

    // Wait for all
    await Promise.all([promise1, promise2, promise3]);

    // Rehydrate should only be called once (single-flight)
    expect(manager.getRehydrateCallCount()).toBe(1);
    expect(manager.hasHydrated()).toBe(true);
  });

  it("should not trigger another rehydrate after already hydrated", async () => {
    // First hydration
    await manager.ensureHydrated();
    expect(manager.hasHydrated()).toBe(true);
    expect(manager.getRehydrateCallCount()).toBe(1);

    // New component mounts after hydration
    await manager.ensureHydrated();
    await manager.ensureHydrated();

    // Should not call rehydrate again
    expect(manager.getRehydrateCallCount()).toBe(1);
  });

  it("should handle sequential calls correctly", async () => {
    // First caller
    await manager.ensureHydrated();
    expect(manager.getRehydrateCallCount()).toBe(1);

    // Second caller after first completes
    await manager.ensureHydrated();
    expect(manager.getRehydrateCallCount()).toBe(1);

    // Third caller
    await manager.ensureHydrated();
    expect(manager.getRehydrateCallCount()).toBe(1);
  });

  it("should immediately resolve if already hydrated", async () => {
    // Hydrate first
    await manager.ensureHydrated();

    // Subsequent calls should resolve immediately
    const start = Date.now();
    await manager.ensureHydrated();
    const duration = Date.now() - start;

    // Should be much faster than the 10ms simulated hydration
    expect(duration).toBeLessThan(5);
  });
});
