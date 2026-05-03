"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, 
  Plus,
  Save,
  Wrench,
  Tag,
  MapPin,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export default function MachineCatalogPage() {
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState<any>(null);
    const [userContext, setUserContext] = useState<any>(null);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [form, setForm] = useState({
        name: "",
        code: "",
        type: "CNC",
        brand: "",
        description: "",
        location: "",
        hourly_rate: "0",
        status: "available"
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userRes = await api.get("/v1/me");
            const userData = userRes.data.data?.user || userRes.data.user;
            setUserContext(userData);

            const machRes = await api.get("/v1/machines");
            // Backend now filters or returns all, but we filter for security/context if needed
            // However, the Resource now returns 'image_url' from Spatie
            setMachines(machRes.data.data || []);
        } catch (err) {
            console.error("Gagal mengambil katalog mesin:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreateDialog = () => {
        setEditingMachine(null);
        setForm({ name: "", code: "", type: "CNC", brand: "", description: "", location: "", hourly_rate: "0", status: "available" });
        setImagePreview(null);
        setImageFile(null);
        setDialogOpen(true);
    };

    const openEditDialog = (machine: any) => {
        setEditingMachine(machine);
        setForm({
            name: machine.name || "",
            code: machine.code || "",
            type: machine.type || "CNC",
            brand: machine.brand || "",
            description: machine.description || "",
            location: machine.location || "",
            hourly_rate: String(machine.hourly_rate || 0),
            status: machine.status || "available"
        });
        setImagePreview(machine.image_large || machine.image_url || null);
        setImageFile(null);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus mesin ini?")) return;
        
        setLoading(true);
        try {
            await api.delete(`/v1/machines/${id}`);
            setStatus({ type: "success", message: "Mesin berhasil dihapus." });
            fetchData();
        } catch (err) {
            setStatus({ type: "destructive", message: "Gagal menghapus mesin." });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            
            if (!editingMachine) {
                const ownerType = userContext?.roles?.includes('upt') ? 'organization' : 'umkm';
                const ownerId = userContext?.roles?.includes('upt') ? userContext?.organizations?.[0]?.id : userContext?.umkm?.id;
                
                if (!ownerId) throw new Error("Owner ID not found");
                formData.append('owner_type', ownerType);
                formData.append('owner_id', String(ownerId));
            }

            if (imageFile) formData.append('image', imageFile);

            if (editingMachine) {
                // Laravel multipart PUT workaround
                formData.append("_method", "PUT");
                await api.post(`/v1/machines/${editingMachine.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                await api.post("/v1/machines", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            setStatus({ 
                type: "success", 
                message: editingMachine ? "Data mesin berhasil diperbarui." : "Mesin berhasil ditambahkan ke katalog." 
            });
            setDialogOpen(false);
            fetchData();
        } catch (err: any) {
            let errorMsg = err.response?.data?.message || "Gagal menyimpan data mesin.";
            setStatus({ type: "destructive", message: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && machines.length === 0) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Menyiapkan katalog mesin...</p>
        </div>
    );

    return (
        <DashboardPageShell
            title="Katalog Mesin Reservasi"
            subtitle="Kelola aset mesin produksi yang dapat direservasi oleh mitra industri."
            icon={Wrench}
            actions={
                <Button onClick={() => openCreateDialog()} className="gap-2 rounded-2xl font-bold h-11 shadow-lg shadow-primary/20 bg-primary">
                    <Plus size={18} /> Tambah mesin
                </Button>
            }
        >
            <div className="space-y-8">
                {status && (
                    <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl">
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="flex items-center justify-between">
                            {status.message}
                            <button onClick={() => setStatus(null)} className="ml-4">
                                <X size={16} className="opacity-50 hover:opacity-100" />
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-8">
                    {machines.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted/10 py-20 text-center rounded-[2.5rem]">
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-3xl bg-muted w-fit mx-auto">
                                    <Wrench size={48} className="text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-muted-foreground font-bold text-sm">Belum ada mesin reservasi di katalog Anda.</p>
                                <Button onClick={() => openCreateDialog()} variant="outline" className="rounded-xl font-bold h-11">Mulai tambah mesin</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {machines.map((machine) => (
                                <Card 
                                    key={machine.id} 
                                    onClick={() => openEditDialog(machine)}
                                    className="border-border/50 shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer relative"
                                >
                                    {/* Delete Button Overlay */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(machine.id); }}
                                        className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>

                                    {/* Machine Image */}
                                    <div className="relative h-48 bg-muted/30 overflow-hidden flex items-center justify-center">
                                        {machine.image_url || machine.image ? (
                                            <img
                                                src={machine.image_url || machine.image}
                                                alt={machine.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Wrench size={64} className="text-muted-foreground/20" />
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Badge className={`rounded-lg font-bold text-[10px] shadow-lg ${
                                                machine.status === 'available' ? 'bg-success text-white' : 
                                                machine.status === 'busy' ? 'bg-warning text-white' : 'bg-destructive text-white'
                                            }`}>
                                                {machine.status === 'available' ? 'Tersedia' : machine.status === 'busy' ? 'Dipakai' : 'Maintanance'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 flex flex-col flex-1">
                                        <div className="mb-2 flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">{machine.brand || 'No Brand'}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground">{machine.code}</p>
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{machine.name}</h3>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                    <Tag size={14} className="text-warning" /> {machine.type}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                    <CircleDollarSign size={14} className="text-primary" /> Rp{Number(machine.hourly_rate).toLocaleString('id-ID')}/jam
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                <MapPin size={14} /> {machine.location || '-'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="bg-muted/30 border-b border-border/30 p-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-primary">
                            {editingMachine ? "Edit Data Mesin" : "Tambah Mesin Reservasi"}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-sm">
                            {editingMachine ? "Perbarui spesifikasi dan status mesin." : "Daftarkan mesin baru yang dapat disewakan."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="p-10 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Foto Mesin</Label>
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className={`relative h-44 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden ${
                                        imagePreview ? 'border-primary/40' : 'border-border hover:border-primary/40 hover:bg-muted/30'
                                    }`}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={32} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 rounded-2xl bg-muted text-muted-foreground/40">
                                                <Upload size={32} />
                                            </div>
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Klik untuk unggah foto</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Nama Mesin</Label>
                                    <Input 
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        placeholder="Contoh: CNC Milling Haas 3-Axis" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Kode Mesin</Label>
                                    <Input 
                                        value={form.code}
                                        onChange={(e) => setForm({...form, code: e.target.value})}
                                        placeholder="CNC-001" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Status</Label>
                                    <Select value={form.status} onValueChange={(val) => setForm({...form, status: val})}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="available" className="rounded-xl">Tersedia</SelectItem>
                                            <SelectItem value="busy" className="rounded-xl">Sedang Dipakai</SelectItem>
                                            <SelectItem value="maintenance" className="rounded-xl">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Brand / Merk</Label>
                                    <Input 
                                        value={form.brand}
                                        onChange={(e) => setForm({...form, brand: e.target.value})}
                                        placeholder="Haas" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Tipe Alat</Label>
                                    <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="CNC" className="rounded-xl">CNC</SelectItem>
                                            <SelectItem value="Laser" className="rounded-xl">Laser Cutting</SelectItem>
                                            <SelectItem value="3D Printer" className="rounded-xl">3D Printer</SelectItem>
                                            <SelectItem value="Lathe" className="rounded-xl">Bubut</SelectItem>
                                            <SelectItem value="Other" className="rounded-xl">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Sewa / Jam (Rp)</Label>
                                    <Input 
                                        type="number"
                                        value={form.hourly_rate}
                                        onChange={(e) => setForm({...form, hourly_rate: e.target.value})}
                                        placeholder="150000" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Lokasi</Label>
                                    <Input 
                                        value={form.location}
                                        onChange={(e) => setForm({...form, location: e.target.value})}
                                        placeholder="Lab Produksi" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2 pt-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-widest">Deskripsi Spesifikasi</Label>
                                    <Textarea 
                                        value={form.description}
                                        onChange={(e) => setForm({...form, description: e.target.value})}
                                        placeholder="Contoh: Akurasi 0.01mm, Travel X: 500mm..."
                                        className="rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all h-24 resize-none font-medium" 
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-10 pt-0">
                            <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 bg-primary">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {editingMachine ? "Simpan Perubahan" : "Daftarkan Mesin"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPageShell>
    );
}
