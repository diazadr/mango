"use client";

import React, { useMemo, useState } from "react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { 
  ClipboardCheck, AlertCircle, Loader2, BookOpen, 
  PlayCircle, CheckCircle2
} from "lucide-react";
import AssessmentForm from "./components/AssessmentForm";
import AssessmentHistory from "./components/AssessmentHistory";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/http/axios";

export default function AssessmentPage() {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("AssessmentPage");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const umkmId = useMemo(() => user?.umkm?.id || null, [user]);

  const handleStartAssessment = async () => {
    if (!umkmId) return;
    setChecking(true);
    try {
        const res = await api.post("/v1/assessments", { umkm_id: umkmId });
        setAssessmentData(res.data.data);
        setIsFormOpen(true);
    } catch (err) {
        console.error("Failed to start assessment", err);
    } finally {
        setChecking(false);
    }
  };

  return (
    <DashboardPageShell
      title="Self-Assessment"
      subtitle="Evaluasi mandiri kesiapan digital dan operasional unit usaha."
    >
      {authLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : umkmId ? (
        <div className="space-y-10">
          {/* Simple Control Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background border rounded-2xl gap-6">
            <div className="space-y-1">
                <h3 className="text-lg font-bold">Mulai Penilaian Baru</h3>
                <p className="text-sm text-muted-foreground">Lakukan evaluasi berkala untuk memantau kemajuan bisnis Anda.</p>
            </div>
            <Button 
                onClick={handleStartAssessment} 
                disabled={checking}
                className="rounded-xl px-8 gap-2 bg-primary h-11"
            >
                {checking ? <Loader2 className="animate-spin h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                Mulai Assessment
            </Button>
          </div>

          {/* Methodology Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title="Metodologi Penilaian" icon={BookOpen}>
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("methodology.description")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['manajemen', 'produksi', 'pemasaran', 'keuangan', 'teknologi', 'sdm'].map((dim) => (
                      <div key={dim} className="p-4 rounded-xl border bg-muted/20">
                        <h4 className="text-xs font-bold uppercase text-primary mb-1">{dim}</h4>
                        <p className="text-[11px] text-muted-foreground leading-normal">{t(`methodology.dimensions.${dim}`)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>
            
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-2xl p-6 border">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    Manfaat Assessment
                </h3>
                <ul className="space-y-3">
                  {[
                    "Mengetahui posisi kesiapan teknologi.",
                    "Mendapatkan rekomendasi perbaikan.",
                    "Syarat akses program pendampingan."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                        <CheckCircle2 size={14} className="text-primary shrink-0" />
                        {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl border text-center">
                 <p className="text-[10px] text-muted-foreground mb-1 italic">
                    {t("methodology.references")}
                 </p>
              </div>
            </div>
          </div>

          <AssessmentHistory umkmId={umkmId} />

          {assessmentData && (
              <AssessmentForm 
                umkmId={umkmId} 
                isOpen={isFormOpen} 
                onOpenChange={setIsFormOpen}
                initialData={assessmentData}
              />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-xl font-bold">Data UMKM Belum Lengkap</h2>
          <p className="text-muted-foreground max-w-md">
            Anda perlu melengkapi profil UMKM terlebih dahulu sebelum dapat melakukan self-assessment.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/umkm-profile'}>
              Lengkapi Profil Sekarang
          </Button>
        </div>
      )}
    </DashboardPageShell>
  );
}
