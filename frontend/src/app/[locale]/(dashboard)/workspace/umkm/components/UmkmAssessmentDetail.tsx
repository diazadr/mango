"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/src/lib/http/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Loader2, Calendar, Star, TrendingUp, X, Download } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import MaturityChart from "../../../workspace/umkm/assessment/components/MaturityChart";

interface UmkmAssessmentDetailProps {
  umkmId: number;
  onClose: () => void;
}

export default function UmkmAssessmentDetail({ umkmId, onClose }: UmkmAssessmentDetailProps) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  useEffect(() => {
    api.get(`/v1/assessments?umkm_id=${umkmId}`)
      .then((res) => {
        setAssessments(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedAssessment(res.data.data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [umkmId]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl max-h-[90vh] shadow-2xl border-border/50 rounded-3xl overflow-hidden flex flex-col">
        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row justify-between items-center shrink-0">
          <div>
            <CardTitle className="text-xl font-bold text-primary">Riwayat & Analisis Kematangan</CardTitle>
            <CardDescription>Detail hasil self-assessment untuk unit bisnis ini.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={20} />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-medium text-muted-foreground">Memuat data analisis...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-medium">UMKM ini belum pernah melakukan assessment.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              {/* Sidebar List */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border/50 bg-muted/10 overflow-y-auto">
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase text-muted-foreground px-2">Daftar Sesi</p>
                  {assessments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAssessment(a)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        selectedAssessment?.id === a.id 
                          ? "bg-white shadow-md border-primary/20 ring-1 ring-primary/5" 
                          : "border-transparent hover:bg-white/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">{a.level}</span>
                        <Badge variant="outline" className="text-[9px] px-1 h-4">{a.total_score}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar size={10} />
                        {format(new Date(a.created_at), "dd MMM yyyy", { locale: id })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail View */}
              <div className="flex-1 p-8 overflow-y-auto">
                {selectedAssessment && (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                          {selectedAssessment.level}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          Sesi Assessment: {format(new Date(selectedAssessment.created_at), "eeee, dd MMMM yyyy HH:mm", { locale: id })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="bg-primary text-white p-4 rounded-3xl text-center min-w-[120px] shadow-lg shadow-primary/20">
                          <p className="text-[10px] font-bold uppercase opacity-80">Skor Total</p>
                          <p className="text-3xl font-black">{selectedAssessment.total_score}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/id/document/assessment/${selectedAssessment.id}`, '_blank')}
                          className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold gap-2 h-9"
                        >
                          <Download size={14} /> PDF
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="text-primary" size={20} />
                          <h4 className="font-bold text-primary uppercase text-sm">Grafik Radar Dimensi</h4>
                        </div>
                        <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 flex justify-center">
                          <MaturityChart data={selectedAssessment.chart_data} size={280} />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="text-primary" size={20} />
                          <h4 className="font-bold text-primary uppercase text-sm">Rekomendasi Utama</h4>
                        </div>
                        <div className="space-y-3">
                          {selectedAssessment.recommendations?.slice(0, 3).map((rec: any) => (
                            <div key={rec.id} className="p-4 rounded-2xl bg-white border border-border/50 shadow-sm">
                              <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black uppercase text-primary">{rec.category?.name}</span>
                                <Badge className={rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}>
                                  {rec.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-foreground/80 leading-relaxed">{rec.recommendation_text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-muted/20 border-t border-border/50 flex justify-end shrink-0">
          <Button onClick={onClose} className="rounded-xl px-8 font-bold">Tutup</Button>
        </div>
      </Card>
    </div>
  );
}
