import { 
  Users, Building2, Zap, ShieldCheck, 
  ArrowRight, Activity, Database
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";

const stats = [
  { title: "Total users", value: "1,240", trend: "+12 this month", icon: Users, color: "text-primary", bg: "bg-primary/10" },
  { title: "Active organizations", value: "48", trend: "+2 this month", icon: Building2, color: "text-accent", bg: "bg-accent/10", accent: true },
  { title: "System uptime", value: "99.9%", trend: "Optimal", icon: Zap, color: "text-success", bg: "bg-success/10" },
  { title: "Security status", value: "Secure", trend: "0 incidents", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
];

const recentUsers = [
  { name: "Ahmad Fauzi", email: "ahmad@example.com", role: "umkm", joined: "2024-04-10" },
  { name: "Siti Rahayu", email: "siti@example.com", role: "advisor", joined: "2024-04-09" },
  { name: "Budi Santoso", email: "budi@example.com", role: "admin", joined: "2024-04-08" },
  { name: "Dewi Kusuma", email: "dewi@example.com", role: "umkm", joined: "2024-04-07" },
  { name: "Eko Prasetyo", email: "eko@example.com", role: "umkm", joined: "2024-04-06" },
];

import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";

export const AdminDashboardView = () => {
  return (
    <DashboardPageShell 
      title="Admin dashboard" 
      subtitle="Platform overview and system monitoring."
      icon={Activity}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            iconColor={stat.color}
            iconBg={stat.bg}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mt-6">
        <SectionCard
          title="Recent users"
          description="Latest registered members across all roles."
          noPadding
          className="lg:col-span-4"
        >
          <div className="overflow-x-auto">
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>User</AdminTableHeadCell>
                  <AdminTableHeadCell>Role</AdminTableHeadCell>
                  <AdminTableHeadCell className="hidden sm:table-cell">Joined</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {recentUsers.map((user) => (
                  <AdminTableRow key={user.email}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge type="role" value={user.role} />
                    </AdminTableCell>
                    <AdminTableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.joined).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </div>
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <SectionCard
            title="User distribution"
            icon={Activity}
          >
            <div className="space-y-4">
              <ProgressBar label="UMKM accounts" value={82} color="primary" />
              <ProgressBar label="Advisor accounts" value={18} color="accent" />
            </div>
          </SectionCard>

          <SectionCard title="Quick actions">
            <div className="space-y-2">
              <QuickActionCard label="Sync UMKM data" icon={Database} />
              <QuickActionCard label="Review security logs" icon={ShieldCheck} iconBg="bg-destructive/10" iconColor="text-destructive" />
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
};