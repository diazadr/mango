'use client';

import { useEffect, useState, useCallback } from 'react';
import { manufacturingService } from '@/src/features/manufacturing/services/manufacturingService';
import { productService } from '@/src/features/umkm-products/services/productService';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Plus, Trash2, Package, Edit2, GripVertical, ListChecks, ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type BomLine = { material_name: string; quantity: number; unit: string; notes?: string; image_url?: string; inventory_id?: number | null };
type Product = {
  id: number; name: string; sku: string; unit: string; description: string;
  umkm_product_id: number | null; is_saleable: boolean; image_url?: string;
  bom: { id: number; version: string; lines: any[] } | null;
};
type InventoryMaterial = { id: number; name: string; unit: string; stock: number; image_url?: string };

export function ProductsView() {
  const t = useTranslations('ManufacturingPage');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showBomDialog, setShowBomDialog] = useState(false);
  const [showBomViewDialog, setShowBomViewDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [bomProduct, setBomProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', unit: 'pcs', description: '',
    is_saleable: false, umkm_product_id: '', images: [] as File[],
  });
  const [bomLines, setBomLines] = useState<BomLine[]>([{ material_name: '', quantity: 1, unit: 'pcs', image_url: '' }]);
  const [inventoryMaterials, setInventoryMaterials] = useState<InventoryMaterial[]>([]);

  const [umkmProducts, setUmkmProducts] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, catRes] = await Promise.all([
        manufacturingService.getProducts(),
        productService.getProducts().catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(res.data?.data ?? []);
      setUmkmProducts(catRes.data?.data ?? []);
    } catch { toast.error(t('error_load')); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', unit: 'pcs', description: '', is_saleable: false, umkm_product_id: '', images: [] });
    setShowDialog(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku ?? '', unit: p.unit ?? 'pcs', description: p.description ?? '', is_saleable: !!p.is_saleable, umkm_product_id: p.umkm_product_id?.toString() ?? '', images: [] });
    setShowDialog(true);
  };

  const openBom = (p: Product) => {
    setBomProduct(p);
    setBomLines(p.bom?.lines?.map((l: any) => ({
      material_name: l.material_name, quantity: l.quantity, unit: l.unit,
      notes: l.notes ?? '', image_url: l.image_url ?? '', inventory_id: l.inventory_id ?? null,
    })) ?? [{ material_name: '', quantity: 1, unit: 'pcs', image_url: '', inventory_id: null }]);
    // Load inventory materials for the picker
    manufacturingService.getMaterials().then(res => {
      setInventoryMaterials(res.data?.data ?? []);
    }).catch(() => {});
    setShowBomDialog(true);
  };

  const openBomView = (p: Product) => { setViewProduct(p); setShowBomViewDialog(true); };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Nama produk wajib diisi');
    setSubmitting(true);
    try {
      const payload = { ...form, umkm_product_id: form.umkm_product_id || null };
      if (editProduct) {
        await manufacturingService.updateProduct(editProduct.id, payload);
        toast.success(t('success_product_updated'));
      } else {
        await manufacturingService.createProduct(payload);
        toast.success(t('success_product_added'));
      }
      setShowDialog(false); load();
    } catch (e: any) { toast.error(manufacturingService.parseErrors(e)); }
    finally { setSubmitting(false); }
  };

  const handleBomSave = async () => {
    if (!bomProduct) return;
    const valid = bomLines.filter(l => l.material_name.trim() && l.quantity > 0);
    if (valid.length === 0) return toast.error('Tambahkan minimal 1 komponen');
    setSubmitting(true);
    try {
      await manufacturingService.updateBOM(bomProduct.id, valid);
      toast.success(t('success_bom_updated')); setShowBomDialog(false); load();
    } catch (e: any) { toast.error(manufacturingService.parseErrors(e)); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    // Use state-based delete flag instead of native confirm
    try { await manufacturingService.deleteProduct(id); toast.success(t('success_product_deleted')); load(); }
    catch { toast.error(t('error_load')); }
  };

  const addLine = () => setBomLines(l => [...l, { material_name: '', quantity: 1, unit: 'pcs', image_url: '', inventory_id: null }]);
  const removeLine = (i: number) => setBomLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof BomLine, value: any) =>
    setBomLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: value } : line));

  // Pick an inventory material for a BOM line
  const pickInventoryMaterial = (lineIdx: number, matId: number) => {
    const mat = inventoryMaterials.find(m => m.id === matId);
    if (!mat) return;
    setBomLines(l => l.map((line, idx) => idx === lineIdx ? {
      ...line,
      material_name: mat.name,
      unit: mat.unit || line.unit,
      image_url: mat.image_url || line.image_url || '',
      inventory_id: mat.id,
    } : line));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('produk_bill_of_materials')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('kelola_produk_jadi_dan_komponen_bahan_ba')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> {t('tambah_produk')}
        </Button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">{t('memuat_produk')}</div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border-dashed border border-border/50 bg-card flex flex-col items-center justify-center h-64 gap-4">
          <Package className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('belum_ada_produk_tambahkan_produk_pertam')}</p>
          <Button onClick={openCreate} className="gap-2 rounded-xl font-bold h-10 bg-primary">
            <Plus className="w-4 h-4" /> {t('tambah_produk_1')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card
              key={p.id}
              className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              onClick={() => openBomView(p)}
            >
              {/* Large product image */}
              <div className="relative h-72 w-full overflow-hidden bg-muted/20">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                    <Package className="w-14 h-14" />
                    <span className="text-xs font-semibold">Tidak ada foto</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {p.is_saleable && <Badge className="text-[9px] bg-success text-white border-0 shadow font-black">{t('dijual')}</Badge>}
                  {p.bom && <Badge className="text-[9px] bg-primary text-white border-0 shadow font-black">BOM v{p.bom.version}</Badge>}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-xs text-white font-bold flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Lihat Detail BOM
                  </span>
                </div>
              </div>

              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base leading-tight">{p.name}</h3>
                    {p.sku && <p className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 rounded mt-1 inline-block">{p.sku}</p>}
                  </div>
                  <Badge variant="secondary" className="rounded-lg shrink-0">{p.unit}</Badge>
                </div>

                {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}

                {p.bom ? (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> {p.bom.lines.length} komponen
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                      {p.bom.lines.slice(0, 2).map((l: any) => l.material_name).join(', ')}{p.bom.lines.length > 2 ? '...' : ''}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl border-dashed border border-border/50 p-2.5 text-center bg-muted/10">
                    <p className="text-xs text-muted-foreground font-medium">{t('belum_ada_bom')}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 rounded-xl h-9 font-bold" onClick={() => openBom(p)}>
                    <ListChecks className="w-3.5 h-3.5" /> {p.bom ? 'Edit BOM' : 'Buat BOM'}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(p)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive rounded-xl hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BOM Detail View Dialog */}
      <Dialog open={showBomViewDialog} onOpenChange={setShowBomViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6 shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
              {viewProduct?.image_url && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border/50 shrink-0">
                  <img src={viewProduct.image_url} alt={viewProduct.name} className="w-full h-full object-cover" />
                </div>
              )}
              <span>{viewProduct?.name}</span>
              {viewProduct?.bom && <Badge className="text-[10px] ml-1">BOM v{viewProduct.bom.version}</Badge>}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {viewProduct?.bom ? (
              <>
                <p className="text-xs font-bold text-muted-foreground tracking-wider">{viewProduct.bom.lines.length} Komponen Material</p>
                <div className="space-y-3">
                  {viewProduct.bom.lines.map((l: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-3">
                      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.material_name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{l.material_name}</p>
                        {l.notes && <p className="text-xs text-muted-foreground truncate">{l.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{l.quantity}</p>
                        <p className="text-xs text-muted-foreground">{l.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
                <ListChecks className="w-10 h-10 opacity-20" />
                <p className="text-sm">{t('belum_ada_bom')}</p>
              </div>
            )}
          </div>
          <div className="px-6 pb-6 flex justify-end gap-3 shrink-0 border-t border-border/50 pt-4">
            <Button variant="outline" className="rounded-xl h-10 font-bold px-6" onClick={() => setShowBomViewDialog(false)}>Tutup</Button>
            {viewProduct && (
              <Button className="rounded-xl h-10 font-bold px-6 bg-primary" onClick={() => { setShowBomViewDialog(false); openBom(viewProduct); }}>
                <ListChecks className="w-4 h-4 mr-1" /> {viewProduct.bom ? 'Edit BOM' : 'Buat BOM'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary">
              {editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6 pt-2">
            <div>
              <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('nama_produk')}</Label>
              <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-bold text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('placeholder_cth_bracket_cnc_a1')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('sku')}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder={t('placeholder_prd001')} />
              </div>
              <div>
                <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('satuan')}</Label>
                <Input className="mt-1 h-11 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/15 cursor-pointer hover:bg-success/10 transition-colors" onClick={() => setForm(f => ({ ...f, is_saleable: !f.is_saleable }))}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.is_saleable ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}><ShoppingCart size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight">{t('produk_dijual')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('aktifkan_agar_muncul_di_katalog_publik')}</p>
                </div>
              </div>
              <Checkbox checked={form.is_saleable} onCheckedChange={(c) => setForm(f => ({ ...f, is_saleable: c === true }))} className="w-5 h-5 data-[state=checked]:bg-success data-[state=checked]:border-success cursor-pointer" />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('tautkan_ke_katalog_umkm')}</Label>
              <select className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:border-primary outline-none transition-colors mt-1" value={form.umkm_product_id} onChange={e => setForm(f => ({ ...f, umkm_product_id: e.target.value }))}>
                <option value="">-- Tidak Ditautkan --</option>
                {umkmProducts.map(cat => (<option key={cat.id} value={cat.id}>{cat.name} {cat.sku ? `(${cat.sku})` : ''}</option>))}
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('deskripsi')}</Label>
              <Textarea className="mt-1 rounded-xl bg-background border-input focus:border-primary transition-all font-medium text-sm resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground ml-1 tracking-wide">{t('foto_produk')}</Label>
              <Input type="file" multiple accept="image/*" className="mt-1 h-11 rounded-xl bg-background border-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary cursor-pointer"
                onChange={e => { if (e.target.files) setForm(f => ({ ...f, images: Array.from(e.target.files as FileList) })); }} />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button variant="outline" className="rounded-xl h-11 font-bold px-6" onClick={() => setShowDialog(false)}>{t('batal')}</Button>
              <Button className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20 bg-primary px-10" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Produk'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* BOM Builder Dialog */}
      <Dialog open={showBomDialog} onOpenChange={setShowBomDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
              <ListChecks className="w-5 h-5" /> Bill of Materials — {bomProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 pt-4">
            <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-4 font-bold tracking-wider ml-1">{t('daftar_komponen_bahan_baku_yang_dibutuhk')}</p>
              <div className="space-y-3">
                {bomLines.map((line, i) => (
                  <div key={i} className="bg-card p-3 rounded-xl border border-border/50 shadow-sm space-y-2">
                    <div className="flex gap-2 items-center">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab mx-1" />
                      {/* Material picker from inventory */}
                      <div className="flex-1 space-y-1">
                        <select
                          className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus:border-primary outline-none transition-colors"
                          value={line.inventory_id ?? ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '') {
                              updateLine(i, 'inventory_id', null);
                            } else {
                              pickInventoryMaterial(i, Number(val));
                            }
                          }}
                        >
                          <option value="">-- Pilih dari inventaris --</option>
                          {inventoryMaterials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.unit}) · Stok: {m.stock}
                            </option>
                          ))}
                        </select>
                        {/* Allow manual override if not in inventory */}
                        <Input
                          placeholder={t('placeholder_nama_material')}
                          value={line.material_name}
                          onChange={e => updateLine(i, 'material_name', e.target.value)}
                          className="h-9 rounded-lg bg-muted/20 border-dashed border-input text-xs font-medium"
                        />
                      </div>
                      <Input type="number" placeholder={t('placeholder_qty')} value={line.quantity} min={0.001}
                        onChange={e => updateLine(i, 'quantity', parseFloat(e.target.value))} className="w-20 h-11 rounded-lg bg-background border-input focus:border-primary transition-all font-medium text-sm" />
                      <Input placeholder={t('placeholder_satuan')} value={line.unit}
                        onChange={e => updateLine(i, 'unit', e.target.value)} className="w-16 h-11 rounded-lg bg-background border-input focus:border-primary transition-all font-medium text-sm" />
                      <Button size="icon" variant="ghost" className="h-11 w-11 text-destructive shrink-0 rounded-lg hover:bg-destructive/10" onClick={() => removeLine(i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-4 gap-1 rounded-xl h-10 font-bold border-dashed w-full bg-background hover:bg-muted/50" onClick={addLine}>
                <Plus className="w-4 h-4" /> Tambah Komponen
              </Button>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50 shrink-0">
              <Button variant="outline" className="rounded-xl h-11 font-bold px-6" onClick={() => setShowBomDialog(false)}>{t('batal_1')}</Button>
              <Button className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20 bg-primary px-10" onClick={handleBomSave} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan BOM'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
