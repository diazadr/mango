"use client";

import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import { AdminDashboardView } from "./AdminDashboardView";
import { CampusDashboardView } from "./CampusDashboardView";
import { UptDashboardView } from "./UptDashboardView";
import { UmkmDashboardView } from "./UmkmDashboardView";
import { AdvisorDashboardView } from "./AdvisorDashboardView";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { useTranslations } from "next-intl";

export function MainDashboardView() {
  const t = useTranslations("MainDashboardView");
  const { user, role, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <LoadingState message={t("message_memuat_data_workspace")} />
      </div>
    );
  }

  switch (role) {
    case "super_admin":
      return <AdminDashboardView />;
    case "admin":
      return <CampusDashboardView />;
    case "upt":
      return <UptDashboardView />;
    case "umkm":
      return <UmkmDashboardView user={user} />;
    case "advisor":
      return <AdvisorDashboardView user={user} />;
    default:
      return <AdminDashboardView />; 
  }
}
