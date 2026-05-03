import { 
  Building2, Store, ShieldCheck, 
  Users, Clock
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";

const stats = [
  { title: "Total UMKM terdaftar", value: "342", trend: "+12 minggu ini", icon: Store, color: "text-primary", bg: "bg-primary/10" },
  { title: "Menunggu persetujuan", value: "8", trend: "Anggota baru", icon: Clock, color: "text-warning", bg: "bg-warning/10", accent: true },
  { title: "Sertifikasi selesai", value: "124", trend: "Batch 2024", icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  { title: "Total pengguna", value: "512", trend: "Eksosistem unit", icon: Users, color: "text-accent", bg: "bg-accent/10" },
];

export const UptDashboardView = () => {
  return (
    <DashboardPageShell 
      title="Console pengelola unit" 
      subtitle="Pusat pengelolaan data IKM/UMKM dan verifikasi keanggotaan dalam organisasi."
      icon={Building2}
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
          title="Antrean persetujuan"
          description="User UMKM baru yang mendaftar ke organisasi Anda."
          badge={<Badge variant="warning">8 Pending</Badge>}
          noPadding
          className="lg:col-span-4"
        >
          <EmptyState
            icon={Clock}
            title="Verifikasi keanggotaan"
            description="Anda memiliki permohonan baru. Gunakan menu Persetujuan Anggota untuk memverifikasi entitas."
          />
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <SectionCard title="Tindakan cepat" accent>
            <div className="space-y-2">
              <QuickActionCard 
                label="Persetujuan masuk" 
                icon={ShieldCheck}
                onClick={() => window.location.href='/admin/upt/approvals'}
              />
              <QuickActionCard 
                label="Kelola registry IKM/UMKM" 
                icon={Store}
                onClick={() => window.location.href='/admin/upt/umkm'}
              />
              <QuickActionCard 
                label="Update profil unit" 
                icon={Building2}
                onClick={() => window.location.href='/admin/upt/profile'}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
};