"use client";

import React, { useState } from "react";
import { api } from "@/src/lib/http/axios";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2, Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface MentoringRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message?: string) => void;
}

export const MentoringRequestForm = ({ open, onOpenChange, onSuccess }: MentoringRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/v1/mentoring/requests", formData);
      setFormData({ topic: "", description: "" });
      onSuccess("Permohonan mentoring Anda telah berhasil dikirim.");
    } catch (error: any) {
      console.error("Failed to submit request", error);
      // In a real app, you might want to show this error in an alert inside the dialog
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-muted/30 border-b p-8">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-primary">Ajukan Mentoring</DialogTitle>
              <DialogDescription className="font-medium">
                Dapatkan bantuan teknis dari advisor profesional.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Topik Konsultasi</Label>
              <Input
                id="topic"
                placeholder="Contoh: Digitalisasi Produksi Konveksi"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deskripsi Masalah</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan secara detail kendala yang Anda hadapi atau bantuan yang diharapkan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all resize-none h-32"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
              Kirim Permohonan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
