import { 
  Users, Building2, GraduationCap, MessageSquare, 
  ArrowRight, School, Clock, CheckCircle2
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { MetricCard } from "@/src/components/ui/dashboard/MetricCard";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { QuickActionCard } from "@/src/components/ui/dashboard/QuickActionCard";
import { ProgressBar } from "@/src/components/ui/dashboard/ProgressBar";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";

const stats = [
  { title: "Total UMKM terdaftar", value: "156", trend: "+8 bulan ini", icon: Building2, color: "text-primary", bg: "bg-primary/10" },
  { title: "Total advisor aktif", value: "24", trend: "Staf POLMAN", icon: GraduationCap, color: "text-accent", bg: "bg-accent/10" },
  { title: "Permohonan mentoring", value: "12", trend: "Pending: 3", icon: MessageSquare, color: "text-warning", bg: "bg-warning/10", accent: true },
  { title: "Sesi selesai", value: "89", trend: "Tingkat sukses 95%", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
];

export const CampusDashboardView = () => {
  return (
    <DashboardPageShell 
      title="Console admin kampus" 
      subtitle="Monitoring ekosistem pendampingan UMKM POLMAN Bandung."
      icon={School}
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
          title="Permohonan terbaru"
          description="Daftar permohonan mentoring yang perlu delegasi."
          badge={<Badge variant="warning">3 Pending</Badge>}
          noPadding
          className="lg:col-span-4"
        >
          <EmptyState
            icon={Clock}
            title="Log aktivitas real-time"
            description="Gunakan menu Delegasi Mentoring untuk meninjau dan menunjuk advisor pada permohonan yang masuk."
          />
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <SectionCard
            title="Distribusi keahlian"
            icon={GraduationCap}
          >
            <div className="space-y-4">
              <ProgressBar label="Manufaktur & produksi" value={45} color="primary" />
              <ProgressBar label="Manajemen bisnis" value={30} color="accent" />
              <ProgressBar label="Digital marketing" value={25} color="success" />
            </div>
          </SectionCard>

          <SectionCard title="Tindakan admin" accent>
            <div className="space-y-2">
              <QuickActionCard 
                label="Kelola advisor" 
                icon={GraduationCap}
                onClick={() => window.location.href='/admin/campus/advisors'}
              />
              <QuickActionCard 
                label="Atur departemen" 
                icon={Building2}
                onClick={() => window.location.href='/admin/departments'}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
};