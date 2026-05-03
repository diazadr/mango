"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, 
  Wrench,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  Factory,
  Settings2,
  Building2,
  CheckCircle2,
  Info,
  FileText,
  Save
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/src/components/ui/table";
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
import { Textarea } from "@/src/components/ui/textarea";
import { useAuth } from "@/src/components/providers/AuthProvider";

export default function TechnicalProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [umkm, setUmkm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const [capacities, setCapacities] = useState<any[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    
    const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
    const [machineDialogOpen, setMachineDialogOpen] = useState(false);
    
    const [editingCapacity, setEditingCapacity] = useState<any>(null);
    const [editingMachine, setEditingMachine] = useState<any>(null);
    
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

    const [capacityForm, setCapacityForm] = useState({
        product_name: "",
        capacity_per_day: "",
        unit: "",
        notes: ""
    });

    const [machineForm, setMachineForm] = useState({
        machine_name: "",
        brand: "",
        quantity: "1",
        condition: "good",
        notes: ""
    });

    const fetchData = useCallback(async () => {
        if (authLoading || !isAuthenticated || !user) return;
        
        setLoading(true);
        try {
            const umkmData = user.umkm;
            
            if (umkmData) {
                setUmkm(umkmData);
                
                const [capRes, machRes] = await Promise.all([
                    api.get("/v1/production-capacities"),
                    api.get("/v1/machine-manuals")
                ]);
                
                setCapacities(capRes.data.data || capRes.data);
                setMachines(machRes.data.data || machRes.data);
            }
        } catch (err: any) {
            console.error("Gagal mengambil data teknis:", err);
            if (err.response?.status === 401) {
                // Let the Layout handle the redirect to login
            }
        } finally {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, user]);

    useEffect(() => { 
        if (isAuthenticated && !authLoading) {
            fetchData(); 
        }
    }, [fetchData, isAuthenticated, authLoading]);

    const handleCapacitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!umkm) return;
        setSubmitting(true);
        setStatus(null);
        try {
            if (editingCapacity) {
                await api.put(`/v1/production-capacities/${editingCapacity.id}`, capacityForm);
                setStatus({ type: "success", message: "Kapasitas produksi berhasil diperbarui." });
            } else {
                await api.post("/v1/production-capacities", capacityForm);
                setStatus({ type: "success", message: "Kapasitas produksi berhasil ditambahkan." });
            }
            setCapacityDialogOpen(false);
            fetchData();
        } catch (err: any) {
            let errorMsg = err.response?.data?.message || "Gagal menyimpan data.";
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                errorMsg = firstError[0];
            }
            setStatus({ type: "destructive", message: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleMachineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!umkm) return;
        setSubmitting(true);
        setStatus(null);
        try {
            if (editingMachine) {
                await api.put(`/v1/machine-manuals/${editingMachine.id}`, machineForm);
                setStatus({ type: "success", message: "Data mesin berhasil diperbarui." });
            } else {
                await api.post("/v1/machine-manuals", machineForm);
                setStatus({ type: "success", message: "Mesin baru berhasil ditambahkan." });
            }
            setMachineDialogOpen(false);
            fetchData();
        } catch (err: any) {
            let errorMsg = err.response?.data?.message || "Gagal menyimpan data.";
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                errorMsg = firstError[0];
            }
            setStatus({ type: "destructive", message: errorMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCapacity = async (id: number) => {
        if (!confirm("Hapus data kapasitas ini?")) return;
        setStatus(null);
        try {
            await api.delete(`/v1/production-capacities/${id}`);
            setStatus({ type: "success", message: "Data kapasitas dihapus." });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghapus data." });
        }
    };

    const deleteMachine = async (id: number) => {
        if (!confirm("Hapus data mesin ini?")) return;
        setStatus(null);
        try {
            await api.delete(`/v1/machine-manuals/${id}`);
            setStatus({ type: "success", message: "Data mesin dihapus." });
            fetchData();
        } catch (err: any) {
            setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghapus data." });
        }
    };

    const openCapacityDialog = (item?: any) => {
        if (item) {
            setEditingCapacity(item);
            setCapacityForm({
                product_name: item.product_name,
                capacity_per_day: item.capacity_per_day.toString(),
                unit: item.unit,
                notes: item.notes || ""
            });
        } else {
            setEditingCapacity(null);
            setCapacityForm({
                product_name: "",
                capacity_per_day: "",
                unit: "",
                notes: ""
            });
        }
        setCapacityDialogOpen(true);
    };

    const openMachineDialog = (item?: any) => {
        if (item) {
            setEditingMachine(item);
            setMachineForm({
                machine_name: item.machine_name,
                brand: item.brand || "",
                quantity: item.quantity.toString(),
                condition: item.condition,
                notes: item.notes || ""
            });
        } else {
            setEditingMachine(null);
            setMachineForm({
                machine_name: "",
                brand: "",
                quantity: "1",
                condition: "good",
                notes: ""
            });
        }
        setMachineDialogOpen(true);
    };

    if (loading) return (
        <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Menghubungkan ke pusat data teknis...</p>
        </div>
    );

    if (!umkm) return (
        <DashboardPageShell title="Profil teknis" subtitle="Kapasitas & fasilitas produksi" icon={Wrench}>
            <Card className="border-dashed border-2 bg-muted/20 py-20 text-center">
                <CardContent className="space-y-4">
                    <AlertCircle size={48} className="mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium">Lengkapi profil UMKM Anda terlebih dahulu untuk mengakses menu ini.</p>
                </CardContent>
            </Card>
        </DashboardPageShell>
    );

    return (
        <DashboardPageShell
            title="Profil teknis produksi"
            subtitle="Pusat manajemen kapasitas operasional dan aset permesinan UMKM."
            icon={Wrench}
            actions={
                <Button 
                    variant="outline" 
                    onClick={() => window.open(`/id/document/umkm/${umkm.id}`, '_blank')} 
                    className="gap-2 rounded-xl text-primary border-primary/20 hover:bg-primary/5 font-bold shadow-sm"
                >
                    <FileText size={16} /> Cetak Resume UMKM
                </Button>
            }
        >
            <div className="space-y-8">
                {status && (
                    <Alert 
                        variant={status.type} 
                        className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl"
                    >
                        {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <AlertDescription className="flex items-center justify-between">
                            {status.message}
                            <button 
                                onClick={() => setStatus(null)}
                                className="ml-4 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                            >
                                Tutup
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Capacity & Machine Tables */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Production Capacity Section */}
                        <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-muted/30 border-b border-border/50 p-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                        <Factory size={18} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-foreground">Kapasitas Produksi</CardTitle>
                                        <CardDescription className="text-xs">Output harian per jenis produk.</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={() => openCapacityDialog()} className="rounded-xl gap-2 font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-10">
                                    <Plus size={16} /> Tambah Data
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10">
                                            <TableHead className="px-6 font-bold text-xs text-muted-foreground">Produk</TableHead>
                                            <TableHead className="px-6 font-bold text-xs text-muted-foreground">Volume Harian</TableHead>
                                            <TableHead className="px-6 text-right font-bold text-xs text-muted-foreground">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {capacities.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-40 text-center text-muted-foreground italic">Belum ada data kapasitas produksi.</TableCell>
                                            </TableRow>
                                        ) : (
                                            capacities.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors border-b-border/30">
                                                    <TableCell className="px-6 py-4 font-bold text-foreground">{item.product_name}</TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge variant="secondary" className="rounded-lg font-bold px-3 py-1 bg-muted border-none">
                                                            {item.capacity_per_day} {item.unit} / hari
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button onClick={() => openCapacityDialog(item)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                                <Pencil size={14} />
                                                            </Button>
                                                            <Button onClick={() => deleteCapacity(item.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Machine List Section */}
                        <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-muted/30 border-b border-border/50 p-6 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Settings2 size={18} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-foreground">Daftar Permesinan</CardTitle>
                                        <CardDescription className="text-xs">Aset peralatan pendukung produksi.</CardDescription>
                                    </div>
                                </div>
                                <Button onClick={() => openMachineDialog()} className="rounded-xl gap-2 font-bold bg-primary shadow-lg shadow-primary/20 h-10">
                                    <Plus size={16} /> Tambah Mesin
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10">
                                            <TableHead className="px-6 font-bold text-xs text-muted-foreground">Nama Mesin</TableHead>
                                            <TableHead className="px-6 font-bold text-xs text-muted-foreground text-center">Qty</TableHead>
                                            <TableHead className="px-6 font-bold text-xs text-muted-foreground">Kondisi</TableHead>
                                            <TableHead className="px-6 text-right font-bold text-xs text-muted-foreground">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {machines.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">Belum ada data permesinan.</TableCell>
                                            </TableRow>
                                        ) : (
                                            machines.map((item) => (
                                                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors border-b-border/30">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground leading-tight">{item.machine_name}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.brand || "Tanpa Merk"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-center font-bold text-sm">{item.quantity} Unit</TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <Badge className={`rounded-lg font-bold text-[10px] shadow-none ${
                                                            item.condition === 'good' ? 'bg-success/10 text-success border-success/20 hover:bg-success/10' : 
                                                            item.condition === 'fair' ? 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/10' : 
                                                            'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10'
                                                        }`}>
                                                            {item.condition === 'good' ? 'Prima' : item.condition === 'fair' ? 'Cukup' : 'Rusak'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button onClick={() => openMachineDialog(item)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                                <Pencil size={14} />
                                                            </Button>
                                                            <Button onClick={() => deleteMachine(item.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all">
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Capacity Dialog */}
            <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
                    <DialogHeader className="bg-muted/30 border-b border-border/30 p-8">
                        <DialogTitle className="text-xl font-bold tracking-tight text-primary">
                            {editingCapacity ? "Edit kapasitas" : "Tambah kapasitas produksi"}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium">Informasi volume produksi harian UMKM.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCapacitySubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">Nama Produk</Label>
                                <Input 
                                    value={capacityForm.product_name}
                                    onChange={(e) => setCapacityForm({...capacityForm, product_name: e.target.value})}
                                    placeholder="Contoh: Kemeja Flanel" 
                                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">Target Harian</Label>
                                    <Input 
                                        type="number"
                                        value={capacityForm.capacity_per_day}
                                        onChange={(e) => setCapacityForm({...capacityForm, capacity_per_day: e.target.value})}
                                        placeholder="0" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">Satuan</Label>
                                    <Input 
                                        value={capacityForm.unit}
                                        onChange={(e) => setCapacityForm({...capacityForm, unit: e.target.value})}
                                        placeholder="Pcs/Lusin" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">Catatan</Label>
                                <Textarea 
                                    value={capacityForm.notes}
                                    onChange={(e) => setCapacityForm({...capacityForm, notes: e.target.value})}
                                    className="rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all resize-none h-24" 
                                    placeholder="Informasi tambahan..."
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Machine Dialog */}
            <Dialog open={machineDialogOpen} onOpenChange={setMachineDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
                    <DialogHeader className="bg-muted/30 border-b border-border/30 p-8">
                        <DialogTitle className="text-xl font-bold tracking-tight text-primary">
                            {editingMachine ? "Edit data mesin" : "Tambah mesin produksi"}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium">Informasi aset peralatan produksi.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMachineSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">Nama Alat / Mesin</Label>
                                <Input 
                                    value={machineForm.machine_name}
                                    onChange={(e) => setMachineForm({...machineForm, machine_name: e.target.value})}
                                    placeholder="Contoh: Mesin Jahit Juki" 
                                    className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">Brand / Merk</Label>
                                    <Input 
                                        value={machineForm.brand}
                                        onChange={(e) => setMachineForm({...machineForm, brand: e.target.value})}
                                        placeholder="Penyedia/Merk" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">Jumlah Unit</Label>
                                    <Input 
                                        type="number"
                                        value={machineForm.quantity}
                                        onChange={(e) => setMachineForm({...machineForm, quantity: e.target.value})}
                                        placeholder="1" 
                                        className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background transition-all font-bold" 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">Kondisi Saat Ini</Label>
                                <Select 
                                    value={machineForm.condition} 
                                    onValueChange={(val) => setMachineForm({...machineForm, condition: val})}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-transparent focus:bg-background">
                                        <SelectValue placeholder="Pilih Kondisi" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/50">
                                        <SelectItem value="good" className="rounded-xl">Prima / Beroperasi Baik</SelectItem>
                                        <SelectItem value="fair" className="rounded-xl">Cukup / Butuh Servis</SelectItem>
                                        <SelectItem value="poor" className="rounded-xl">Rusak / Tidak Beroperasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Simpan Inventaris
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPageShell>
    );
}
