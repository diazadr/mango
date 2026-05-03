"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Building2,
  UserCheck,
  ChevronLeft,
  Calendar,
  FileText,
  MapPin,
  ArrowRight,
  Loader2,
  Activity,
  History
} from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function MentoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/mentoring/requests/${params.id}`)
      .then((res) => setRequest(res.data.data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Menghubungkan data proses...</p>
      </div>
    );
  }

  if (!request) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/10 text-warning border-warning/20 font-black uppercase text-[10px]">Menunggu Delegasi</Badge>;
      case 'assigned': return <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[10px]">Telah Didelegasikan</Badge>;
      case 'ongoing': return <Badge className="bg-success/10 text-success border-success/20 font-black uppercase text-[10px] animate-pulse">Proses Berjalan</Badge>;
      case 'done': return <Badge className="bg-muted text-muted-foreground border-border font-black uppercase text-[10px]">Selesai</Badge>;
      default: return <Badge className="font-black uppercase text-[10px]">{status}</Badge>;
    }
  };

  const steps = [
    { 
      id: 'pending', 
      label: 'Pengajuan', 
      desc: 'Permohonan dikirim oleh UMKM', 
      date: request.created_at,
      isDone: true 
    },
    { 
      id: 'assigned_dept', 
      label: 'Delegasi Unit', 
      desc: request.department ? `Diterima oleh ${request.department.name}` : 'Menunggu pemilihan departemen', 
      date: request.updated_at,
      isDone: !!request.department 
    },
    { 
      id: 'assigned_mentor', 
      label: 'Penunjukan Advisor', 
      desc: request.assignments?.[0] ? `Ditangani oleh ${request.assignments[0].mentor?.name}` : 'Menunggu penunjukan ahli', 
      date: request.assignments?.[0]?.created_at,
      isDone: request.assignments?.length > 0 
    },
    { 
      id: 'ongoing', 
      label: 'Konsultasi Aktif', 
      desc: request.sessions?.length > 0 ? `${request.sessions.length} Sesi Terjadwal` : 'Menunggu jadwal pertemuan', 
      date: request.sessions?.[0]?.created_at,
      isDone: request.status === 'ongoing' || request.status === 'done' 
    },
    { 
      id: 'done', 
      label: 'Selesai', 
      desc: 'Masalah terselesaikan / Sesi berakhir', 
      date: request.status === 'done' ? request.updated_at : null,
      isDone: request.status === 'done' 
    },
  ];

  return (
    <DashboardPageShell
      title="Detail Proses Pendampingan"
      subtitle={`Tracing status dan progres penyelesaian masalah bisnis.`}
      icon={Activity}
    >
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="rounded-xl gap-2 text-muted-foreground hover:text-primary px-0"
        >
          <ChevronLeft size={18} />
          Kembali ke Daftar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
              <CardTitle className="text-base font-bold text-primary uppercase tracking-tight flex items-center gap-2">
                <History size={18} className="text-primary" /> Alur Progres
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-10 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-muted" />
                {steps.map((step, idx) => (
                  <div key={step.id} className="relative pl-10">
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-colors ${
                      step.isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {step.isDone ? <CheckCircle2 size={12} /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-black uppercase tracking-tight ${step.isDone ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                        {step.desc}
                      </p>
                      {step.date && (
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {format(new Date(step.date), "dd MMM yyyy, HH:mm", { locale: localeId })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Information Detail */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Topik Permasalahan</p>
                  <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight">
                    {request.topic}
                  </CardTitle>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
              <div className="p-6 bg-muted/30 rounded-2xl border border-dashed border-border/50">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Deskripsi Kendala</p>
                <p className="text-sm font-medium text-foreground leading-relaxed italic">
                  "{request.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Unit Pendamping</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground uppercase">{request.department?.name || "Belum Ditentukan"}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Polman Bandung</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Advisor Penanggung Jawab</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground uppercase">{request.assignments?.[0]?.mentor?.name || "Menunggu Delegasi"}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Dosen / Staf Ahli</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">UMKM Pengaju</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground uppercase">{request.umkm?.name || "—"}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Pemilik: {request.umkm?.owner_name || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Jadwal Sesi</p>
                    {request.sessions?.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground uppercase">Sesi Terdekat</p>
                          <p className="text-[10px] font-bold text-success uppercase">
                            {format(new Date(request.sessions[0].scheduled_at), "dd MMMM yyyy", { locale: localeId })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 opacity-50">
                        <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase italic tracking-tight">Belum ada jadwal</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          {request.sessions?.length > 0 && (
            <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-muted/10 border-b border-border/50 p-6">
                <CardTitle className="text-base font-bold text-primary uppercase tracking-tight flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> Log Konsultasi & Catatan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {request.sessions.map((session: any) => (
                    <div key={session.id} className="p-6 space-y-4 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-background border text-primary">
                            <Clock size={14} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-tight text-foreground">
                            {format(new Date(session.scheduled_at), "eeee, dd MMM yyyy", { locale: localeId })}
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase">{session.medium}</Badge>
                        </div>
                        <Badge className={session.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                          {session.status}
                        </Badge>
                      </div>
                      
                      {session.notes?.length > 0 ? (
                        <div className="ml-10 space-y-3">
                          {session.notes.map((note: any) => (
                            <div key={note.id} className="bg-background rounded-xl p-4 border border-border/50 shadow-sm">
                              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{note.content}"</p>
                              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-primary uppercase">
                                <UserCheck size={10} /> {note.author?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="ml-10 text-xs font-medium text-muted-foreground italic">Belum ada catatan untuk sesi ini.</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
 );
}
