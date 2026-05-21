import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { api } from "@/src/lib/http/axios";
import { mentoringService } from "../services/mentoringService";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

import {
  Loader2,
  Send,
  Sparkles,
  MessageSquareText,
  AlertTriangle,
  ChevronRight,
  Target
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";

interface MentoringRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message?: string) => void;
}

export const MentoringRequestForm = ({
  open,
  onOpenChange,
  onSuccess,
}: MentoringRequestFormProps) => {
  const t = useTranslations("MentoringRequestForm");

  const [loading, setLoading] = useState(false);
  const [fetchingAssessment, setFetchingAssessment] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    topic: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      const fetchLastAssessment = async () => {
        setFetchingAssessment(true);
        try {
          const res = await mentoringService.getLatestAssessment();
          const items = res.data.data || [];
          if (items.length > 0) {
            setRecommendations(items[0].recommendations || []);
          }
        } catch (err) {
          console.error("Failed to fetch assessment recommendations", err);
        } finally {
          setFetchingAssessment(false);
        }
      };
      fetchLastAssessment();
    }
  }, [open]);

  const handleSelectRecommendation = (rec: any) => {
    setFormData({
      topic: `Pendampingan ${rec.category?.name || "Bisnis"}`,
      description: `Berdasarkan hasil asesmen, saya membutuhkan bantuan terkait: ${rec.recommendation_text}`,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post(
        "/v1/mentoring/requests",
        formData
      );

      setFormData({
        topic: "",
        description: "",
      });

      onSuccess(
        "Permohonan mentoring Anda telah berhasil dikirim."
      );
    } catch (error: any) {
      console.error(
        "Failed to submit request",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border border-border/50 rounded-2xl shadow-2xl bg-background">
        
        <DialogHeader className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-6">
          
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex items-start gap-4">
            
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {t("ajukan_mentoring")}
              </DialogTitle>

              <DialogDescription className="max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("dapatkan_bantuan_teknis_dari_a")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Recommendation Selection */}
          {recommendations.length > 0 && (
            <div className="p-6 bg-muted/30 border-b border-border/50">
               <div className="flex items-center gap-2 mb-4">
                 <Target className="h-4 w-4 text-primary" />
                 <p className="text-xs font-bold text-muted-foreground tracking-wider">{t("rekomendasi_berdasarkan_asesmen")}</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.slice(0, 4).map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => handleSelectRecommendation(rec)}
                      className="group text-left p-3 rounded-xl border border-border/50 bg-background hover:border-primary/50 hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <Badge variant="outline" className="text-[10px] font-bold py-0 h-4">{rec.category?.name}</Badge>
                        {rec.priority === 'high' && <Badge className="bg-destructive text-[9px] h-4 px-1">{t("penting")}</Badge>}
                      </div>
                      <p className="text-xs text-foreground font-medium line-clamp-2 pr-4">{rec.recommendation_text}</p>
                      <ChevronRight className="absolute right-2 bottom-3 h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            <div className="grid gap-5">
              
              <div className="space-y-2">
                
                <Label
                  htmlFor="topic"
                  className="text-sm font-semibold"
                >
                  {t("topik_konsultasi")}
                </Label>

                <div className="relative">
                  <MessageSquareText className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="topic"
                    placeholder={t(
                      "contoh_digitalisasi_produksi_k"
                    )}
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        topic: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl border-border/60 bg-background pl-10 text-sm shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold"
                >
                  {t("deskripsi_masalah")}
                </Label>

                <Textarea
                  id="description"
                  placeholder={t(
                    "jelaskan_secara_detail_kendala"
                  )}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    })
                  }
                  className="min-h-[140px] rounded-xl border-border/60 bg-background text-sm shadow-sm transition-all resize-none focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="rounded-xl border border-primary/10 bg-primary/[0.03] px-4 py-3 flex gap-3 items-start">
                <AlertTriangle size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Jelaskan kendala produksi, digitalisasi,
                  manajemen, atau teknis secara spesifik agar
                  advisor dapat memberikan solusi yang lebih
                  tepat.
                </p>
              </div>
            </div>

            <DialogFooter className="border-t border-border/50 pt-5">
              
              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onOpenChange(false)
                  }
                  className="h-11 rounded-xl px-5"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-xl px-5 font-semibold shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}

                  {t("kirim_permohonan")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};