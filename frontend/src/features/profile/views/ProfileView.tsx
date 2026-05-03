"use client";

import React, { useState } from "react";
import { 
    Loader2, Calendar, Shield, CheckCircle2, 
    AlertCircle, Phone, Mail, User, BadgeCheck, Landmark, Link as LinkIcon, Building2,
    Activity, Settings, Globe, LogOut, Trash2, Key, Hash
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { ProfileForm, PasswordForm } from "../components/ProfileForms";
import { LocaleSwitcher } from "../components/LocaleSwitcher";
import { TwoFactorManager } from "../components/TwoFactorManager";
import { ConfirmPasswordModal } from "../components/ConfirmPasswordModal";
import { useProfile } from "../hooks/useProfile";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

export function ProfileView() {
  const [activeTab, setActiveTab] = useState<"overview" | "security" | "settings">("overview");
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: "2fa_enable" | "2fa_disable" | "2fa_show_recovery" | "2fa_regenerate" | "logout_others" | "delete_account" | null }>({
    isOpen: false,
    type: null
  });

  const { 
    user, 
    profileForm, 
    passwordForm, 
    activityLog,
    sessions,
    notificationSettings,
    loadingSecurity,
    
    // 2FA
    twoFactorQrCode,
    recoveryCodes,
    isConfirmingTwoFactor,
    onEnableTwoFactor,
    onConfirmTwoFactor,
    onDisableTwoFactor,
    onShowRecoveryCodes,
    onRegenerateRecoveryCodes,

    onProfileSubmit, 
    onPasswordSubmit, 
    onResendVerification,
    onLogoutSession,
    onLogoutOtherSessions,
    onDeleteAccount,
    onUpdateNotifications,
    isSubmitting, 
    status, 
    setStatus,
    t 
  } = useProfile();

  if (!user) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  const tabs = [
    { value: "overview", label: t("tabs.overview") || "Ikhtisar" },
    { value: "security", label: "Keamanan" },
    { value: "settings", label: t("tabs.settings") || "Pengaturan" },
  ];

  const handleSensitiveAction = (type: any) => {
    setConfirmModal({ isOpen: true, type });
  };

  const executeSensitiveAction = () => {
    switch(confirmModal.type) {
        case '2fa_enable': onEnableTwoFactor(); break;
        case '2fa_disable': onDisableTwoFactor(); break;
        case '2fa_show_recovery': onShowRecoveryCodes(); break;
        case '2fa_regenerate': onRegenerateRecoveryCodes(); break;
        case 'logout_others': handleLogoutOthers(); break;
        case 'delete_account': handleDeleteAccount(); break;
    }
  };

  const handleLogoutOthers = async () => {
    const pass = (document.getElementById('confirm-password-input') as HTMLInputElement)?.value;
    await onLogoutOtherSessions(pass);
  };

  const handleDeleteAccount = async () => {
    const pass = (document.getElementById('confirm-password-input') as HTMLInputElement)?.value;
    await onDeleteAccount(pass);
  };

  return (
    <DashboardPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<TabSwitch tabs={tabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as any)} />}
    >
      <div className="space-y-8">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 items-stretch">
            
            {/* Left Sidebar: Profile Identity */}
            <div className="lg:col-span-4 h-full">
              <div className="bg-white border border-border/50 rounded-[2.5rem] p-10 shadow-sm h-full flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-primary/5" />
                
                <div className="relative z-10 w-32 h-32 bg-white rounded-[2.5rem] mb-8 mt-6 overflow-hidden border-2 border-white shadow-md">
                  <Avatar className="w-full h-full rounded-[2rem] relative">
                    <AvatarImage src={user.avatar_large || user.avatar_url || ""} alt={user.name} className="z-20" />
                    <AvatarFallback className="absolute inset-0 bg-primary text-primary-foreground text-5xl font-black z-10 flex items-center justify-center">
                        {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="relative z-10 space-y-2 w-full mb-8">
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">{user.name}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{user.email}</p>
                </div>

                <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-10">
                  {user.roles?.map((role: string) => (
                    <Badge key={role} variant="outline" className="rounded-xl font-semibold px-4 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] tracking-tight">
                      {role.replace("_", " ").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  ))}
                </div>

                <div className="w-full space-y-6 text-left mt-auto">
                    <Separator className="opacity-50 mb-6" />
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Akses akun</span>
                            <div className="flex flex-col items-end gap-2">
                                {user.email_verified_at ? (
                                    <Badge className="bg-success/10 text-success border-success/20 rounded-lg text-[10px] font-semibold">
                                        {t("verified_account")}
                                    </Badge>
                                ) : (
                                    <>
                                        <Badge className="bg-warning/10 text-warning border-warning/20 rounded-lg text-[10px] font-semibold">
                                            {t("unverified_account")}
                                        </Badge>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            onClick={onResendVerification}
                                            disabled={isSubmitting}
                                            className="h-auto p-0 text-[10px] font-bold text-primary hover:text-primary/80"
                                        >
                                            {isSubmitting ? "Mengirim..." : "Verifikasi email lagi"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar size={14} className="text-primary" strokeWidth={1.5} /> Bergabung sejak
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                            </span>
                        </div>

                        {user.umkm && (
                            <div className="pt-4 space-y-2">
                                <span className="text-xs font-bold text-muted-foreground tracking-tight">Bisnis terhubung</span>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Building2 size={16} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground leading-none">{user.umkm.name}</p>
                                        <p className="text-[10px] font-medium text-primary mt-1">{user.umkm.sector}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>

            {/* Right Content: Symmetrical Blocks */}
            <div className="lg:col-span-8 grid grid-cols-1 gap-8">
              {/* Top Block: Account Details */}
              <SectionCard title="Detail informasi akun" icon={BadgeCheck} className="shadow-sm border-border/50 rounded-[2.5rem]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 py-2">
                  <InfoItem icon={User} label="Nama lengkap" value={user.name} />
                  <InfoItem icon={Mail} label="Alamat email" value={user.email} />
                  <InfoItem icon={Phone} label="Nomor telepon / WhatsApp" value={user.phone || "Belum ditambahkan"} />
                  <InfoItem icon={Shield} label="Peran utama" value={user.roles?.[0]?.replace('_', ' ') || "Pengguna"} />
                  <InfoItem icon={Hash} label="Nomor Induk Kependudukan (NIK)" value={user.nik || "Belum ditambahkan"} />
                  <InfoItem icon={Calendar} label="Tanggal lahir" value={user.dob ? new Date(user.dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Belum ditambahkan"} />
                </div>
              </SectionCard>

              {/* Bottom Block: Security Summary */}
              <SectionCard title="Ringkasan keamanan" icon={Shield} className="shadow-sm border-border/50 rounded-[2.5rem]">
                <div className="space-y-6 py-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-white shadow-sm text-primary">
                                <Activity size={18} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Aktivitas terakhir</p>
                                <p className="text-xs text-muted-foreground">
                                    {activityLog[0] ? `${activityLog[0].description} pada ${new Date(activityLog[0].created_at).toLocaleString('id-ID')}` : "Tidak ada aktivitas tercatat."}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("security")} className="text-xs font-bold text-primary">
                            Lihat semua
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-5 rounded-3xl bg-success/5 border border-success/10">
                            <div className="p-2 rounded-xl bg-success/10 text-success mt-1">
                                <CheckCircle2 size={18} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-success">Sesi aktif</p>
                                <p className="text-xs text-success/70 leading-relaxed">Terdeteksi {sessions.length} perangkat yang terhubung.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary mt-1">
                                <Shield size={18} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-primary">Status 2FA</p>
                                <p className="text-xs text-primary/70 leading-relaxed">
                                    {user.two_factor_confirmed_at ? "Aktif & terlindungi" : "Nonaktif (rentan)"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : activeTab === "security" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-8">
                {/* 2FA Manager */}
                <SectionCard title="Autentikasi dua faktor (2FA)" icon={Key} className="shadow-sm border-border/50 rounded-[2.5rem]">
                    <TwoFactorManager 
                        user={user}
                        qrCode={twoFactorQrCode}
                        recoveryCodes={recoveryCodes}
                        isConfirming={isConfirmingTwoFactor}
                        isSubmitting={isSubmitting}
                        onEnable={() => handleSensitiveAction('2fa_enable')}
                        onConfirm={onConfirmTwoFactor}
                        onDisable={() => handleSensitiveAction('2fa_disable')}
                        onShowRecovery={() => handleSensitiveAction('2fa_show_recovery')}
                        onRegenerateRecovery={() => handleSensitiveAction('2fa_regenerate')}
                    />
                </SectionCard>

                {/* Session Manager */}
                <SectionCard title="Sesi perangkat aktif" icon={Shield} className="shadow-sm border-border/50 rounded-[2.5rem]">
                    <div className="space-y-4 py-2">
                        {loadingSecurity ? (
                            <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                        ) : sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-10">Tidak ada data sesi aktif.</p>
                        ) : (
                            <>
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white shadow-sm text-primary">
                                                {session.platform === 'Windows' || session.platform === 'Mac OS' ? <Settings size={20} strokeWidth={1.5} /> : <Phone size={20} strokeWidth={1.5} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-foreground">{session.browser} di {session.platform}</p>
                                                    {session.is_current_device && <Badge className="bg-success/10 text-success text-[10px] border-none">Perangkat ini</Badge>}
                                                </div>
                                                <p className="text-[10px] font-medium text-muted-foreground tracking-tight">{session.ip_address} • Aktif {session.last_active}</p>
                                            </div>
                                        </div>
                                        {!session.is_current_device && (
                                            <Button variant="ghost" size="sm" onClick={() => onLogoutSession(session.id)} className="text-xs font-bold text-destructive hover:bg-destructive/10">
                                                Putuskan
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {sessions.length > 1 && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleSensitiveAction('logout_others')}
                                        className="w-full h-12 rounded-2xl border-destructive/20 text-destructive font-bold text-xs hover:bg-destructive/5"
                                    >
                                        <LogOut size={16} className="mr-2" strokeWidth={1.5} />
                                        Keluar dari semua perangkat lain
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </SectionCard>

                <SectionCard title="Log aktivitas terbaru" icon={Activity} className="shadow-sm border-border/50 rounded-[2.5rem]">
                    <div className="space-y-6 py-2">
                        {loadingSecurity ? (
                            <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                        ) : activityLog.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-10">Belum ada aktivitas tercatat.</p>
                        ) : (
                            activityLog.map((log, idx) => (
                                <div key={log.id} className="flex gap-4 relative">
                                    {idx !== activityLog.length - 1 && <div className="absolute left-[19px] top-10 w-[1px] h-full bg-border" />}
                                    <div className="z-10 p-2.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                    </div>
                                    <div className="pb-8">
                                        <p className="text-sm font-bold text-foreground capitalize">{log.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(log.created_at).toLocaleString('id-ID', { 
                                                day: 'numeric', month: 'long', year: 'numeric', 
                                                hour: '2-digit', minute: '2-digit' 
                                            })}
                                            {log.ip_address && ` • IP: ${log.ip_address}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 space-y-4 text-center">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                        <Shield size={24} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-bold text-primary">Tips keamanan</h4>
                    <p className="text-xs text-primary/70 leading-relaxed text-center">
                        Selalu periksa daftar sesi aktif. Jika Anda melihat perangkat yang tidak dikenal, segera putuskan sesi tersebut dan ubah kata sandi Anda.
                    </p>
                </div>

                <div className="bg-destructive/5 border border-destructive/10 rounded-[2.5rem] p-8 space-y-4">
                    <div className="p-3 rounded-2xl bg-destructive/10 text-destructive w-fit">
                        <Trash2 size={24} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-bold text-destructive text-left">Hapus akun</h4>
                    <p className="text-xs text-destructive/70 leading-relaxed text-left">
                        Tindakan ini permanen. Seluruh data identitas UMKM, riwayat asesmen, dan dokumen akan dihapus selamanya.
                    </p>
                    <Button 
                        variant="destructive" 
                        className="w-full rounded-xl h-11 font-bold shadow-lg shadow-destructive/20"
                        onClick={() => handleSensitiveAction('delete_account')}
                    >
                        Hapus akun permanen
                    </Button>
                </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="bg-white border border-border/50 rounded-[2.5rem] p-10 shadow-sm flex flex-col h-full">
                    <h3 className="text-xl font-bold text-foreground mb-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary"><User size={24} strokeWidth={1.5} /></div>
                        Ubah profil akun
                    </h3>
                    <div className="flex-1">
                        <ProfileForm 
                        form={profileForm} 
                        onSubmit={onProfileSubmit} 
                        isSubmitting={isSubmitting} 
                        user={user}
                        t={t} 
                        />
                    </div>
                </div>

                <div className="bg-white border border-border/50 rounded-[2.5rem] p-10 shadow-sm flex flex-col h-full">
                    <h3 className="text-xl font-bold text-foreground mb-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-warning/10 text-warning"><Shield size={24} strokeWidth={1.5} /></div>
                        Keamanan password
                    </h3>
                    <div className="flex-1">
                        <PasswordForm 
                        form={passwordForm} 
                        onSubmit={onPasswordSubmit} 
                        isSubmitting={isSubmitting} 
                        t={t} 
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-white border border-border/50 rounded-[2.5rem] p-10 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Globe size={24} strokeWidth={1.5} /></div>
                        {t("language_preference")}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-8 leading-relaxed text-left">
                        {t("select_language")}
                    </p>
                    <LocaleSwitcher t={t} />
                </div>

                <div className="bg-white border border-border/50 rounded-[2.5rem] p-10 shadow-sm">
                    <h3 className="text-xl font-bold text-foreground mb-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-success/10 text-success"><Mail size={24} strokeWidth={1.5} /></div>
                        Preferensi notifikasi email
                    </h3>
                    <div className="space-y-6">
                        <NotificationToggle 
                            title="Laporan asesmen" 
                            description="Kirim notifikasi email setiap kali asesmen kematangan industri selesai diproses."
                            enabled={notificationSettings.email_assessment}
                            onChange={(v) => onUpdateNotifications({...notificationSettings, email_assessment: v})}
                        />
                        <Separator className="opacity-50" />
                        <NotificationToggle 
                            title="Jadwal mentoring" 
                            description="Dapatkan pengingat email untuk sesi konsultasi dan jadwal pendampingan mendatang."
                            enabled={notificationSettings.email_mentoring}
                            onChange={(v) => onUpdateNotifications({...notificationSettings, email_mentoring: v})}
                        />
                        <Separator className="opacity-50" />
                        <NotificationToggle 
                            title="Pembaruan sistem" 
                            description="Terima informasi mengenai fitur baru, pemeliharaan sistem, dan pengumuman platform."
                            enabled={notificationSettings.email_system}
                            onChange={(v) => onUpdateNotifications({...notificationSettings, email_system: v})}
                        />
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmPasswordModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={executeSensitiveAction}
        title={
            confirmModal.type === 'delete_account' ? 'Konfirmasi hapus akun' : 
            confirmModal.type === 'logout_others' ? 'Konfirmasi logout lainnya' : 
            'Konfirmasi keamanan'
        }
      />
    </DashboardPageShell>
  );
}

function NotificationToggle({ title, description, enabled, onChange }: { title: string, description: string, enabled: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground max-w-md">{description}</p>
            </div>
            <button 
                onClick={() => onChange(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="flex-shrink-0">
        <div className="p-3.5 rounded-[1.25rem] bg-muted/50 border border-border/50 text-primary/70">
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground/60 tracking-tight">{label}</p>
        <p className="text-base font-semibold text-foreground leading-tight truncate">{value || "-"}</p>
      </div>
    </div>
  );
}
