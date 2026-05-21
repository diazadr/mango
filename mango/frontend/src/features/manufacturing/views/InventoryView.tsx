'use client';

import { useEffect, useState, useCallback } from 'react';
import { manufacturingService } from '@/src/features/manufacturing/services/manufacturingService';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { AlertTriangle, ArrowDown, ArrowUp, Package, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type Material = {
  id: number; name: string; sku: string; unit: string;
  stock_qty: number; minimum_stock: number; reorder_point: number;
  location: string; is_low_stock: boolean; stock_pct: number;
  image_url?: string;
};

const MOVEMENT_TYPES = [
  { value: 'in',         label: 'Masuk (In)',          icon: ArrowDown, color: 'text-green-500' },
  { value: 'out',        label: 'Keluar (Out)',         icon: ArrowUp,   color: 'text-red-500' },
  { value: 'adjustment', label: 'Penyesuaian',          icon: RotateCcw, color: 'text-blue-500' },
  { value: 'return',     label: 'Retur',                icon: ArrowDown, color: 'text-orange-500' },
];

export function InventoryView() {
  const t = useTranslations('ManufacturingPage');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMovDialog, setShowMovDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterLow, setFilterLow] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', sku: '', unit: 'pcs', stock_qty: 0, minimum_stock: 0, location: '', images: [] as File[] });
  const [movForm, setMovForm] = useState({ type: 'in', quantity: 1, reference: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await manufacturingService.getMaterials(filterLow ? { low_stock: true } : {});
      setMaterials(res.data?.data ?? []);
      setLowStockCount(res.data?.low_stock_count ?? 0);
    } catch { toast.error(t('error_load')); }
    finally { setLoading(false); }
  }, [filterLow]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!addForm.name.trim()) return toast.error('Nama material wajib diisi');
    setSubmitting(true);
    try {
      await manufacturingService.createMaterial(addForm);
      toast.success(t('success_material_added')); setShowAddDialog(false); load();
    } catch (e: any) { toast.error(manufacturingService.parseErrors(e)); }
    finally { setSubmitting(false); }
  };

  const openMovement = (m: Material) => {
    setSelectedMaterial(m);
    setMovForm({ type: 'in', quantity: 1, reference: '', notes: '' });
    setShowMovDialog(true);
  };

  const handleMovement = async () => {
    if (!selectedMaterial) return;
    setSubmitting(true);
    try {
      await manufacturingService.addMaterialMovement(selectedMaterial.id, movForm as any);
      toast.success(t('success_stock_updated')); setShowMovDialog(false); load();
    } catch (e: any) { toast.error(manufacturingService.parseErrors(e)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus material ini?')) return;
    try { await manufacturingService.deleteMaterial(id); toast.success(t('success_material_deleted')); load(); }
    catch { toast.error(t('error_load')); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("inventaris_material")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("kelola_stok_bahan_baku_dan_pergerakan_ma")}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> {t("tambah_material")}</Button>
      </div>

      {/* Alert Low Stock */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{lowStockCount} material stok kritis</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{t("stok_di_bawah_batas_minimum_segera_lakuk")}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700"
            onClick={() => setFilterLow(!filterLow)}>
            {filterLow ? 'Tampilkan Semua' : 'Lihat Kritis'}
          </Button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/50 shadow-sm bg-card rounded-xl">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-foreground">{materials.length}</div>
            <p className="text-sm text-muted-foreground mt-1">{t("total_material")}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-sm bg-red-50/50 dark:bg-red-950/20 rounded-xl">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{lowStockCount}</div>
            <p className="text-sm text-muted-foreground mt-1">{t("stok_kritis")}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-sm bg-green-50/50 dark:bg-green-950/20 rounded-xl">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{materials.filter(m => !m.is_low_stock).length}</div>
            <p className="text-sm text-muted-foreground mt-1">{t("stok_aman")}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-sm bg-card rounded-xl">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-foreground">{filterLow ? 'Kritis' : 'Semua'}</div>
            <p className="text-sm text-muted-foreground mt-1">{t("filter_aktif")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border border-border/50 shadow-sm bg-card rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Material', 'SKU', 'Stok', 'Min. Stok', 'Lokasi', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("memuat")}</td></tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t("belum_ada_material_tambahkan_material_pe")}</p>
                    </td>
                  </tr>
                ) : materials.map((m) => (
                  <tr key={m.id} className={`border-b hover:bg-muted/20 transition-colors ${m.is_low_stock ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.is_low_stock && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {m.image_url ? (
                          <img src={m.image_url} alt={m.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border/50" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.sku ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${m.is_low_stock ? 'text-red-600' : 'text-foreground'}`}>
                            {m.stock_qty}
                          </span>
                          <span className="text-xs text-muted-foreground">{m.unit}</span>
                        </div>
                        {/* Stock Progress Bar */}
                        <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${m.stock_pct}%`, background: m.is_low_stock ? '#ef4444' : '#22c55e' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.minimum_stock} {m.unit}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{m.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={m.is_low_stock ? 'destructive' : 'secondary'} className="text-xs">
                        {m.is_low_stock ? 'Kritis' : 'Aman'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openMovement(m)}>
                          <RotateCcw className="w-3 h-3" /> Pergerakan
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Tambah Material */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary">{t("tambah_material_1")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-2">
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("nama_material")}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder={t("placeholder_cth_besi_plat_2mm")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("sku")}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={addForm.sku} onChange={e => setAddForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("satuan")}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={addForm.unit} onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))} placeholder={t("placeholder_pcskgm")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("stok_awal")}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" type="number" min={0} value={addForm.stock_qty} onChange={e => setAddForm(f => ({ ...f, stock_qty: parseFloat(e.target.value) }))} />
              </div>
              <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("min_stok_alert")}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" type="number" min={0} value={addForm.minimum_stock} onChange={e => setAddForm(f => ({ ...f, minimum_stock: parseFloat(e.target.value) }))} />
              </div>
            </div>
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("lokasi_penyimpanan")}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} placeholder={t("placeholder_cth_rak_a3")} />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground ml-1">{t("foto_material")}</Label>
              <Input type="file" accept="image/*" multiple className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  onChange={e => {
                      if (e.target.files) {
                          setAddForm(f => ({ ...f, images: Array.from(e.target.files as FileList) }));
                      }
                  }} 
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button variant="outline" className="rounded-xl h-11 font-bold" onClick={() => setShowAddDialog(false)}>{t("batal")}</Button>
              <Button className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20 bg-primary px-8" onClick={handleAdd} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Pergerakan Stok */}
      <Dialog open={showMovDialog} onOpenChange={setShowMovDialog}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary">Pergerakan Stok — {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-2">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm flex items-center justify-between">
              <span className="text-muted-foreground">{t("stok_saat_ini")}</span>
              <span className="font-bold text-lg">{selectedMaterial?.stock_qty} <span className="text-sm font-medium">{selectedMaterial?.unit}</span></span>
            </div>
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("jenis_pergerakan")}</Label>
              <Select value={movForm.type} onValueChange={v => setMovForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {MOVEMENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <t.icon className={`w-4 h-4 ${t.color}`} />{t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("jumlah")}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" type="number" min={0.001} step="0.001" value={movForm.quantity}
                onChange={e => setMovForm(f => ({ ...f, quantity: parseFloat(e.target.value) }))} />
            </div>
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("referensi_no_po_wo")}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={movForm.reference} onChange={e => setMovForm(f => ({ ...f, reference: e.target.value }))} placeholder={t("placeholder_cth_wo2024001")} />
            </div>
            <div><Label className="text-xs font-bold text-muted-foreground ml-1">{t("catatan")}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={movForm.notes} onChange={e => setMovForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button variant="outline" className="rounded-xl h-11 font-bold" onClick={() => setShowMovDialog(false)}>{t("batal_1")}</Button>
              <Button className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20 bg-primary px-8" onClick={handleMovement} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Catat Pergerakan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
