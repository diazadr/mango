"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { 
  GraduationCap, 
  MessageSquare, 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  Building2,
  ChevronLeft,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Video,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useParams } from "next/navigation";
import { useRouter } from "@/src/i18n/navigation";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function AdvisorMentoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [submittingSession, setSubmittingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    scheduled_at: "",
    duration_minutes: "60",
    medium: "online"
  });

  const [activeSession, setActiveSession] = useState<any>(null);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/mentoring/requests/${params.id}`);
      setRequest(res.data.data);
      
      // Cari sesi yang aktif atau terjadwal paling dekat
      if (res.data.data.sessions?.length > 0) {
        const sorted = [...res.data.data.sessions].sort((a, b) => 
          new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        );
        setActiveSession(sorted[0]);
      }
    } catch (err) {
      console.error("Gagal mengambil detail mentoring:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSession(true);
    try {
      await api.post(`/v1/mentoring/requests/${params.id}/sessions`, sessionForm);
      setSessionDialogOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal membuat sesi.");
    } finally {
      setSubmittingSession(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !noteContent.trim()) return;
    setSubmittingNote(true);
    try {
      await api.post(`/v1/mentoring/sessions/${activeSession.id}/notes`, { content: noteContent });
      setNoteContent("");
      fetchData();
    } catch (err) {
      alert("Gagal menambahkan catatan.");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCompleteRequest = async () => {
    if (!confirm("Selesaikan permintaan mentoring ini?")) return;
    try {
      await api.post(`/v1/mentoring/requests/${params.id}/complete`);
      fetchData();
    } catch (err) {
      alert("Gagal menyelesaikan permintaan.");
    }
  };

  if (loading) return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (!request) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  return (
    <DashboardPageShell
      title="Sesi Mentoring"
      subtitle={`Topik: ${request.topic}`}
      icon={GraduationCap}
    >
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
          <ChevronLeft size={16} /> Kembali
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-none shadow-md overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{request.umkm?.name}</CardTitle>
                      <CardDescription>Permintaan oleh: {request.requested_by_user?.name}</CardDescription>
                    </div>
                  </div>
                  <Badge className="capitalize px-4 py-1 rounded-full">{request.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Deskripsi Masalah</Label>
                  <p className="mt-1 text-foreground/80 leading-relaxed">{request.description}</p>
                </div>
                
                <div className="flex gap-4 pt-4 border-t">
                  <Button className="gap-2 rounded-xl" onClick={() => setSessionDialogOpen(true)}>
                    <Calendar size={18} /> Jadwalkan Sesi Baru
                  </Button>
                  {request.status !== 'done' && (
                    <Button variant="outline" className="gap-2 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleCompleteRequest}>
                      <CheckCircle2 size={18} /> Tandai Selesai
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session History & Notes */}
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Riwayat Sesi & Catatan
              </h3>

              {request.sessions?.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 border-2 border-dashed rounded-3xl">
                  <p className="text-muted-foreground">Belum ada sesi yang dijadwalkan.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {request.sessions.map((session: any) => (
                    <Card key={session.id} className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                      <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Calendar size={14} />
                            {new Date(session.scheduled_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock size={14} />
                            {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <Badge variant="secondary" className="gap-1 rounded-md">
                            {session.medium === 'online' ? <Video size={12} /> : <Users size={12} />}
                            {session.medium}
                          </Badge>
                        </div>
                        <Badge className={session.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
                          {session.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-4">
                        {/* Notes for this session */}
                        <div className="space-y-3">
                          {session.notes?.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Belum ada catatan untuk sesi ini.</p>
                          ) : (
                            session.notes.map((note: any) => (
                              <div key={note.id} className="bg-primary/5 p-3 rounded-xl space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-primary">
                                  <span>{note.author?.name}</span>
                                  <span className="text-muted-foreground font-normal">{new Date(note.created_at).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm">{note.content}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {session.status !== 'cancelled' && (
                          <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                            <Input 
                              placeholder="Tambah catatan diskusi..." 
                              className="rounded-xl"
                              value={activeSession?.id === session.id ? noteContent : ""}
                              onChange={(e) => {
                                setActiveSession(session);
                                setNoteContent(e.target.value);
                              }}
                            />
                            <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={submittingNote}>
                              <Send size={16} />
                            </Button>
                          </form>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: UMKM Context */}
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-md border-none bg-primary text-white">
              <CardHeader>
                <CardTitle className="text-lg">Konteks UMKM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] opacity-70 uppercase font-bold">Sektor</p>
                  <p className="font-bold">{request.umkm?.sector}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase font-bold">Pemilik</p>
                  <p className="font-bold">{request.umkm?.owner_name}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase font-bold">Karyawan</p>
                  <p className="font-bold">{request.umkm?.employee_count} Orang</p>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full rounded-xl bg-white/10 hover:bg-white/20 border-none text-white gap-2"
                  onClick={() => router.push(`/workspace/advisor/umkm/${request.umkm?.id}`)}
                >
                  <User size={16} /> Lihat Profil Lengkap
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-dashed border-2 bg-transparent">
              <CardHeader>
                <CardTitle className="text-sm">Link Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-xl h-auto py-3"
                  onClick={() => router.push('/workspace/advisor/projects')}
                >
                  <Plus className="text-primary" size={18} />
                  <div className="text-left">
                    <p className="text-sm font-bold">Buat Proyek Aktif</p>
                    <p className="text-[10px] text-muted-foreground">Inisiasi rencana aksi implementasi</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan Sesi Mentoring</DialogTitle>
            <DialogDescription>Tentukan waktu dan media konsultasi dengan mitra UMKM.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Waktu Pelaksanaan</Label>
              <Input 
                id="scheduled_at" 
                type="datetime-local" 
                required 
                value={sessionForm.scheduled_at}
                onChange={e => setSessionForm({...sessionForm, scheduled_at: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Menit)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  required 
                  value={sessionForm.duration_minutes}
                  onChange={e => setSessionForm({...sessionForm, duration_minutes: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medium">Media</Label>
                <Select 
                  value={sessionForm.medium} 
                  onValueChange={v => setSessionForm({...sessionForm, medium: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Media" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online (Video Call)</SelectItem>
                    <SelectItem value="offline">Offline (Tatap Muka)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submittingSession} className="gap-2 rounded-xl">
                {submittingSession ? <Loader2 className="animate-spin" size={16} /> : <Calendar size={16} />}
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}
