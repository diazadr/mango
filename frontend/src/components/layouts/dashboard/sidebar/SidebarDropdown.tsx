import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

interface Props {
  item: any;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
}

export const SidebarDropdown = ({ item, pathname, isOpen, onToggle, collapsed }: Props) => {
  const t = useTranslations("DashboardSidebar");
  const isParentActive = pathname === item.href || (item.subItems?.some((sub: any) => pathname === sub.href));

  if (collapsed) {
    return (
      <Link
        href={item.href}
        className={`sidebar-item justify-center ${
          isParentActive ? "sidebar-item-active" : "sidebar-item-inactive"
        }`}
        title={t(`menu.${item.nameKey}`)}
      >
        <item.icon size={18} className={`sidebar-icon ${isParentActive ? "text-sidebar-accent-foreground" : "text-muted-foreground"}`} />
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className={`sidebar-item group w-full justify-between cursor-pointer ${
          isParentActive ? "text-sidebar-accent-foreground bg-sidebar-primary/5" : "sidebar-item-inactive"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon size={18} className={`sidebar-icon ${isParentActive ? "text-sidebar-accent-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
          <span className="whitespace-nowrap overflow-hidden">{t(`menu.${item.nameKey}`)}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : "text-foreground/40"
          }`} 
        />
      </button>
      
      <div className={`ml-7 pl-4 border-l border-border transition-all duration-200 space-y-0.5 overflow-hidden ${
        isOpen ? "max-h-[600px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0 pointer-events-none"
      }`}>
        {item.subItems?.map((sub: any) => {
          const isSubActive = pathname === sub.href;
          return (
            <Link key={sub.href} href={sub.href} className={`sidebar-item ${
              isSubActive ? "sidebar-item-active" : "sidebar-item-inactive"
            }`}>
              {isSubActive && <div className="absolute left-[-17px] w-[2px] h-4 bg-sidebar-primary rounded-full" />}
              <sub.icon size={16} className={`sidebar-icon ${isSubActive ? "text-sidebar-accent-foreground" : "opacity-50"}`} />
              <span className="whitespace-nowrap overflow-hidden">{t(`menu.${sub.nameKey}`)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};