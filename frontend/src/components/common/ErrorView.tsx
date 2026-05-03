"use client";

import { useTranslations } from "next-intl";
import { BaseErrorView } from "./BaseErrorView";

interface ErrorViewProps {
  statusCode: 403 | 404 | 500 | number;
  reset?: () => void;
}

export const ErrorView = ({ statusCode = 404, reset }: ErrorViewProps) => {
  const t = useTranslations("ErrorPage");

  const getKey = (code: number) => {
    switch (code) {
      case 403: return "403";
      case 500: return "500";
      case 404:
      default: return "404";
    }
  };

  const key = getKey(statusCode);

  return (
    <BaseErrorView
      statusCode={statusCode}
      title={t(`${key}.title`)}
      description={t(`${key}.description`)}
      goBackText={t("go_back")}
      goHomeText={t("go_home")}
      tryAgainText={t("try_again")}
      reset={reset}
    />
  );
};