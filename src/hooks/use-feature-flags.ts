'use client';

import { useState, useCallback } from 'react';
import { DEFAULT_FEATURE_FLAGS } from '@/types/feature-flags';
import type { FeatureFlag } from '@/types/feature-flags';

/**
 * Hook for feature flag state management (UI-only)
 */
export function useFeatureFlags(initialFlags?: FeatureFlag[]) {
  const [flags, setFlags] = useState<FeatureFlag[]>(
    initialFlags ?? DEFAULT_FEATURE_FLAGS
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleFlag = useCallback(async (flagId: string) => {
    setIsLoading(true);
    try {
      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFlagValue = useCallback(async (flagId: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === flagId ? { ...flag, enabled } : flag
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFlagValue = useCallback(
    (flagId: string): boolean => {
      return flags.find((f) => f.id === flagId)?.enabled ?? false;
    },
    [flags]
  );

  const resetToDefaults = useCallback(() => {
    setFlags(DEFAULT_FEATURE_FLAGS);
  }, []);

  return {
    flags,
    isLoading,
    toggleFlag,
    setFlagValue,
    getFlagValue,
    resetToDefaults,
  };
}
