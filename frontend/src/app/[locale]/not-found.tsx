"use client";

import { ErrorView } from "@/src/components/common/ErrorView";

// This file is used when notFound() is called inside a locale-specific route
export default function NotFound() {
  return <ErrorView statusCode={404} />;
}
