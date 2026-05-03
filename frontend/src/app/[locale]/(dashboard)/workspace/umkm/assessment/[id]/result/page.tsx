"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { 
  Trophy, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  MessageSquarePlus,
  ArrowLeft,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "@/src/i18n/navigation";
import MaturityChart from "../../components/MaturityChart";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/assessments/${params.id}`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardPageShell
      title="Hasil Analisis Kematangan"
      subtitle="Berdasarkan jawaban Anda, berikut adalah profil kematangan dan rekomendasi pendampingan."
      icon={Trophy}
    >
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/workspace/umkm/assessment')}
          className="rounded-xl gap-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={18} />
          Kembali ke Assessment
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.open(`/id/document/assessment/${data.id}`, '_blank')}
          className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold"
        >
          <Download size={16} />
          Unduh Hasil (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Score Card */}
        <Card className="lg:col-span-1 border-primary/20 shadow-xl rounded-3xl bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={120} />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-white/80 uppercase tracking-widest text-xs font-bold">Skor Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="text-7xl font-black">{data.total_score}</div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{data.level}</div>
              <p className="text-white/70 text-sm italic">Maturity Level berdasarkan Standar Mango</p>
            </div>
            <Badge className="bg-white/20 text-white border-transparent py-1 px-3">
              Terverifikasi Otomatis
            </Badge>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="lg:col-span-2 border-border/50 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-primary flex items-center gap-2">
              <TrendingUp className="text-accent" />
              Visualisasi Dimensi Kematangan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {data.chart_data && <MaturityChart data={data.chart_data} size={300} />}
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card className="lg:col-span-3 border-border/50 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="text-accent" />
              Rekomendasi Intervensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recommendations?.map((rec: any) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className={`p-2 rounded-full shrink-0 ${
                  rec.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase tracking-tight text-primary">
                      {rec.category?.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Gap: {rec.gap_score}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {rec.recommendation_text}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="lg:col-span-3 border-border/50 shadow-sm rounded-3xl bg-accent/5 border-dashed border-accent/30">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
                <MessageSquarePlus />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Butuh Pendampingan Lebih Lanjut?</h3>
                <p className="text-muted-foreground">Ajukan permohonan konsultasi dengan Advisor ahli kami sesuai rekomendasi di atas.</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/workspace/umkm/mentoring')}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 rounded-2xl gap-2 shadow-xl shadow-primary/20"
            >
              Ajukan Mentoring Sekarang
              <ArrowRight size={20} />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
