"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/src/i18n/navigation";
import { api } from "@/src/lib/http/axios";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  Loader2, ChevronRight, ChevronLeft, CheckCircle2, 
  AlertCircle, Lock, CalendarClock, X, Activity, ShieldCheck, Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { format, addDays, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";

interface Question {
  id: number;
  text: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  questions: Question[];
}

interface AssessmentFormProps {
  umkmId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: any;
}

export default function AssessmentForm({ umkmId, isOpen, onOpenChange, initialData }: AssessmentFormProps) {
  const router = useRouter();
  const t = useTranslations("AssessmentPage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { value: string; score: number }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const qRes = await api.get("/v1/assessments/questions");
        setCategories(qRes.data.data);

        if (initialData?.status === 'draft' && initialData.answers && initialData.answers.length > 0) {
          const existingAnswers: Record<number, { value: string; score: number }> = {};
          initialData.answers.forEach((ans: any) => {
            existingAnswers[ans.question_id] = { 
              value: ans.value, 
              score: parseFloat(ans.score) 
            };
          });
          setAnswers(existingAnswers);
        }
      } catch (error) {
        console.error("Failed to load questions", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
        fetchQuestions();
    }
  }, [isOpen, initialData]);

  const handleScoreSelect = (questionId: number, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { value: score.toString(), score },
    }));
  };

  const nextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!initialData?.id) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const answerPayload = Object.entries(answers).map(([qId, data]) => ({
        question_id: parseInt(qId),
        value: data.value,
        score: data.score,
      }));

      await api.post(`/v1/assessments/${initialData.id}/answers`, { answers: answerPayload });
      await api.post(`/v1/assessments/${initialData.id}/calculate`);

      setStatus({ type: "success", message: "Assessment berhasil disimpan." });
      setTimeout(() => {
        onOpenChange(false);
        router.push(`/workspace/umkm/assessment/${initialData.id}/result`);
      }, 1500);
    } catch (error: any) {
      console.error("Failed to submit assessment", error);
      setStatus({ type: "destructive", message: error.response?.data?.message || "Terjadi kesalahan sistem." });
    } finally {
      setSubmitting(false);
    }
  };

  if (initialData?.status === 'submitted') {
    const lastDate = new Date(initialData.submitted_at);
    const nextDate = addDays(lastDate, 30);
    const daysRemaining = differenceInDays(nextDate, new Date());

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-background">
            <div className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Timer size={28} />
                </div>
                
                <div className="space-y-2">
                    <DialogTitle className="text-xl font-bold text-foreground">Batas Waktu Assessment</DialogTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("methodology.reassessment_locked")}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50 border">
                        <span className="text-xs font-medium text-muted-foreground">Terakhir Assessment</span>
                        <span className="text-xs font-bold">{format(lastDate, "dd MMMM yyyy", { locale: localeId })}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/20">
                        <span className="text-xs font-medium text-primary">Tersedia Kembali</span>
                        <span className="text-xs font-bold text-primary">{format(nextDate, "dd MMMM yyyy", { locale: localeId })}</span>
                    </div>
                </div>

                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Tersisa {daysRemaining} hari lagi
                </p>

                <Button 
                    variant="outline" 
                    className="w-full rounded-xl"
                    onClick={() => onOpenChange(false)}
                >
                    Tutup
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    );
  }

  const category = categories[currentStep];
  const progress = categories.length > 0 ? ((currentStep + 1) / categories.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border-none shadow-2xl bg-background">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <DialogTitle className="sr-only">Memuat Assessment</DialogTitle>
            <DialogDescription className="sr-only">Mohon tunggu sebentar saat kami menyiapkan kuesioner.</DialogDescription>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm font-medium">Memuat kuesioner...</p>
          </div>
        ) : (
          <>
            <DialogHeader className="bg-background border-b p-6 shrink-0">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">
                            Tahap {currentStep + 1} dari {categories.length}
                        </p>
                        <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                            {category?.name}
                        </DialogTitle>
                    </div>
                </div>
                
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-6">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 bg-muted/10">
                <div className="max-w-3xl mx-auto space-y-10">
                    {status && (
                        <Alert variant={status.type} className="rounded-xl">
                            <AlertDescription className="text-xs font-bold">{status.message}</AlertDescription>
                        </Alert>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={category?.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            {category?.questions.map((q, idx) => (
                                <div key={q.id} className="space-y-5 bg-background p-6 rounded-2xl border shadow-sm">
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </span>
                                        <p className="text-base font-semibold text-foreground leading-snug pt-0.5">
                                            {q.text}
                                        </p>
                                    </div>
                                    <div className="pl-11 flex flex-wrap items-center gap-3">
                                        {[1, 2, 3, 4, 5].map((score) => (
                                            <button
                                                key={score}
                                                onClick={() => handleScoreSelect(q.id, score)}
                                                className={`
                                                    h-11 w-11 rounded-xl border-2 font-bold transition-all text-sm
                                                    ${answers[q.id]?.score === score 
                                                        ? "bg-primary border-primary text-white shadow-md" 
                                                        : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}
                                                `}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                        <AnimatePresence mode="wait">
                                            {answers[q.id]?.score && (
                                                <motion.span 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="ml-2 text-xs text-primary font-bold italic self-center"
                                                >
                                                    — {t(`scale.${answers[q.id].score}`)}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="p-6 bg-background border-t flex justify-between items-center shrink-0">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0 || submitting}
                    className="h-11 rounded-xl px-6 gap-2 font-bold"
                >
                    <ChevronLeft size={18} />
                    Kembali
                </Button>

                {currentStep === categories.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < categories.reduce((acc, cat) => acc + cat.questions.length, 0)}
                        className="h-11 rounded-xl px-8 bg-success hover:bg-success/90 text-white font-bold gap-2 shadow-lg shadow-success/20"
                    >
                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck size={18} />}
                        Selesaikan
                    </Button>
                ) : (
                    <Button
                        onClick={nextStep}
                        disabled={category?.questions.some(q => !answers[q.id])}
                        className="h-11 rounded-xl px-10 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
                    >
                        Lanjutkan
                        <ChevronRight size={18} />
                    </Button>
                )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
