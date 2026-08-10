"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/types/api";

export function useRateLimit() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const applyFromError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 429) {
      setSecondsLeft(error.retryAfter && error.retryAfter > 0 ? error.retryAfter : 60);
      return true;
    }
    return false;
  }, []);

  const lockFor = useCallback((seconds: number) => {
    setSecondsLeft(Math.max(0, seconds));
  }, []);

  return {
    isLimited: secondsLeft > 0,
    secondsLeft,
    applyFromError,
    lockFor,
  };
}

export function formatApiError(error: unknown): {
  message: string;
  errors: string[];
} {
  if (error instanceof ApiError) {
    return { message: error.message, errors: error.errors };
  }
  if (error instanceof Error) {
    return { message: error.message, errors: [] };
  }
  return { message: "Something went wrong", errors: [] };
}
