"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, 
  Briefcase,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  MoreVertical,
  Paperclip,
  StickyNote,
  Send,
  User,
  Layout,
  AlertCircle,
  Save,
  FileText,
  Download,
  X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog";

export default function ProjectDetailPage({ type: initialType }: { type?: 'umkm' | 'advisor' }) {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    
    // Determine type from props or URL path
    const type = initialType || (pathname.includes('/workspace/advisor') ? 'advisor' : 'umkm');

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [submittingNote, setSubmittingNote] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    // Iteration & Action Plan States
    const [isIterationDialogOpen, setIsIterationDialogOpen] = useState(false);
    const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
    const [selectedIterationId, setSelectedIterationId] = useState<number | null>(null);
    const [selectedActionPlanId, setSelectedActionPlanId] = useState<number | null>(null);
    const [isDeliverableDialogOpen, setIsDeliverableDialogOpen] = useState(false);
    const [deliverableForm, setDeliverableForm] = useState({ title: "", description: "", url: "" });
    const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
    const [iterationForm, setIterationForm] = useState({ name: "", order: 1 });
    const [actionPlanForm, setActionPlanForm] = useState({ title: "", description: "", due_date: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/v1/projects/${params.id}`);
            setProject(res.data.data || res.data);
        } catch (err) {
            console.error("Gagal mengambil detail proyek:", err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setSubmittingNote(true);
        setStatus(null);
        try {
            await api.post(`/v1/projects/${project.id}/notes`, { content: newNote });
            setNewNote("");
            setStatus({ type: "success", message: "Note added successfully." });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to add note." });
        } finally {
            setSubmittingNote(false);
        }
    };

    const toggleActionPlanStatus = async (plan: any) => {
        setStatus(null);
        try {
            const newStatus = plan.status === 'done' ? 'todo' : 'done';
            await api.put(`/v1/action-plans/${plan.id}`, { status: newStatus });
            setStatus({ type: "success", message: "Task status updated." });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to update status." });
        }
    };

    const handleCreateIteration = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post(`/v1/projects/${params.id}/iterations`, {
                ...iterationForm,
                status: 'planned'
            });
            setIsIterationDialogOpen(false);
            setIterationForm({ name: "", order: (project?.iterations?.length || 0) + 1 });
            fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateActionPlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIterationId) return;
        setIsSubmitting(true);
        setStatus(null);
        console.log("Creating action plan for iteration:", selectedIterationId, actionPlanForm);
        try {
            const res = await api.post(`/v1/iterations/${selectedIterationId}/action-plans`, {
                ...actionPlanForm,
                status: 'todo'
            });
            console.log("Action plan created successfully:", res.data);
            setIsActionPlanDialogOpen(false);
            setActionPlanForm({ title: "", description: "", due_date: "" });
            fetchData();
            setStatus({ type: "success", message: "Tugas baru berhasil ditambahkan." });
        } catch (err: any) {
            console.error("Error creating action plan:", err);
            setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menambahkan tugas." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitDeliverable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActionPlanId) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', deliverableForm.title);
        formData.append('description', deliverableForm.description);
        formData.append('url', deliverableForm.url);
        if (deliverableFile) {
            formData.append('file', deliverableFile);
        }

        try {
            await api.post(`/v1/action-plans/${selectedActionPlanId}/deliverables`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsDeliverableDialogOpen(false);
            setDeliverableForm({ title: "", description: "", url: "" });
            setDeliverableFile(null);
            fetchData();
            setStatus({ type: "success", message: "Laporan berhasil dikirim." });
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal mengirim laporan." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProjectStatus = async (newStatus: string) => {
        try {
            await api.put(`/v1/projects/${params.id}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const calculateProgress = () => {
        if (!project?.iterations || project.iterations.length === 0) return 0;
        let total = 0;
        let done = 0;
        project.iterations.forEach((it: any) => {
            const plans = it.action_plans || it.actionPlans; // Handle both just in case
            plans?.forEach((ap: any) => {
                total++;
                if (ap.status === 'done') done++;
            });
        });
        return total === 0 ? 0 : Math.round((done / total) * 100);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Sinkronisasi detail proyek...</p>
        </div>
    );

    if (!project) return (
        <DashboardPageShell title="Project Not Found" subtitle="Error 404" icon={Briefcase}>
            <div className="py-20 text-center space-y-4">
                <AlertCircle size={48} className="mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium">Proyek tidak ditemukan atau Anda tidak memiliki izin akses.</p>
                <Button onClick={() => router.back()} variant="outline">Kembali ke Daftar</Button>
            </div>
        </DashboardPageShell>
    );

    return (
        <DashboardPageShell
            title={project.name}
            subtitle={`Proyek ${project.type} - Progress Implementasi`}
            icon={Briefcase}
            actions={
                type === 'advisor' && (
                    <div className="flex gap-2">
                         {project.status !== 'completed' ? (
                            <Button 
                                className="bg-green-600 hover:bg-green-700 rounded-xl gap-2 font-bold"
                                onClick={() => handleUpdateProjectStatus('completed')}
                            >
                                <CheckCircle2 size={18} /> Selesaikan Proyek
                            </Button>
                         ) : (
                            <Button 
                                variant="outline"
                                className="rounded-xl gap-2 font-bold"
                                onClick={() => handleUpdateProjectStatus('active')}
                            >
                                <Clock size={18} /> Re-aktifkan Proyek
                            </Button>
                         )}
                         <Button className="rounded-xl gap-2 font-bold" onClick={() => setIsIterationDialogOpen(true)}>
                            <Plus size={18} /> Tambah Tahapan
                        </Button>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                    <ChevronLeft size={16} /> Kembali ke Daftar
                </Button>

                {/* Progress Bar */}
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Progress Keseluruhan</p>
                                <h3 className="text-2xl font-black text-primary">{calculateProgress()}%</h3>
                            </div>
                            <Badge variant="outline" className={`rounded-lg font-black uppercase text-[10px] ${getStatusColor(project.status)}`}>
                                Status: {project.status}
                            </Badge>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                                style={{ width: `${calculateProgress()}%` }}
                            />
                        </div>
                    </div>
                </Card>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Progress & Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Iterations (Tahapan) */}
                        {project.iterations?.length === 0 ? (
                            <Card className="border-dashed border-2 bg-muted/10 py-10 text-center rounded-3xl">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Belum ada tahapan aksi dalam proyek ini.</p>
                            </Card>
                        ) : (
                            project.iterations?.map((iteration: any, index: number) => (
                                <section key={iteration.id} className="space-y-4">
                                    <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{iteration.name}</h3>
                                                <p className="text-xs text-muted-foreground capitalize">{iteration.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="rounded-lg font-bold">
                                                {(iteration.action_plans || iteration.actionPlans)?.filter((p: any) => p.status === 'done').length || 0} / {(iteration.action_plans || iteration.actionPlans)?.length || 0} Tugas
                                            </Badge>
                                            {type === 'advisor' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => {
                                                        setSelectedIterationId(iteration.id);
                                                        setIsActionPlanDialogOpen(true);
                                                    }}
                                                >
                                                    <Plus size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-dashed border-primary/20 ml-5">
                                        {(iteration.action_plans || iteration.actionPlans)?.map((plan: any) => (
                                            <div 
                                                key={plan.id} 
                                                className="flex items-start gap-3 p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                                            >
                                                <button 
                                                    onClick={() => toggleActionPlanStatus(plan)}
                                                    className={`mt-0.5 rounded-full transition-colors ${plan.status === 'done' ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                                                >
                                                    {plan.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                                <div className="flex-1 space-y-1">
                                                    <p className={`font-bold text-sm ${plan.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                        {plan.title}
                                                    </p>
                                                    {plan.description && <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>}
                                                    
                                                    {/* Deliverables Display */}
                                                    {plan.deliverables?.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <p className="text-[9px] font-black uppercase text-primary/60 tracking-wider">Laporan/Output:</p>
                                                            {plan.deliverables.map((d: any) => (
                                                                <div key={d.id} className="flex items-center justify-between p-2 bg-primary/5 rounded-xl border border-primary/10">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <FileText size={14} className="text-primary shrink-0" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-bold truncate">{d.title}</p>
                                                                            {d.description && <p className="text-[10px] text-muted-foreground truncate">{d.description}</p>}
                                                                        </div>
                                                                    </div>
                                                                    {d.file_path && (
                                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg" asChild>
                                                                            <a href={`http://localhost:8000/storage/${d.file_path}`} target="_blank" rel="noopener noreferrer">
                                                                                <Download size={14} />
                                                                            </a>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-4 pt-1">
                                                        {plan.due_date && (
                                                            <span className="text-[10px] font-black uppercase flex items-center gap-1 text-muted-foreground">
                                                                <Calendar size={10} className="text-primary" /> {new Date(plan.due_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {type === 'umkm' && plan.status !== 'done' && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="h-7 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                                                                onClick={() => {
                                                                    setSelectedActionPlanId(plan.id); 
                                                                    setIsDeliverableDialogOpen(true);
                                                                }}
                                                            >
                                                                <Plus size={12} /> Kirim Laporan
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>

                    {/* Right Column: Project Notes & Stakeholders */}
                    <div className="space-y-6">
                        <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-muted/30 border-b p-6">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <StickyNote size={16} className="text-primary" /> Catatan Proyek
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[400px] overflow-y-auto scrollbar-none">
                                {project.notes?.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground italic text-xs">Belum ada catatan.</div>
                                ) : (
                                    <div className="divide-y border-border/50">
                                        {project.notes?.map((note: any) => (
                                            <div key={note.id} className="p-4 space-y-2">
                                                <p className="text-sm text-foreground leading-relaxed font-medium">{note.content}</p>
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground">
                                                    <span>{note.user?.name}</span>
                                                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-4 border-t bg-muted/10">
                                <form onSubmit={handleAddNote} className="w-full relative">
                                    <Input 
                                        placeholder={type === 'umkm' ? "Tulis feedback Anda..." : "Tambah catatan..."}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="h-10 rounded-xl pr-10 text-xs font-bold bg-white border-transparent focus:border-primary/20"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={submittingNote || !newNote.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform disabled:opacity-30"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Deliverable Dialog */}
            <Dialog open={isDeliverableDialogOpen} onOpenChange={setIsDeliverableDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-muted/30 p-8 border-b">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Kirim Laporan Tugas</DialogTitle>
                        <DialogDescription className="font-medium">Unggah laporan atau berikan tautan hasil kerja Anda.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitDeliverable}>
                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Judul Laporan</Label>
                                <Input 
                                    value={deliverableForm.title}
                                    onChange={e => setDeliverableForm({...deliverableForm, title: e.target.value})}
                                    placeholder="Contoh: Laporan Survey Pasar"
                                    required
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deskripsi Singkat</Label>
                                <Textarea 
                                    value={deliverableForm.description}
                                    onChange={e => setDeliverableForm({...deliverableForm, description: e.target.value})}
                                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unggah File (PDF/Gambar)</Label>
                                <Input 
                                    type="file"
                                    onChange={e => setDeliverableFile(e.target.files?.[0] || null)}
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Atau Link Eksternal</Label>
                                <Input 
                                    value={deliverableForm.url}
                                    onChange={e => setDeliverableForm({...deliverableForm, url: e.target.value})}
                                    placeholder="https://..."
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-0">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-primary shadow-lg shadow-primary/20">
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
                                Kirim Laporan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Iteration Dialog */}
            <Dialog open={isIterationDialogOpen} onOpenChange={setIsIterationDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none">
                    <DialogHeader className="bg-muted/30 p-8 border-b">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Tambah Tahapan Aksi</DialogTitle>
                        <DialogDescription className="font-medium">Gunakan tahapan untuk membagi proyek menjadi beberapa fase.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateIteration}>
                        <div className="p-8 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Tahapan</Label>
                                <Input 
                                    value={iterationForm.name}
                                    onChange={e => setIterationForm({...iterationForm, name: e.target.value})}
                                    placeholder="Contoh: Analisis Kebutuhan"
                                    required
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-0">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-primary shadow-lg shadow-primary/20">
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                                Simpan Tahapan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Action Plan Dialog */}
            <Dialog open={isActionPlanDialogOpen} onOpenChange={setIsActionPlanDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-muted/30 p-8 border-b">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Tambah Tugas Baru</DialogTitle>
                        <DialogDescription className="font-medium">Detail langkah kerja yang harus dilakukan dalam tahapan ini.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateActionPlan}>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Judul Tugas</Label>
                                <Input 
                                    value={actionPlanForm.title}
                                    onChange={e => setActionPlanForm({...actionPlanForm, title: e.target.value})}
                                    placeholder="Apa yang perlu dilakukan?"
                                    required
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deskripsi (Opsional)</Label>
                                <Textarea 
                                    value={actionPlanForm.description}
                                    onChange={e => setActionPlanForm({...actionPlanForm, description: e.target.value})}
                                    className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tenggat Waktu</Label>
                                <Input 
                                    type="date"
                                    value={actionPlanForm.due_date}
                                    onChange={e => setActionPlanForm({...actionPlanForm, due_date: e.target.value})}
                                    className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-0">
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-primary shadow-lg shadow-primary/20">
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={16} />}
                                Tambahkan Tugas
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPageShell>
    );
}
