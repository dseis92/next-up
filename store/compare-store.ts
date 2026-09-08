import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CompareState {
  selectedJobIds: string[];
  addJobId: (jobId: string) => void;
  removeJobId: (jobId: string) => void;
  replaceSelection: (jobIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (jobId: string) => boolean;
  canAddMore: () => boolean;
}

const MAX_COMPARE_JOBS = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedJobIds: [],

      addJobId: (jobId: string) => {
        const current = get().selectedJobIds;

        // Prevent duplicates
        if (current.includes(jobId)) {
          return;
        }

        // Enforce maximum
        if (current.length >= MAX_COMPARE_JOBS) {
          return;
        }

        set({ selectedJobIds: [...current, jobId] });
      },

      removeJobId: (jobId: string) => {
        set((state) => ({
          selectedJobIds: state.selectedJobIds.filter((id) => id !== jobId),
        }));
      },

      replaceSelection: (jobIds: string[]) => {
        // Enforce max 4, deduplicate, preserve order
        const uniqueIds = Array.from(new Set(jobIds)).slice(0, MAX_COMPARE_JOBS);
        set({ selectedJobIds: uniqueIds });
      },

      clearSelection: () => {
        set({ selectedJobIds: [] });
      },

      isSelected: (jobId: string) => {
        return get().selectedJobIds.includes(jobId);
      },

      canAddMore: () => {
        return get().selectedJobIds.length < MAX_COMPARE_JOBS;
      },
    }),
    {
      name: "nextup-compare-selection",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Pure helper functions for testing
export const addCompareJob = (currentIds: string[], jobId: string): string[] => {
  if (currentIds.includes(jobId)) return currentIds;
  if (currentIds.length >= MAX_COMPARE_JOBS) return currentIds;
  return [...currentIds, jobId];
};

export const removeCompareJob = (currentIds: string[], jobId: string): string[] => {
  return currentIds.filter((id) => id !== jobId);
};

export const clearCompareJobs = (): string[] => {
  return [];
};

export const isCompareSelected = (currentIds: string[], jobId: string): boolean => {
  return currentIds.includes(jobId);
};

export const canAddCompareJob = (currentIds: string[]): boolean => {
  return currentIds.length < MAX_COMPARE_JOBS;
};
