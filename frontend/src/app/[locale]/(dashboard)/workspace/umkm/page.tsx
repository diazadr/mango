"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Store, Plus, Trash2, Pencil, Loader2, Search, 
  X, User as UserIcon, Calendar, Users as UsersIcon,
  ExternalLink,
  CheckCircle,
  Activity
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { AdminToolbar, AdminSearchFilter, AdminIconButton } from "@/src/components/ui/dashboard/AdminDataView";
import UmkmAssessmentDetail from "./components/UmkmAssessmentDetail";

export default function UmkmPage() {
    const [umkmList, setUmkmList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailUmkmId, setDetailUmkmId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        is_joining_organization: true,
        umkm_organization_id: "",
        name: "",
        owner_name: "",
        sector: "Kuliner",
        nib: "",
        established_year: new Date().getFullYear(),
        employee_count: 0,
        is_active: true
    };

    const [formData, setFormData] = useState<any>(initialFormData);

    const API_URL = "/v1/umkm";

    const fetchUmkm = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(API_URL);
            setUmkmList(res.data.data || res.data);
        } catch (err) {
            console.error("Gagal sinkronisasi data UMKM.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUmkm(); }, [fetchUmkm]);

    const openModal = (umkm: any = null) => {
        if (umkm) {
            setEditingId(umkm.id);
            setFormData({ 
                umkm_organization_id: umkm.umkm_organization_id || umkm.organization?.id || "",
                is_joining_organization: !!(umkm.umkm_organization_id || umkm.organization?.id),
                name: umkm.name, 
                owner_name: umkm.owner_name || "", 
                sector: umkm.sector || "Kuliner",
                nib: umkm.nib || "",
                established_year: umkm.established_year || 2024,
                employee_count: umkm.employee_count || 0,
                is_active: !!umkm.is_active 
            });
        } else {
            setEditingId(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                umkm_organization_id: formData.is_joining_organization ? formData.umkm_organization_id : null,
                established_year: parseInt(formData.established_year.toString()),
                employee_count: parseInt(formData.employee_count.toString()),
            };

            if (editingId) {
                await api.put(`${API_URL}/${editingId}`, payload);
            } else {
                await api.post(API_URL, payload);
            }
            setIsModalOpen(false);
            fetchUmkm();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Gagal menyimpan data UMKM.";
            alert(`Gagal: ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteUmkm = async (id: number) => {
        if (!confirm("Hapus unit UMKM ini secara permanen?")) return;
        try {
            await api.delete(`${API_URL}/${id}`);
            fetchUmkm();
        } catch (err) { alert("Gagal menghapus UMKM."); }
    };

    const filteredUmkm = umkmList.filter((u: any) => 
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.owner_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardPageShell
            title="Registry UMKM"
            subtitle="Manajemen unit usaha, pemilik, dan status operasional dalam ekosistem."
            icon={Store}
            actions={
                <Button onClick={() => openModal()} className="gap-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                    <Plus size={18} /> Daftarkan UMKM
                </Button>
            }
        >
            <div className="space-y-6">
                <AdminToolbar>
                    <AdminSearchFilter
                        placeholder="Cari UMKM atau Pemilik..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:w-80"
                    />
                </AdminToolbar>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-sm font-medium text-muted-foreground">Memuat data registry...</p>
                    </div>
                ) : filteredUmkm.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl">
                        <p className="text-muted-foreground font-medium">Data UMKM tidak ditemukan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUmkm.map((umkm: any) => (
                            <Card key={umkm.id} className="border-border/50 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={umkm.is_active ? "default" : "secondary"} className="rounded-md text-[10px] font-bold uppercase tracking-tight">
                                            {umkm.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AdminIconButton onClick={() => openModal(umkm)} title="Edit">
                                                <Pencil size={14} />
                                            </AdminIconButton>
                                            <AdminIconButton onClick={() => deleteUmkm(umkm.id)} tone="destructive" title="Hapus">
                                                <Trash2 size={14} />
                                            </AdminIconButton>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <CardTitle className="text-xl font-bold text-primary uppercase tracking-tight">{umkm.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 font-semibold text-muted-foreground uppercase text-[10px] tracking-widest mt-1">
                                            <UserIcon size={12} className="text-primary" /> {umkm.owner_name}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Tahun Berdiri</p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                                <Calendar size={14} className="text-primary" /> {umkm.established_year}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Karyawan</p>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                                                <UsersIcon size={14} className="text-primary" /> {umkm.employee_count} Orang
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[10px]">
                                            {umkm.sector}
                                        </Badge>
                                        <span className="text-[10px] font-mono font-bold text-muted-foreground">NIB: {umkm.nib || "-"}</span>
                                    </div>
                                </CardContent>
                                <div className="bg-muted/30 px-6 py-3 flex justify-between items-center border-t border-border font-mono text-[10px]">
                                    <span className="font-bold text-muted-foreground uppercase">ID: {umkm.id.toString().padStart(4, '0')}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setDetailUmkmId(umkm.id)}
                                        className="h-7 text-primary hover:text-primary/90 font-bold uppercase text-[10px] gap-1"
                                    >
                                        Analisis <Activity size={10} />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {detailUmkmId && (
                <UmkmAssessmentDetail 
                    umkmId={detailUmkmId} 
                    onClose={() => setDetailUmkmId(null)} 
                />
            )}

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl shadow-2xl border-border/50 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold text-primary">
                                    {editingId ? "Perbarui" : "Inisialisasi"} Unit UMKM
                                </CardTitle>
                                <CardDescription>Lengkapi identitas operasional unit bisnis.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Nama Bisnis</Label>
                                            <Input 
                                                value={formData.name} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                                                required 
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Nama Pemilik</Label>
                                            <Input 
                                                value={formData.owner_name} 
                                                onChange={(e) => setFormData({...formData, owner_name: e.target.value})} 
                                                required 
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">NIB</Label>
                                            <Input 
                                                value={formData.nib} 
                                                onChange={(e) => setFormData({...formData, nib: e.target.value})} 
                                                className="h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Sektor Usaha</Label>
                                            <select 
                                                className="w-full bg-muted/50 border border-border rounded-xl h-11 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                                                value={formData.sector}
                                                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                                            >
                                                {["Kuliner", "Kriya", "Jasa", "Manufaktur", "Teknologi"].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-bold uppercase">Keanggotaan Organisasi UMKM</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    type="button"
                                                    variant={!formData.is_joining_organization ? "default" : "outline"}
                                                    onClick={() => setFormData({...formData, is_joining_organization: false, umkm_organization_id: ""})}
                                                    className="h-11 rounded-xl font-bold text-xs uppercase"
                                                >
                                                    Mandiri
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={formData.is_joining_organization ? "default" : "outline"}
                                                    onClick={() => setFormData({...formData, is_joining_organization: true})}
                                                    className="h-11 rounded-xl font-bold text-xs uppercase"
                                                >
                                                    Terdaftar
                                                </Button>
                                            </div>
                                            {formData.is_joining_organization && (
                                                <div className="pt-2">
                                                    <Input
                                                        type="number"
                                                        value={formData.umkm_organization_id}
                                                        onChange={(e) => setFormData({...formData, umkm_organization_id: e.target.value})}
                                                        required
                                                        placeholder="Masukkan ID organisasi UMKM binaan UPT"
                                                        className="h-11 rounded-xl"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase">Thn Berdiri</Label>
                                                <Input 
                                                    type="number" 
                                                    value={formData.established_year} 
                                                    onChange={(e) => setFormData({...formData, established_year: e.target.value})} 
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase">Jml Staff</Label>
                                                <Input 
                                                    type="number" 
                                                    value={formData.employee_count} 
                                                    onChange={(e) => setFormData({...formData, employee_count: e.target.value})} 
                                                    className="h-11 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <div 
                                                className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border group cursor-pointer hover:border-primary/50 transition-all"
                                                onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                                            >
                                                <Label className="text-xs font-bold uppercase cursor-pointer">Status Operasional Aktif</Label>
                                                <div className={`w-10 h-5 rounded-full transition-all relative ${formData.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_active ? "right-1" : "left-1"}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-6 bg-muted/20 border-t border-border/50 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl font-bold h-12">Batal</Button>
                                <Button type="submit" disabled={submitting} className="flex-1 rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20">
                                    {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle size={18} />}
                                    Simpan Data
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardPageShell>
    );
}
