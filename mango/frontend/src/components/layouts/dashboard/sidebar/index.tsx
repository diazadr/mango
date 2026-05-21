"use client";

import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { usePathname } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarItem } from "./SidebarItem";
import { SidebarDropdown } from "./SidebarDropdown";
import { SidebarLogout } from "./SidebarLogout";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { 
  LayoutDashboard, Building2, Users, ShieldCheck, ClipboardList, 
  Key, ShieldAlert, Store, Package, Briefcase, UserCircle,
  ClipboardCheck, MessageSquare, GraduationCap, School, Landmark, Wrench, FileText,
  Factory, ClipboardSignature, Activity, BellDot, Gauge, BookOpen, BarChart2,
  Calendar, Layers, AlertTriangle, Settings, ChevronDown, Database, Wifi, History,
  TrendingUp, Wallet
} from "lucide-react";


export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export const useSidebar = () => useContext(SidebarContext);

type MenuItem = {
  type: "item" | "dropdown" | "label";
  nameKey: string;
  href?: string;
  icon?: any;
  roles?: string[];
  subItems?: { nameKey: string; href: string; icon: any; roles?: string[]; excludePaths?: string[]; exact?: boolean }[];
  excludePaths?: string[];
  exact?: boolean;
};

const MENU_STRUCTURE: MenuItem[] = [
  { type: "label", nameKey: "section_overview", roles: ["super_admin", "admin", "advisor", "umkm", "upt"] },
  { 
    type: "item",
    nameKey: "dashboard", 
    href: "/dashboard",
    icon: LayoutDashboard, 
    roles: ["super_admin", "admin", "advisor", "umkm", "upt"],
    exact: true
  },

  { type: "label", nameKey: "section_administration", roles: ["super_admin", "upt"] },
  {
    type: "dropdown",
    nameKey: "management_console",
    href: "/admin/users",
    icon: Database,
    roles: ["super_admin"],
    subItems: [
      { nameKey: "user_control", href: "/admin/users", icon: Users, roles: ["super_admin"] },
      { nameKey: "umkm_list", href: "/admin/umkm", icon: ClipboardList, roles: ["super_admin"] },
      { nameKey: "organization_management", href: "/admin/organizations", icon: Store, roles: ["super_admin"] },
    ]
  },
  {
    type: "dropdown",
    nameKey: "upt_console",
    href: "/admin/upt",
    icon: Building2,
    roles: ["upt"],
    subItems: [
      { nameKey: "org_profile", href: "/admin/upt/profile", icon: UserCircle, roles: ["upt"] },
      { nameKey: "umkm_registry", href: "/admin/upt/umkm", icon: ClipboardList, roles: ["upt"] },
      { nameKey: "member_approval", href: "/admin/upt/approvals", icon: ShieldCheck, roles: ["upt"] }
    ]
  },


  { type: "label", nameKey: "section_campus", roles: ["admin", "super_admin", "upt"] },

  {
    type: "dropdown",
    nameKey: "campus_console",
    href: "/admin/campus",
    icon: School,
    roles: ["admin", "super_admin"],
    subItems: [
      { nameKey: "campus_info", href: "/admin/campus/info", icon: Landmark },
      { nameKey: "department_nodes", href: "/admin/departments", icon: ClipboardList },
      { nameKey: "advisor_management", href: "/admin/campus/advisors", icon: GraduationCap, roles: ["admin", "super_admin"] },
    ],
  },
  {
    type: "dropdown",
    nameKey: "living_lab",
    href: "/admin/living-lab",
    icon: Factory,
    roles: ["admin", "super_admin"],
    subItems: [
      { nameKey: "living_lab_dashboard", href: "/admin/living-lab", icon: Factory, roles: ["admin", "super_admin"] },
      { nameKey: "mentoring_assignment", href: "/admin/campus/mentoring", icon: MessageSquare, roles: ["admin", "super_admin"] },
      { nameKey: "projects", href: "/workspace/advisor/projects", icon: Briefcase, roles: ["admin", "super_admin"] },
    ],
  },

  { type: "label", nameKey: "section_content", roles: ["super_admin"] },
  {
    type: "dropdown",
    nameKey: "content_management",
    href: "/admin/articles",
    icon: FileText,
    roles: ["super_admin"],
    subItems: [
      { nameKey: "articles_dashboard", href: "/admin/articles", icon: FileText },
    ],
  },

  { type: "label", nameKey: "section_identity", roles: ["umkm"] },
  { 
    type: "item", 
    nameKey: "umkm_identity", 
    href: "/umkm-profile", 
    icon: Building2, 
    roles: ["umkm"] 
  },

  { type: "label", nameKey: "section_strategy", roles: ["umkm"] },
  {
    type: "dropdown",
    nameKey: "strategy_execution",
    href: "/workspace/umkm/assessment",
    icon: ClipboardCheck,
    roles: ["umkm"],
    subItems: [
      { nameKey: "assessment", href: "/workspace/umkm/assessment", icon: ClipboardCheck, roles: ["umkm"] },
      { nameKey: "mentoring", href: "/workspace/umkm/mentoring", icon: MessageSquare, roles: ["umkm"] },
      { nameKey: "progress_history", href: "/workspace/umkm/history", icon: TrendingUp, roles: ["umkm"] },
      { nameKey: "projects", href: "/workspace/umkm/projects", icon: Briefcase, roles: ["umkm"] }
    ]
  },

  { type: "label", nameKey: "section_business", roles: ["umkm", "admin", "super_admin", "upt"] },
  {
    type: "dropdown",
    nameKey: "business_console",
    href: "/workspace/umkm/technical-profile",
    icon: Store,
    roles: ["umkm", "admin", "super_admin", "upt"],
    subItems: [
      { nameKey: "all_reservations", href: "/admin/reservations", icon: History, roles: ["super_admin"] },
      { nameKey: "machine_management", href: "/workspace/umkm/technical-profile", icon: Wrench, roles: ["umkm"] },
      { nameKey: "machine_management", href: "/admin/campus/technical-profile", icon: Wrench, roles: ["admin", "super_admin", "upt"] },
      { nameKey: "machine_reservation", href: "/workspace/reservations", icon: Wrench, roles: ["umkm", "admin", "super_admin", "upt"], excludePaths: ["/workspace/reservations/approvals", "/workspace/reservations/history"] },
      { nameKey: "machine_approvals", href: "/workspace/reservations/approvals", icon: ShieldCheck, roles: ["umkm", "admin", "super_admin", "upt"] },
      { nameKey: "machine_history", href: "/workspace/reservations/history", icon: History, roles: ["umkm", "admin", "super_admin", "upt"] }
    ]
  },

  { type: "label", nameKey: "section_advisor", roles: ["advisor"] },
  {
    type: "dropdown",
    nameKey: "advisor_console", 
    href: "/workspace/advisor",
    icon: GraduationCap,
    roles: ["advisor"], 
    subItems: [
      { nameKey: "mentoring_tasks", href: "/workspace/advisor/mentoring", icon: MessageSquare },
      { nameKey: "my_schedule", href: "/workspace/advisor/schedule", icon: Calendar },
      { nameKey: "projects", href: "/workspace/advisor/projects", icon: Briefcase },
    ],
  },

  // ── ERP — Enterprise Resource Planning ──────────────────────────────────────────
  { type: "label", nameKey: "section_erp", roles: ["admin", "umkm", "upt", "super_admin"] },
  {
    type: "dropdown",
    nameKey: "erp_modules",
    href: "/workspace/manufacturing",
    icon: BarChart2,
    roles: ["admin", "umkm", "upt", "super_admin"],
    subItems: [
      { nameKey: "erp_overview", href: "/workspace/manufacturing", icon: BarChart2, roles: ["admin", "umkm", "upt", "super_admin"], exact: true },
      { nameKey: "work_orders", href: "/workspace/manufacturing/work-orders", icon: ClipboardSignature, roles: ["admin", "umkm", "upt", "super_admin"] },
      { nameKey: "schedule", href: "/workspace/manufacturing/schedule", icon: Calendar, roles: ["admin", "umkm", "upt", "super_admin"] },
      { nameKey: "erp_products", href: "/workspace/manufacturing/products", icon: Package, roles: ["admin", "umkm", "upt", "super_admin"] },
      { nameKey: "inventory", href: "/workspace/manufacturing/inventory", icon: Layers, roles: ["admin", "umkm", "upt", "super_admin"] }
    ]
  },

  // ── MES — Manufacturing Execution System ────────────────────────────────────
  { type: "label", nameKey: "section_mes", roles: ["admin", "umkm", "upt", "super_admin"] },
  {
    type: "dropdown",
    nameKey: "mes_console",
    href: "/workspace/manufacturing/production",
    icon: Activity,
    roles: ["admin", "umkm", "upt", "super_admin"],
    subItems: [
      { nameKey: "production_records", href: "/workspace/manufacturing/production", icon: Activity, roles: ["admin", "umkm", "upt", "super_admin"], exact: true },
      { nameKey: "downtime_tracker", href: "/workspace/manufacturing/downtime", icon: AlertTriangle, roles: ["admin", "umkm", "upt", "super_admin"] },
      { nameKey: "alarm_events", href: "/workspace/manufacturing/alarms", icon: BellDot, roles: ["admin", "umkm", "upt", "super_admin"] },
      { nameKey: "oee_dashboard", href: "/workspace/manufacturing/oee", icon: Gauge, roles: ["admin", "umkm", "upt", "super_admin"], exact: true },
      { nameKey: "edge_sites", href: "/workspace/manufacturing/edge-sites", icon: Wifi, roles: ["admin", "umkm", "upt", "super_admin"] },
    ]
  },
  { type: "label", nameKey: "section_account", roles: ["super_admin", "admin", "advisor", "umkm", "upt"] },
  {
    type: "dropdown",
    nameKey: "account_management",
    href: "/profile",
    icon: UserCircle,
    roles: ["super_admin", "admin", "advisor", "umkm", "upt"],
    subItems: [
      { nameKey: "my_identity", href: "/profile", icon: UserCircle, roles: ["super_admin", "admin", "advisor", "umkm", "upt"] },
      { nameKey: "system_settings", href: "/settings", icon: Settings, roles: ["super_admin", "admin", "advisor", "umkm", "upt"], exact: true },
      { nameKey: "wallet", href: "/settings/wallet", icon: Wallet, roles: ["super_admin", "admin", "umkm", "upt"] }
    ]
  }
];

