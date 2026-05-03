"use client";

import React, { useState } from "react";
import { 
    Shield, ShieldCheck, ShieldAlert, 
    Copy, RefreshCw, Loader2, QrCode, Key
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";

interface TwoFactorManagerProps {
  user: any;
  qrCode: string | null;
  recoveryCodes: string[];
  isConfirming: boolean;
  isSubmitting: boolean;
  onEnable: () => void;
  onConfirm: (code: string) => void;
  onDisable: () => void;
  onShowRecovery: () => void;
  onRegenerateRecovery: () => void;
}

export const TwoFactorManager = ({ 
  user, qrCode, recoveryCodes, isConfirming, isSubmitting,
  onEnable, onConfirm, onDisable, onShowRecovery, onRegenerateRecovery
}: TwoFactorManagerProps) => {
  const [confirmCode, setConfirmCode] = useState("");
  const isEnabled = !!user?.two_factor_confirmed_at;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isConfirming && qrCode) {
    return (
      <div className="space-y-6 py-2 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-3xl border shadow-sm" dangerouslySetInnerHTML={{ __html: qrCode }} />
          <div className="space-y-1">
            <p className="text-sm font-bold">Siapkan Autentikasi Dua Faktor</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Pindai kode QR di atas menggunakan aplikasi authenticator Anda (seperti Google Authenticator atau Authy).
            </p>
          </div>
        </div>

        <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground ml-1">Kode Konfirmasi</Label>
            <div className="flex gap-2">
                <Input 
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value)}
                    placeholder="Contoh: 123456"
                    className="h-11 rounded-xl bg-white border-border"
                />
                <Button 
                    onClick={() => onConfirm(confirmCode)}
                    disabled={isSubmitting || confirmCode.length < 6}
                    className="h-11 px-6 rounded-xl bg-primary text-white font-bold"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Verifikasi"}
                </Button>
            </div>
          </div>
        </div>
        
        {recoveryCodes.length > 0 && (
            <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Simpan Kode Pemulihan Ini:</p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-black/5 rounded-xl font-mono text-[10px]">
                    {recoveryCodes.map((code) => (
                        <div key={code}>{code}</div>
                    ))}
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between p-5 rounded-3xl bg-muted/30 border border-border/50">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-sm ${isEnabled ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
            {isEnabled ? <ShieldCheck size={24} strokeWidth={1.5} /> : <Shield size={24} strokeWidth={1.5} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Status 2FA</p>
                <Badge className={`rounded-lg text-[10px] font-bold ${isEnabled ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-none"}`}>
                    {isEnabled ? "Aktif" : "Nonaktif"}
                </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {isEnabled 
                ? "Akun Anda dilindungi oleh autentikasi dua faktor." 
                : "Tambahkan lapisan keamanan ekstra ke akun Anda."}
            </p>
          </div>
        </div>
        <Button 
            variant={isEnabled ? "ghost" : "default"} 
            size="sm" 
            onClick={isEnabled ? onDisable : onEnable}
            disabled={isSubmitting}
            className={`rounded-xl h-10 font-bold px-6 ${isEnabled ? "text-destructive hover:bg-destructive/10" : "bg-primary text-white"}`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isEnabled ? "Nonaktifkan" : "Aktifkan")}
        </Button>
      </div>

      {isEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowRecovery}
                className="h-12 rounded-2xl border-border/50 font-bold text-xs flex gap-2"
            >
                <Key size={16} strokeWidth={1.5} />
                Lihat Kode Pemulihan
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={onRegenerateRecovery}
                disabled={isSubmitting}
                className="h-12 rounded-2xl border-border/50 font-bold text-xs flex gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} strokeWidth={1.5} />}
                Buat Ulang Kode
            </Button>
        </div>
      )}

      {recoveryCodes.length > 0 && !isConfirming && (
          <div className="p-6 rounded-[2rem] bg-warning/5 border border-warning/10 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 text-warning">
                  <ShieldAlert size={20} strokeWidth={2} />
                  <p className="text-sm font-black">Kode Pemulihan Cadangan</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Simpan kode-kode ini di tempat yang aman. Kode ini dapat digunakan untuk mengakses akun Anda jika Anda kehilangan akses ke perangkat autentikasi Anda.
              </p>
              <div className="grid grid-cols-2 gap-3 p-5 bg-white rounded-2xl border border-warning/20 font-mono text-xs shadow-sm">
                  {recoveryCodes.map((code) => (
                      <div key={code} className="flex justify-between items-center group">
                          <span>{code}</span>
                          <button onClick={() => copyToClipboard(code)} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                              <Copy size={12} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
