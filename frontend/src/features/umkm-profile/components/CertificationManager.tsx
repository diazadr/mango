"use client";

import React, { useState } from "react";
import { FileText, Plus, Trash2, Download, Loader2, Calendar, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { onboardingService } from "../../onboarding/services/onboardingService";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

interface CertificationManagerProps {
  umkm: any;
  onRefresh: () => Promise<void>;
  t: any;
  setStatus: (status: { type: "success" | "destructive"; message: string } | null) => void;
}

export const CertificationManager = ({ umkm, onRefresh, t, setStatus }: CertificationManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCert, setNewCert] = useState({
    name: "",
    certificate_number: "",
    issued_date: "",
    expiry_date: "",
    file: null as File | null,
  });

  const handleAdd = async () => {
    if (!newCert.name || !newCert.file) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", newCert.name);
    formData.append("certificate_number", newCert.certificate_number);
    if (newCert.issued_date) formData.append("issued_date", newCert.issued_date);
    if (newCert.expiry_date) formData.append("expiry_date", newCert.expiry_date);
    formData.append("file", newCert.file);

    try {
      await onboardingService.addCertification(umkm.uuid, formData);
      setNewCert({ name: "", certificate_number: "", issued_date: "", expiry_date: "", file: null });
      setIsAdding(false);
      await onRefresh();
      setStatus({ type: "success", message: "Sertifikat berhasil ditambahkan!" });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menambahkan sertifikat." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus sertifikat ini?")) return;
    try {
      await onboardingService.deleteCertification(umkm.uuid, id);
      await onRefresh();
      setStatus({ type: "success", message: "Sertifikat berhasil dihapus!" });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghapus sertifikat." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground leading-none">{t("certification_docs")}</h4>
            <p className="text-xs text-muted-foreground leading-snug">{t("certification_docs_desc")}</p>
        </div>
        <Button 
            type="button" 
            variant={isAdding ? "ghost" : "outline"} 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
            className={`rounded-lg h-9 text-xs font-bold transition-all px-4 ${isAdding ? 'text-destructive hover:text-destructive hover:bg-destructive/5' : 'border-primary/20 text-primary hover:bg-primary/5'}`}
        >
          {isAdding ? <><X size={14} className="mr-1.5" strokeWidth={1.5} /> Batal</> : <><Plus size={14} className="mr-1.5" strokeWidth={1.5} /> {t("add_certification")}</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("cert_name_label")}</Label>
                <Input 
                    placeholder="Contoh: Sertifikat Halal" 
                    className="h-9 text-sm rounded-lg bg-white border-primary/20" 
                    value={newCert.name}
                    onChange={e => setNewCert({...newCert, name: e.target.value})}
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("cert_number_label")}</Label>
                <Input 
                    placeholder="No. REG/XXX/2024" 
                    className="h-9 text-sm rounded-lg bg-white border-primary/20"
                    value={newCert.certificate_number}
                    onChange={e => setNewCert({...newCert, certificate_number: e.target.value})}
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("cert_issued_label")}</Label>
                <Input 
                    type="date" 
                    className="h-9 text-sm rounded-lg bg-white border-primary/20"
                    value={newCert.issued_date}
                    onChange={e => setNewCert({...newCert, issued_date: e.target.value})}
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("cert_expiry_label")}</Label>
                <Input 
                    type="date" 
                    className="h-9 text-sm rounded-lg bg-white border-primary/20"
                    value={newCert.expiry_date}
                    onChange={e => setNewCert({...newCert, expiry_date: e.target.value})}
                />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground ml-1">{t("cert_file_label")}</Label>
            <Input 
                type="file" 
                accept=".pdf,image/*" 
                className="h-10 text-xs bg-white border-primary/20 file:bg-primary/10 file:text-primary file:font-bold file:rounded-md file:border-0 file:px-3 file:mr-3"
                onChange={e => setNewCert({...newCert, file: e.target.files?.[0] || null})}
            />
          </div>

          <Button 
            type="button" 
            className="w-full h-10 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20"
            onClick={handleAdd}
            disabled={isSubmitting || !newCert.name || !newCert.file}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            {t("upload_certification")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {umkm.certification_docs?.length > 0 ? (
          umkm.certification_docs.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-border shadow-sm group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
                    <FileText size={20} strokeWidth={1.5} />
                </div>
                <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-foreground">{doc.name}</h5>
                    <p className="text-[11px] text-muted-foreground font-mono">{doc.certificate_number || "Tanpa nomor"}</p>
                    {doc.expiry_date && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-warning bg-warning/5 w-fit px-2 py-0.5 rounded-md border border-warning/10">
                            <Calendar size={11} strokeWidth={1.5} />
                            Berlaku s/d: {new Date(doc.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-primary hover:bg-primary/5 rounded-lg"
                    onClick={() => window.open(doc.file_url, '_blank')}
                >
                    <Download size={16} strokeWidth={1.5} />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-destructive hover:bg-destructive/5 rounded-lg"
                    onClick={() => handleDelete(doc.id)}
                >
                    <Trash2 size={16} strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-muted/5">
            <FileText className="mx-auto text-muted-foreground/20 mb-3" size={32} strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground italic font-medium">{t("no_certifications_uploaded")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
