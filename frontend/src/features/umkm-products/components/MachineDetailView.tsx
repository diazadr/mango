"use client";

import React from "react";
import { X, Pencil, Trash2, Wrench, Tag, Zap, Calendar, Activity, Maximize, Weight, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/src/components/ui/dialog";

interface MachineDetailViewProps {
  machine: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (machine: any) => void;
  onDelete: (id: number) => void;
}

export const MachineDetailView = ({
  machine,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete
}: MachineDetailViewProps) => {
  if (!machine) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{machine.machine_name}</DialogTitle>
          <DialogDescription>Detail informasi mesin {machine.machine_name}</DialogDescription>
        </DialogHeader>

        <div className="relative h-64 bg-muted/30">
          {machine.image_large || machine.image_url ? (
            <img src={machine.image_large || machine.image_url} alt={machine.machine_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <Wrench size={80} />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/40 text-white"
          >
            <X size={20} />
          </Button>
          <div className="absolute bottom-4 left-4">
            <Badge className={`rounded-lg font-bold text-[10px] shadow-lg ${
                machine.condition === 'good' ? 'bg-success text-white' : 
                machine.condition === 'fair' ? 'bg-warning text-white' : 
                'bg-destructive text-white'
            }`}>
                {machine.condition === 'good' ? 'Kondisi Prima' : machine.condition === 'fair' ? 'Butuh Servis' : 'Rusak'}
            </Badge>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase text-primary tracking-widest">{machine.brand || 'Tanpa Merk'}</p>
              <p className="text-[10px] font-bold text-muted-foreground">Tahun Perolehan: {machine.purchase_year || '—'}</p>
            </div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">{machine.machine_name}</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deskripsi & Spesifikasi</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {machine.description || "Tidak ada deskripsi teknis tersedia."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Zap size={10} className="text-warning" /> Daya
                </p>
                <p className="text-sm font-bold text-foreground">{machine.power_consumption || 0} Watt</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Activity size={10} className="text-success" /> Servis
                </p>
                <p className="text-sm font-bold text-foreground">Tiap {machine.maintenance_interval || 6} bln</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Maximize size={10} className="text-blue-500" /> Dimensi
                </p>
                <p className="text-sm font-bold text-foreground">{machine.dimensions || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <Weight size={10} className="text-orange-500" /> Berat
                </p>
                <p className="text-sm font-bold text-foreground">{machine.weight ? `${machine.weight} kg` : "—"}</p>
              </div>
            </div>

            {machine.notes && (
                <div className="bg-muted/20 p-4 rounded-2xl flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted text-muted-foreground mt-0.5">
                        <Info size={16} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Catatan Tambahan</p>
                        <p className="text-xs font-medium text-foreground/80 leading-relaxed">{machine.notes}</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-10 pt-0 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
                onOpenChange(false);
                setTimeout(() => onEdit(machine), 200);
            }}
            className="flex-1 rounded-2xl h-14 font-bold gap-2"
          >
            <Pencil size={18} /> Edit Data Mesin
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onDelete(machine.id)}
            className="rounded-2xl h-14 w-14 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={20} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
