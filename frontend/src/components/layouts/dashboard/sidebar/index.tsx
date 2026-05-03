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
  ClipboardCheck, MessageSquare, GraduationCap, School, Landmark, Wrench, FileText
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
  subItems?: { nameKey: string; href: string; icon: any; roles?: string[] }[];
  excludePaths?: string[];
};

const MENU_STRUCTURE: MenuItem[] = [
  { type: "label", nameKey: "section_overview", roles: ["super_admin", "admin", "advisor", "upt", "umkm"] },
  { 
    type: "item",
    nameKey: "dashboard", 
    href: "/dashboard",
    icon: LayoutDashboard, 
    roles: ["super_admin", "admin", "advisor", "upt", "umkm"] 
  },

  { type: "label", nameKey: "section_administration", roles: ["super_admin"] },
  { 
    type: "item",
    nameKey: "user_control", 
    href: "/admin/users", 
    icon: Users, 
    roles: ["super_admin"] 
  },
  {
    type: "dropdown",
    nameKey: "rbac_security",
    href: "/admin/rbac",
    icon: ShieldCheck,
    roles: ["super_admin"],
    subItems: [
      { nameKey: "permission_matrix", href: "/admin/rbac/permissions", icon: Key },
      { nameKey: "role_assignment", href: "/admin/rbac/roles", icon: ShieldAlert },
      { nameKey: "member_access", href: "/admin/rbac/members", icon: Users },
    ],
  },
  {
    type: "dropdown",
    nameKey: "institution_management",
    href: "/admin/institutions",
    icon: Building2,
    roles: ["super_admin"],
    subItems: [
      { nameKey: "master_institutions", href: "/admin/institutions", icon: Building2 },
      { nameKey: "department_nodes", href: "/admin/departments", icon: ClipboardList },
    ],
  },
  {
    type: "dropdown",
    nameKey: "organization_management",
    href: "/admin/organizations",
    icon: Store,
    roles: ["super_admin"],
    subItems: [
      { nameKey: "master_organizations", href: "/admin/organizations", icon: Store },
    ],
  },

  { type: "label", nameKey: "section_campus", roles: ["admin"] },
  {
    type: "dropdown",
    nameKey: "campus_console",
    href: "/admin/campus",
    icon: School,
    roles: ["admin"],
    subItems: [
      { nameKey: "campus_info", href: "/admin/campus/info", icon: Landmark },
      { nameKey: "department_nodes", href: "/admin/departments", icon: ClipboardList },
      { nameKey: "advisor_management", href: "/admin/campus/advisors", icon: GraduationCap, roles: ["admin"] },
      { nameKey: "mentoring_assignment", href: "/admin/campus/mentoring", icon: MessageSquare, roles: ["admin"] },
    ],
  },

  { type: "label", nameKey: "section_upt", roles: ["upt"] },
  {
    type: "dropdown",
    nameKey: "upt_console",
    href: "/admin/upt",
    icon: Building2,
    roles: ["upt"],
    subItems: [
      { nameKey: "org_profile", href: "/admin/upt/profile", icon: Landmark },
      { nameKey: "umkm_registry", href: "/admin/upt/umkm", icon: Store },
      { nameKey: "member_approval", href: "/admin/upt/approvals", icon: ShieldCheck },
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
      { nameKey: "articles", href: "/admin/articles", icon: FileText },
    ],
  },

  { type: "label", nameKey: "section_business", roles: ["umkm", "upt"] },
  {
    type: "item",
    nameKey: "technical_profile",
    href: "/workspace/umkm/technical-profile",
    icon: Wrench,
    roles: ["umkm"]
  },
  {
    type: "item",
    nameKey: "inventory_catalog",
    href: "/workspace/umkm/products",
    icon: Package,
    roles: ["umkm"]
  },
  {
    type: "item",
    nameKey: "machine_catalog",
    href: "/workspace/machines",
    icon: Package,
    roles: ["umkm", "upt"]
  },

  { type: "label", nameKey: "section_strategy", roles: ["umkm"] },
  {
    type: "item",
    nameKey: "assessment",
    href: "/workspace/umkm/assessment",
    icon: ClipboardCheck,
    roles: ["umkm"]
  },
  {
    type: "item",
    nameKey: "projects",
    href: "/workspace/umkm/projects",
    icon: Briefcase,
    roles: ["umkm"]
  },
  {
    type: "item",
    nameKey: "mentoring",
    href: "/workspace/umkm/mentoring",
    icon: MessageSquare,
    roles: ["umkm"]
  },

  { type: "label", nameKey: "section_sharing", roles: ["umkm", "upt"] },
  {
    type: "item",
    nameKey: "machine_reservation",
    href: "/workspace/reservations",
    icon: Wrench,
    roles: ["umkm", "upt"],
    excludePaths: ["/workspace/reservations/approvals"]
  },
  {
    type: "item",
    nameKey: "machine_approvals",
    href: "/workspace/reservations/approvals",
    icon: ShieldCheck,
    roles: ["umkm", "upt"]
  },

  { type: "label", nameKey: "section_identity", roles: ["umkm"] },
  { 
    type: "item",
    nameKey: "umkm_identity", 
    href: "/umkm-profile", 
    icon: Building2, 
    roles: ["umkm"] 
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
      { nameKey: "projects", href: "/workspace/advisor/projects", icon: Briefcase },
    ],
  },

  { type: "label", nameKey: "section_account", roles: ["super_admin", "admin", "advisor", "upt", "umkm"] },
  { 
    type: "item",
    nameKey: "my_identity", 
    href: "/profile", 
    icon: UserCircle, 
    roles: ["super_admin", "admin", "advisor", "upt", "umkm"] 
  },
];

interface DashboardSidebarProps {
  role?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DashboardSidebar({ role = "guest", collapsed, onToggleCollapse }: DashboardSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("DashboardSidebar");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filteredMenu = useMemo(() => {
    const result: MenuItem[] = [];
    
    MENU_STRUCTURE.forEach((item, index) => {
      // Check if role has access to this item/label
      if (item.roles && !item.roles.includes(role)) return;

      if (item.type === "label") {
        // Only add label if the next items (until next label) have at least one visible item for this role
        const remainingItems = MENU_STRUCTURE.slice(index + 1);
        let hasVisibleContent = false;
        
        for (const next of remainingItems) {
          if (next.type === "label") break;
          if (next.roles?.includes(role)) {
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

  useEffect(() => {
    filteredMenu.forEach((item) => {
      if (item.type === "dropdown" && item.subItems?.some((sub) => pathname.includes(sub.href))) {
        setOpenDropdown(item.nameKey);
      }
    });
  }, [pathname, filteredMenu]);

  useEffect(() => {
    if (!collapsed) return;
    const frame = window.requestAnimationFrame(() => setOpenDropdown(null));
    return () => window.cancelAnimationFrame(frame);
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed: () => onToggleCollapse() }}>
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        <SidebarHeader collapsed={collapsed} user={user} />
        
        <nav className="sidebar-nav scrollbar-none py-4 px-3 flex-1">
          {filteredMenu.map((item, index) => {
            if (item.type === "label") {
              return !collapsed ? (
                <div key={`label-${index}`} className="px-3 pt-6 pb-2 first:pt-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40">
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
                  isOpen={openDropdown === item.nameKey}
                  onToggle={() => setOpenDropdown(openDropdown === item.nameKey ? null : item.nameKey)}
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
                  item.href === "/dashboard" 
                    ? pathname === item.href 
                    : (pathname.startsWith(item.href!) && 
                      (!item.excludePaths || !item.excludePaths.some(p => pathname.startsWith(p))))
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
