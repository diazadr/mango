"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, 
  Briefcase,
  Plus,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Building2,
  X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useRouter, usePathname } from "@/src/i18n/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function ProjectListPage({ type: initialType }: { type?: 'umkm' | 'advisor' }) {
    const router = useRouter();
    const pathname = usePathname();
    
    // Determine type from props or URL path
    const type = initialType || (pathname.includes('/workspace/advisor') ? 'advisor' : 'umkm');

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [umkmId, setUmkmId] = useState<number | null>(null);
    
    // Create Project State
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);
    const [umkms, setUmkms] = useState<any[]>([]);
    const [projectForm, setProjectForm] = useState({
        name: "",
        type: "advisory",
        umkm_id: "",
        status: "active",
        started_at: "",
        ended_at: ""
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = "/v1/projects";
            
            if (type === 'umkm') {
                const userRes = await api.get("/v1/me");
                const userData = userRes.data.data?.user || userRes.data.user;
                if (userData?.umkm) {
                    setUmkmId(userData.umkm.id);
                    url += `?umkm_id=${userData.umkm.id}`;
                }
            } else if (type === 'advisor') {
                // Fetch UMKM list for selection
                const umkmRes = await api.get("/v1/umkm");
                // Handle both array and paginated response
                const fetchedUmkms = umkmRes.data.data?.data || umkmRes.data.data || [];
                setUmkms(fetchedUmkms);
            }
            
            const res = await api.get(url);
            // Handle both array and paginated response for projects
            const fetchedProjects = res.data.data?.data || res.data.data || res.data;
            setProjects(fetchedProjects);
        } catch (err) {
            console.error("Gagal mengambil data proyek:", err);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);

        // Prepare payload, ensuring nullable fields are null if empty
        const payload = {
            ...projectForm,
            assessment_result_id: null, // Default for now
            started_at: projectForm.started_at || null,
            ended_at: projectForm.ended_at || null,
        };

        try {
            await api.post("/v1/projects", payload);
            setStatus({ type: "success", message: "Project initiated successfully." });
            setCreateDialogOpen(false);
            setProjectForm({
                name: "",
                type: "advisory",
                umkm_id: "",
                status: "active",
                started_at: "",
                ended_at: ""
            });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to initiate project." });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-primary/10 text-primary border-primary/20';
            case 'completed': return 'bg-success/10 text-success border-success/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground">Memuat daftar proyek...</p>
        </div>
    );

    return (
        <DashboardPageShell
            title="Proyek Pendampingan"
            subtitle="Kelola rencana aksi dan implementasi solusi bisnis."
            icon={Briefcase}
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

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Daftar Proyek</h2>
                    {type === 'advisor' && (
                        <Button className="gap-2 rounded-xl" onClick={() => setCreateDialogOpen(true)}>
                            <Plus size={18} /> Buat Proyek Baru
                        </Button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/10 py-20 text-center">
                        <CardContent className="space-y-4">
                            <Briefcase size={48} className="mx-auto text-muted-foreground opacity-30" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Belum ada proyek yang berjalan.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Card 
                                key={project.id} 
                                className="border-border/50 shadow-sm rounded-3xl hover:border-primary/30 transition-all group cursor-pointer bg-white overflow-hidden"
                                onClick={() => router.push(`/workspace/${type}/projects/${project.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge className={`rounded-lg font-black uppercase text-[9px] ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </Badge>
                                        <div className="p-2 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Briefcase size={18} />
                                        </div>
                                    </div>
                                    <h3 className="font-extrabold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Building2 size={14} className="text-primary" /> {project.umkm?.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Calendar size={14} className="text-primary" /> {new Date(project.started_at).toLocaleDateString()} - {new Date(project.ended_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-dashed flex justify-between items-center text-primary font-black uppercase text-[10px] tracking-widest">
                                        Detail Proyek <ChevronRight size={14} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Project Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="bg-muted/30 border-b p-8">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Inisiasi Proyek Baru</DialogTitle>
                            <DialogDescription className="font-medium">
                                Buat proyek pendampingan aktif untuk mitra UMKM.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateProject}>
                            <CardContent className="p-8 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Proyek</Label>
                                    <Input 
                                        value={projectForm.name}
                                        onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                                        className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mitra UMKM</Label>
                                    <Select 
                                        value={projectForm.umkm_id} 
                                        onValueChange={(val) => setProjectForm({...projectForm, umkm_id: val})}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all">
                                            <SelectValue placeholder="Pilih UMKM" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {umkms.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tanggal Mulai</Label>
                                        <Input 
                                            type="date" 
                                            value={projectForm.started_at}
                                            onChange={(e) => setProjectForm({...projectForm, started_at: e.target.value})}
                                            className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Selesai</Label>
                                        <Input 
                                            type="date" 
                                            value={projectForm.ended_at}
                                            onChange={(e) => setProjectForm({...projectForm, ended_at: e.target.value})}
                                            className="h-11 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all" 
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <DialogFooter className="p-8 pt-0">
                                <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest gap-2 bg-primary shadow-lg shadow-primary/20">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Buat Proyek
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardPageShell>
    );
}
