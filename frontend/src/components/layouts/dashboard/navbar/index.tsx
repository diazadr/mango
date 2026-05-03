"use client";

import { NavBreadcrumbs } from "./NavBreadcrumbs";
import { NavActions } from "./NavActions";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface DashboardNavbarProps {
  user: any;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardNavbar({ user, sidebarCollapsed, onToggleSidebar }: DashboardNavbarProps) {
  return (
    <header className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <button onClick={onToggleSidebar} className="icon-btn-ghost">
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
        <NavBreadcrumbs />
      </div>
      <div className="dashboard-navbar-right">
        <NavActions user={user} />
      </div>
    </header>
  );
}