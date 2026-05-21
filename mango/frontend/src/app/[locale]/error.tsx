"use client";

import { useEffect } from "react";
import { ErrorView } from "@/src/components/common/ErrorView";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorView statusCode={500} reset={reset} />;
}