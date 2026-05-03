"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  MessageSquare,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

export default function MachineApprovalPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);
    
    const [approvalForm, setApprovalForm] = useState({
        action: "approve",
        comment: ""
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/v1/machines/reservations/incoming");
            setRequests(res.data.data || res.data);
        } catch (err) {
            console.error("Gagal mengambil data permintaan masuk:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            await api.post(`/v1/machines/reservations/${selectedRequest.id}/approve`, approvalForm);
            setStatus({ 
                type: "success", 
                message: `Reservation ${approvalForm.action === 'approve' ? 'approved' : 'rejected'} successfully.` 
            });
            setApprovalDialogOpen(false);
            setApprovalForm({ action: "approve", comment: "" });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to process decision." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Menghubungkan ke server antrean...</p>
        </div>
    );

    return (
        <DashboardPageShell
            title="Pusat Persetujuan"
            subtitle="Kelola permintaan peminjaman mesin yang masuk ke aset Anda."
            icon={ShieldCheck}
        >
            <div className="space-y-6">
                {status && (
                    <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="flex items-center justify-between">
                            {status.message}
                            <button onClick={() => setStatus(null)} className="ml-4">
                                <X size={16} className="opacity-50 hover:opacity-100" />
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl">
                        <AlertCircle className="mx-auto mb-4 text-muted-foreground opacity-30" size={40} />
                        <h3 className="text-lg font-bold text-primary uppercase tracking-tight">Tidak Ada Permintaan Masuk</h3>
                        <p className="text-sm font-medium text-muted-foreground">Permintaan pinjam mesin dari UMKM lain akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {requests.map((req) => (
                            <Card key={req.id} className="rounded-3xl border border-border/50 shadow-sm overflow-hidden bg-white hover:border-primary/30 transition-all group">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-wider">Permintaan Masuk</Badge>
                                                <CardTitle className="text-xl font-extrabold text-primary">{req.machine?.name}</CardTitle>
                                            </div>
                                            <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'approved' ? 'default' : 'destructive'} className="rounded-lg font-black uppercase text-[9px]">
                                                {req.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Building2 size={16} className="text-primary" />
                                                    <span className="font-bold text-foreground">{req.requester_umkm?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User size={16} />
                                                    <span className="text-xs font-medium">PIC: {req.requester_user?.name}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-medium">Mulai: {new Date(req.start_time).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock size={16} />
                                                    <span className="text-xs font-medium">Selesai: {new Date(req.end_time).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-border/50">
                                            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tujuan Penggunaan</Label>
                                            <p className="text-sm font-medium italic mt-1 text-foreground/80 leading-relaxed">"{req.purpose}"</p>
                                        </div>
                                    </div>

                                    {req.status === 'pending' && (
                                        <div className="bg-muted/10 p-6 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l w-full md:w-56">
                                            <Button 
                                                className="w-full rounded-xl gap-2 bg-success hover:bg-emerald-600 font-bold h-11 shadow-lg shadow-success/20"
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setApprovalForm({ ...approvalForm, action: "approve" });
                                                    setApprovalDialogOpen(true);
                                                }}
                                            >
                                                <CheckCircle2 size={16} /> Setujui
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-full rounded-xl gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold h-11"
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setApprovalForm({ ...approvalForm, action: "reject" });
                                                    setApprovalDialogOpen(true);
                                                }}
                                            >
                                                <XCircle size={16} /> Tolak
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Approval Dialog */}
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-muted/30 border-b p-8">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">
                            {approvalForm.action === 'approve' ? 'Konfirmasi Setuju' : 'Konfirmasi Tolak'}
                        </DialogTitle>
                        <DialogDescription className="font-medium">
                            Permintaan dari <span className="text-primary font-bold">{selectedRequest?.requester_umkm?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApproval} className="p-8 space-y-5">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Komentar / Alasan (Opsional)</Label>
                            <Textarea 
                                value={approvalForm.comment}
                                onChange={(e) => setApprovalForm({...approvalForm, comment: e.target.value})}
                                placeholder={approvalForm.action === 'approve' ? "Berikan pesan penyambutan atau instruksi..." : "Sebutkan alasan penolakan agar pemohon dapat memperbaiki..."}
                                className="rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all resize-none h-32"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={submitting} 
                                className={`w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 shadow-lg ${
                                    approvalForm.action === 'approve' ? 'bg-success hover:bg-emerald-600 shadow-success/20' : 'bg-destructive hover:bg-red-600 shadow-destructive/20'
                                }`}
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (approvalForm.action === 'approve' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />)}
                                {approvalForm.action === 'approve' ? 'Kirim Persetujuan' : 'Kirim Penolakan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPageShell>
    );
}
