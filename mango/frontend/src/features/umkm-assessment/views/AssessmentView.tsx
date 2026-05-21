"use client";

import React, { useMemo, useState } from "react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { 
  ClipboardCheck, AlertCircle, Loader2, BookOpen, 
  PlayCircle, CheckCircle2
} from "lucide-react";
import AssessmentForm from "../components/AssessmentForm";
import AssessmentHistory from "../components/AssessmentHistory";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/lib/http/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

export function AssessmentView() {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("AssessmentPage");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
      title={t("title_selfassessment")}
      subtitle={t("title_evaluasi_mandiri_kesiapan_digital_dan_op")}
    >
      {authLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : umkmId ? (
        <div className="space-y-10">
          {/* Simple Control Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card border border-border/50 rounded-xl gap-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                    <ClipboardCheck size={28} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold">{t("mulai_penilaian_baru")}</h3>
                    <p className="text-sm text-muted-foreground max-w-md">{t("lakukan_evaluasi_berkala_untuk_memantau")}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="rounded-xl h-11 px-6 gap-2 text-muted-foreground font-bold hover:bg-muted/50">
                            <BookOpen size={16} /> Pelajari Metodologi
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
                        <DialogHeader className="bg-primary/5 p-6 border-b border-border/50">
                            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                <BookOpen className="h-5 w-5" /> Metodologi & Manfaat
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8 custom-scrollbar">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    Metodologi Penilaian
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t("methodology.description")}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['manajemen', 'produksi', 'pemasaran', 'keuangan', 'teknologi', 'sdm'].map((dim) => (
                                    <div key={dim} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                                        <h4 className="text-[10px] font-black text-primary mb-1 tracking-wide">{dim === 'sdm' ? 'SDM' : dim.charAt(0).toUpperCase() + dim.slice(1)}</h4>
                                        <p className="text-[11px] text-muted-foreground leading-normal">{t(`methodology.dimensions.${dim}`)}</p>
                                    </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-success rounded-full" />
                                    Manfaat Assessment
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        "Mengetahui posisi kesiapan teknologi.",
                                        "Mendapatkan rekomendasi perbaikan.",
                                        "Syarat akses program pendampingan.",
                                        "Benchmarking dengan standar industri."
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-2 p-3 rounded-xl bg-success/5 border border-success/10 text-xs text-foreground/80 font-medium items-start">
                                            <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-border/50 text-center bg-muted/20">
                                <p className="text-[10px] text-muted-foreground italic">
                                    {t("methodology.references")}
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button 
                    onClick={handleStartAssessment} 
                    disabled={checking}
                    className="rounded-xl px-8 gap-2 bg-primary h-11 font-bold shadow-lg shadow-primary/20 w-full sm:w-auto"
                >
                    {checking ? <Loader2 className="animate-spin h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    Mulai Assessment Sekarang
                </Button>
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
          <h2 className="text-xl font-bold">{t("data_umkm_belum_lengkap")}</h2>
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
