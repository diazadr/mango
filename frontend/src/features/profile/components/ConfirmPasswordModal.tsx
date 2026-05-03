"use client";

import React, { useState } from "react";
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogHeader, DialogTitle, DialogFooter 
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2, ShieldAlert } from "lucide-react";
import { profileService } from "../services/profileService";

interface ConfirmPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const ConfirmPasswordModal = ({ 
    isOpen, onClose, onConfirm, 
    title = "Konfirmasi Password", 
    description = "Untuk keamanan, silakan konfirmasi kata sandi Anda untuk melanjutkan tindakan ini." 
}: ConfirmPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await profileService.confirmPassword(password);
      setPassword("");
      onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Kata sandi tidak valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <ShieldAlert size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConfirm} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-password-input" className="text-xs font-bold text-muted-foreground ml-1">Password</Label>
            <Input 
                id="confirm-password-input"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="h-11 rounded-xl bg-muted/20 border-none outline-none focus:ring-0"
                placeholder="Masukkan kata sandi Anda"
            />
            {error && <p className="text-[10px] font-medium text-destructive ml-1">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-11 font-bold flex-1">Batal</Button>
            <Button type="submit" disabled={isSubmitting || !password} className="rounded-xl h-11 font-bold bg-primary text-white flex-1">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
