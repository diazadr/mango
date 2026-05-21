"use client";

import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { useRouter } from "@/src/i18n/navigation";

import { api } from "@/src/lib/http/axios";

import { Button } from "@/src/components/ui/button";

import {
  Alert,
  AlertDescription,
} from "@/src/components/ui/alert";

import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Timer,
  History,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { useTranslations } from "next-intl";

import {
  format,
  addDays,
  differenceInDays,
} from "date-fns";

import { id as localeId } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  VisuallyHidden,
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
  onOpenChange: (
    open: boolean
  ) => void;
  initialData: any;
}

export default function AssessmentForm({
  umkmId,
  isOpen,
  onOpenChange,
  initialData,
}: AssessmentFormProps) {
  const router = useRouter();

  const t =
    useTranslations(
      "AssessmentPage"
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [currentStep, setCurrentStep] =
    useState(0);

  const [answers, setAnswers] =
    useState<
      Record<
        number,
        {
          value: string;
          score: number;
        }
      >
    >({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [status, setStatus] =
    useState<{
      type:
        | "success"
        | "destructive";
      message: string;
    } | null>(null);

  const contentRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions =
      async () => {
        setLoading(true);

        try {
          const qRes =
            await api.get(
              "/v1/assessments/questions"
            );

          setCategories(
            qRes.data.data
          );

          if (
            initialData?.status ===
              "draft" &&
            initialData.answers &&
            initialData.answers
              .length > 0
          ) {
            const existingAnswers: Record<
              number,
              {
                value: string;
                score: number;
              }
            > = {};

            initialData.answers.forEach(
              (ans: any) => {
                existingAnswers[
                  ans.question_id
                ] = {
                  value: ans.value,
                  score:
                    parseFloat(
                      ans.score
                    ),
                };
              }
            );

            setAnswers(
              existingAnswers
            );
          }
        } catch (error) {
          console.error(
            "Failed to load questions",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, initialData]);

  const scrollToTop = () => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScoreSelect = (
    questionId: number,
    score: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        value:
          score.toString(),
        score,
      },
    }));
  };

  const nextStep = () => {
    if (
      currentStep <
      categories.length - 1
    ) {
      setCurrentStep(
        currentStep + 1
      );

      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(
        currentStep - 1
      );

      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  };

  const handleSubmit =
    async () => {
      if (!initialData?.id)
        return;

      setSubmitting(true);

      setStatus(null);

      try {
        const answerPayload =
          Object.entries(
            answers
          ).map(
            ([qId, data]) => ({
              question_id:
                parseInt(qId),
              value:
                data.value,
              score:
                data.score,
            })
          );

        await api.post(
          `/v1/assessments/${initialData.id}/answers`,
          {
            answers:
              answerPayload,
          }
        );

        await api.post(
          `/v1/assessments/${initialData.id}/calculate`
        );

        setStatus({
          type: "success",
          message:
            "Assessment berhasil disimpan.",
        });

        setTimeout(() => {
          onOpenChange(false);

          router.push(
            `/workspace/umkm/assessment/${initialData.id}/result`
          );
        }, 1500);
      } catch (error: any) {
        console.error(
          "Failed to submit assessment",
          error
        );

        setStatus({
          type:
            "destructive",
          message:
            error.response?.data
              ?.message ||
            "Terjadi kesalahan sistem.",
        });
      } finally {
        setSubmitting(false);
      }
    };

  if (
    initialData?.status ===
    "submitted"
  ) {
    const lastDate =
      new Date(
        initialData.submitted_at
      );

    const nextDate =
      addDays(lastDate, 30);

    const daysRemaining =
      differenceInDays(
        nextDate,
        new Date()
      );

    return (
      <Dialog
        open={isOpen}
        onOpenChange={
          onOpenChange
        }
      >
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/50 bg-card p-0 overflow-hidden shadow-xl">
          
          <div className="p-8 text-center space-y-6">
            
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Timer className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              
              <DialogTitle className="text-xl font-bold">
                Batas Waktu Assessment
              </DialogTitle>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(
                  "methodology.reassessment_locked"
                )}
              </p>
            </div>

            <div className="space-y-3">
              
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Terakhir Assessment
                </span>

                <span className="text-xs font-bold">
                  {format(
                    lastDate,
                    "dd MMMM yyyy",
                    {
                      locale:
                        localeId,
                    }
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-3">
                <span className="text-xs font-medium text-primary">
                  Tersedia Kembali
                </span>

                <span className="text-xs font-bold text-primary">
                  {format(
                    nextDate,
                    "dd MMMM yyyy",
                    {
                      locale:
                        localeId,
                    }
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs font-bold tracking-wide text-muted-foreground">
              Tersisa{" "}
              {daysRemaining} hari
            </p>

            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const category =
    categories[currentStep];

  const progress =
    categories.length > 0
      ? ((currentStep + 1) /
          categories.length) *
        100
      : 0;

  const totalQuestions =
    categories.reduce(
      (acc, cat) =>
        acc +
        cat.questions.length,
      0
    );

  const answeredCount =
    Object.keys(answers)
      .length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden rounded-2xl border border-border/50 bg-card p-0 shadow-2xl">
        
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <VisuallyHidden>
              <DialogTitle>{t("loading_assessment")}</DialogTitle>
              <DialogDescription>{t("please_wait_while_we_load_the_assessment")}</DialogDescription>
            </VisuallyHidden>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="text-sm font-medium text-muted-foreground">
              Memuat kuesioner...
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="shrink-0 border-b border-border/50 bg-card px-6 py-5">
              
              <div className="flex flex-col gap-5">
                
                <div className="flex items-start justify-between gap-4">
                  
                  <div className="space-y-2">
                    
                    <div className="flex items-center gap-2">
                      
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <History className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold tracking-wide text-primary">
                          Tahap{" "}
                          {currentStep +
                            1}{" "}
                          dari{" "}
                          {
                            categories.length
                          }
                        </p>

                        <DialogTitle className="text-2xl font-bold tracking-tight">
                          {
                            category?.name
                          }
                        </DialogTitle>
                      </div>
                    </div>

                    <DialogDescription className="max-w-2xl text-sm leading-relaxed">
                      Jawab setiap
                      pertanyaan sesuai
                      kondisi aktual
                      perusahaan Anda.
                    </DialogDescription>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-2">
                    
                    <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-2 text-right">
                      
                      <p className="text-xs text-muted-foreground">
                        Progress
                      </p>

                      <p className="text-lg font-bold">
                        {
                          answeredCount
                        }
                        /
                        {
                          totalQuestions
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>
                      Progress
                    </span>

                    <span>
                      {Math.round(
                        progress
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto bg-muted/[0.04] px-6 py-8 scroll-smooth md:px-10"
            >
              
              <div className="mx-auto max-w-4xl space-y-6">
                
                {status && (
                  <Alert
                    variant={
                      status.type
                    }
                    className="rounded-xl"
                  >
                    <AlertDescription className="text-sm font-medium">
                      {
                        status.message
                      }
                    </AlertDescription>
                  </Alert>
                )}

                <AnimatePresence mode="wait">
                  
                  <motion.div
                    key={
                      category?.id
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="space-y-6"
                  >
                    {category?.questions.map(
                      (
                        q,
                        idx
                      ) => (
                        <div
                          key={
                            q.id
                          }
                          className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all"
                        >
                          
                          <div className="flex gap-4">
                            
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                              {idx +
                                1}
                            </div>

                            <div className="flex-1 space-y-5">
                              
                              <p className="text-base font-semibold leading-relaxed text-foreground">
                                {
                                  q.text
                                }
                              </p>

                              <div className="flex flex-wrap items-center gap-3">
                                
                                {[
                                  1,
                                  2,
                                  3,
                                  4,
                                  5,
                                ].map(
                                  (
                                    score
                                  ) => (
                                    <button
                                      key={
                                        score
                                      }
                                      onClick={() =>
                                        handleScoreSelect(
                                          q.id,
                                          score
                                        )
                                      }
                                      className={`
                                        h-12 w-12 rounded-xl border-2 text-sm font-bold transition-all
                                        ${
                                          answers[
                                            q
                                              .id
                                          ]
                                            ?.score ===
                                          score
                                            ? "border-primary bg-primary text-white shadow-md"
                                            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
                                        }
                                      `}
                                    >
                                      {
                                        score
                                      }
                                    </button>
                                  )
                                )}

                                <AnimatePresence>
                                  {answers[
                                    q.id
                                  ]
                                    ?.score && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        x: -10,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                      }}
                                      className="ml-1 rounded-lg bg-primary/5 px-3 py-2 text-xs font-semibold text-primary"
                                    >
                                      {t(
                                        `scale.${answers[q.id].score}`
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-border/50 bg-card px-6 py-5">
              
              <Button
                variant="ghost"
                onClick={
                  prevStep
                }
                disabled={
                  currentStep ===
                    0 ||
                  submitting
                }
                className="h-11 rounded-xl px-6 font-semibold"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>

              {currentStep ===
              categories.length -
                1 ? (
                <Button
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    submitting ||
                    answeredCount <
                      totalQuestions
                  }
                  className="h-11 rounded-xl px-8 font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}

                  Selesaikan
                </Button>
              ) : (
                <Button
                  onClick={
                    nextStep
                  }
                  disabled={category?.questions.some(
                    (q) =>
                      !answers[
                        q.id
                      ]
                  )}
                  className="h-11 rounded-xl px-8 font-semibold"
                >
                  Lanjutkan

                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}