interface DashboardSidebarProps {
  role?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export default function DashboardSidebar({ role = "guest", collapsed, onToggleCollapse, className = "" }: DashboardSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("DashboardSidebar");
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const filteredMenu = useMemo(() => {
    const result: MenuItem[] = [];
    
    MENU_STRUCTURE.forEach((item, index) => {
      if (item.roles && !item.roles.includes(role)) return;

      if (item.type === "label") {
        const remainingItems = MENU_STRUCTURE.slice(index + 1);
        let hasVisibleContent = false;
        
        for (const next of remainingItems) {
          if (next.type === "label") break;
          if (!next.roles || next.roles.includes(role)) {
            hasVisibleContent = true;
            break;
          }
        }
        
        if (hasVisibleContent) result.push(item);
      } else if (item.type === "dropdown") {
        const visibleSubItems = item.subItems?.filter(sub => !sub.roles || sub.roles.includes(role)) || [];
        if (visibleSubItems.length > 0) {
          result.push({ ...item, subItems: visibleSubItems });
        }
      } else {
        result.push(item);
      }
    });

    return result;
  }, [role]);

  const activeDropdownKeys = useMemo(() => {
    const keys: string[] = [];
    filteredMenu.forEach((item) => {
      if (item.type === "dropdown" && item.subItems?.some((sub) => {
        if (pathname === sub.href) return true;
        if (sub.exact) return false;
        if (pathname.startsWith(sub.href + "/") && (!sub.excludePaths || !sub.excludePaths.some(p => pathname.startsWith(p)))) return true;
        return false;
      })) {
        keys.push(item.nameKey);
      }
    });
    return keys;
  }, [pathname, filteredMenu]);

  useEffect(() => {
    setOpenDropdowns(activeDropdownKeys);
  }, [activeDropdownKeys]);

  useEffect(() => {
    if (!collapsed) return;
    const frame = window.requestAnimationFrame(() => setOpenDropdowns([]));
    return () => window.cancelAnimationFrame(frame);
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed: () => onToggleCollapse() }}>
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"} ${className}`}>
        <SidebarHeader collapsed={collapsed} user={user} />
        
        <nav className="sidebar-nav scrollbar-none py-4 px-3 flex-1">
          {filteredMenu.map((item, index) => {
            if (item.type === "label") {
              return !collapsed ? (
                <div key={`label-${index}`} className="px-3 pt-6 pb-2 first:pt-0">
                  <p className="text-[13px] font-medium text-muted-foreground/50 capitalize">
                    {t(`menu.${item.nameKey}`)}
                  </p>
                </div>
              ) : (
                <div key={`label-divider-${index}`} className="mx-4 my-4 h-px bg-border/40 last:hidden" />
              );
            }

            if (item.type === "dropdown" && !collapsed) {
              return (
                <SidebarDropdown 
                  key={item.nameKey}
                  item={item}
                  pathname={pathname}
                  isOpen={openDropdowns.includes(item.nameKey)}
                  onToggle={() => setOpenDropdowns(prev => {
                    if (prev.includes(item.nameKey)) {
                      return prev.filter(k => k !== item.nameKey);
                    } else {
                      const newOpen = new Set(activeDropdownKeys);
                      newOpen.add(item.nameKey);
                      return Array.from(newOpen);
                    }
                  })}
                  collapsed={collapsed}
                />
              );
            }

            return (
              <SidebarItem 
                key={item.href || `item-${index}`}
                nameKey={item.nameKey}
                href={item.href!}
                icon={item.icon}
                isActive={
                  item.exact ? pathname === item.href : (item.href === "/dashboard" 
                    ? pathname === item.href 
                    : (pathname.startsWith(item.href!) && 
                      (!item.excludePaths || !item.excludePaths.some(p => pathname.startsWith(p)))))
                }
                collapsed={collapsed}
              />
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <SidebarLogout collapsed={collapsed} />
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
