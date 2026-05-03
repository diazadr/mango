"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Key, Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";

import { api } from "@/src/lib/http/axios";
import { Link } from "@/src/i18n/navigation";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { AdminDataCard, AdminState } from "@/src/components/ui/dashboard/AdminDataView";

type RbacSection = {
  title: string;
  description: string;
  href: string;
  icon: typeof ShieldCheck;
  count: number;
  label: string;
};

export default function RBACPage() {
  const t = useTranslations("RbacPage");
  const [loading, setLoading] = useState(true);
  const [roleCount, setRoleCount] = useState(0);
  const [permissionCount, setPermissionCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchSummary() {
      setLoading(true);
      try {
        const [roles, permissions, members] = await Promise.all([
          api.get("/v1/admin/roles", { params: { per_page: 1 } }),
          api.get("/v1/admin/permissions", { params: { per_page: 1 } }),
          api.get("/v1/admin/user-roles", { params: { per_page: 1 } }),
        ]);

        if (!mounted) return;
        setRoleCount(roles.data.meta?.total || roles.data.total || 0);
        setPermissionCount(permissions.data.meta?.total || permissions.data.total || 0);
        setMemberCount(members.data.meta?.total || members.data.total || 0);
      } catch {
        if (!mounted) return;
        setRoleCount(0);
        setPermissionCount(0);
        setMemberCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const sections: RbacSection[] = [
    {
      title: t("roles_title"),
      description: t("roles_desc"),
      href: "/admin/rbac/roles",
      icon: ShieldCheck,
      count: roleCount,
      label: t("roles_label"),
    },
    {
      title: t("permissions_title"),
      description: t("permissions_desc"),
      href: "/admin/rbac/permissions",
      icon: Key,
      count: permissionCount,
      label: t("permissions_label"),
    },
    {
      title: t("members_title"),
      description: t("members_desc"),
      href: "/admin/rbac/members",
      icon: UserPlus,
      count: memberCount,
      label: t("members_label"),
    },
  ];

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      icon={ShieldCheck}
    >
      <AdminDataCard>
        {loading ? (
          <AdminState icon={Loader2} title={t("loading")} loading />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("section")}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground whitespace-nowrap hidden md:table-cell">{t("description")}</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground whitespace-nowrap">{t("records")}</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground whitespace-nowrap text-right">{t("open")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <tr key={section.href} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{section.title}</p>
                            <p className="text-xs text-muted-foreground truncate md:hidden">{section.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{section.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                          {section.count} {section.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link href={section.href}>
                              {t("manage")}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminDataCard>

      <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg flex items-start gap-3">
        <Users className="text-primary mt-0.5 h-4 w-4" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("note")}
        </p>
      </div>
    </DashboardPageShell>
  );
}
