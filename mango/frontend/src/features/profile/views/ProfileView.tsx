"use client";

import React, { useState } from "react";
import {
    Loader2, Calendar, Shield, CheckCircle2,
    AlertCircle, Phone, Mail, User, BadgeCheck, Landmark, Link as LinkIcon,
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
        { value: "overview", label: t("tabs.overview") || "Ringkasan" },
        { value: "security", label: "Keamanan" },
        { value: "settings", label: t("tabs.settings") || "Pengaturan" },
    ];

    // Cast to any for dynamic API properties not in the typed User interface
    const u = user as any;

    // Helper: mask email sebagian, misal ab***@gmail.com
    const maskEmail = (email: string) => {
        const [local, domain] = email.split("@");
        if (!domain) return email;
        const visible = local.slice(0, Math.min(2, local.length));
        return `${visible}***@${domain}`;
    };

    const handleSensitiveAction = (type: any) => {
        setConfirmModal({ isOpen: true, type });
    };

    const executeSensitiveAction = () => {
        switch (confirmModal.type) {
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
                    <div className="space-y-6 animate-in fade-in duration-500">

                        {/* HERO BANNER SECTION */}
                        <div className="relative bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                            <div className="h-32 bg-primary/10 w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-20"></div>
                                <div className="absolute -bottom-10 right-0 opacity-10 text-primary">
                                    <User size={180} />
                                </div>
                            </div>

                            <div className="px-6 pb-6 sm:px-8 relative">
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16 mb-2">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] shadow-xl overflow-hidden flex-shrink-0 relative z-10">
                                        <Avatar className="w-full h-full rounded-[1.2rem] relative bg-primary/5">
                                            {(user.avatar_large || user.avatar_url) ? (
                                                <AvatarImage src={user.avatar_large || user.avatar_url || ""} alt={user.name} className="z-20 h-full w-full rounded-[1.2rem] object-cover" />
                                            ) : (
                                                <AvatarFallback className="absolute inset-0 rounded-[1.2rem] bg-primary text-primary-foreground text-4xl font-black z-10 flex items-center justify-center">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </div>

                                    <div className="flex-1 pb-1 sm:pb-3 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{user.name}</h2>
                                            {user.email_verified_at && <BadgeCheck className="text-primary" size={24} strokeWidth={2} />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                                            {user.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone}</span>}
                                            {user.roles?.map((role: string) => (
                                                <Badge key={role} variant="outline" className="font-mono text-[10px] sm:text-xs tracking-wide bg-muted/30">
                                                    {role.replace("_", " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto pb-1 sm:pb-3">
                                        <Button className="w-full sm:w-auto shadow-sm font-bold rounded-xl h-11" onClick={() => setActiveTab("settings")}>
                                            <Settings size={18} className="mr-2" strokeWidth={2.5} /> Edit Profil
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                            {/* Left Column */}
                            <div className="flex flex-col gap-6">
                                <SectionCard title={t("title_detail_informasi_akun")} icon={BadgeCheck} className="rounded-xl border-border/50 shadow-sm h-full flex flex-col">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 py-2 flex-1">
                                        <InfoItem icon={User} label={t("label_nama_lengkap")} value={user.name} />
                                        <InfoItem icon={Hash} label={t("label_nomor_induk_nik")} value={u.nik || "Belum ditambahkan"} />
                                        <InfoItem icon={Calendar} label={t("label_tanggal_lahir")} value={u.dob ? new Date(u.dob).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Belum ditambahkan"} />
                                        <InfoItem icon={Shield} label={t("label_peran_utama")} value={user.roles?.[0]?.replace('_', ' ') || "Pengguna"} />
                                    </div>
                                    <div className="mt-auto border-t border-border/50 pt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                                <Calendar size={14} className="text-primary" strokeWidth={1.5} /> Bergabung sejak
                                            </span>
                                            <span className="text-xs font-semibold text-foreground">
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">
                                <SectionCard title={t("title_ringkasan_keamanan_akses")} icon={Shield} className="rounded-xl border-border/50 shadow-sm h-full flex flex-col">
                                    <div className="space-y-6 py-2 flex-1">
                                        {/* Verification Status */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-muted-foreground">{t("status_verifikasi_email")}</span>
                                                <span className="text-xs font-semibold text-foreground font-mono tracking-tight">{maskEmail(user.email)}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {user.email_verified_at ? (
                                                    <Badge className="bg-success/10 text-success border-success/20 rounded-md text-[10px] font-bold">
                                                        {t("verified_account")}
                                                    </Badge>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <Badge className="bg-warning/10 text-warning border-warning/20 rounded-md text-[10px] font-bold">
                                                            {t("unverified_account")}
                                                        </Badge>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={onResendVerification}
                                                            disabled={isSubmitting}
                                                            className="h-7 text-[10px] font-bold text-primary hover:text-primary/80"
                                                        >
                                                            {isSubmitting ? "Mengirim..." : "Verifikasi lagi"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Connected Business */}
                                        {user.umkm && (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-sm">
                                                <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center">
                                                    {u.umkm?.logo_url && !u.umkm.logo_url.includes("placeholders") ? (
                                                        <img
                                                            src={u.umkm.logo_large || u.umkm.logo_url}
                                                            alt={user.umkm.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.umkm.name)}&background=random&color=fff&size=128&bold=true`}
                                                            alt={user.umkm.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground leading-none truncate">{user.umkm.name}</p>
                                                    <p className="text-[10px] font-medium text-primary mt-1 truncate max-w-[200px]">{u.umkm?.sector}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2FA & Sessions */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-success/5 border border-success/10">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-success" strokeWidth={2} />
                                                    <p className="text-xs font-bold text-success">{t("sesi_aktif")}</p>
                                                </div>
                                                <p className="text-[10px] text-success/80 font-medium leading-relaxed">{sessions.length} perangkat terhubung</p>
                                            </div>
                                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("security")}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={16} className={u.two_factor_confirmed_at ? "text-primary" : "text-warning"} strokeWidth={2} />
                                                        <p className="text-xs font-bold text-foreground">{t("status_2fa")}</p>
                                                    </div>
                                                    <Settings size={12} className="text-muted-foreground" />
                                                </div>
                                                <p className={`text-[10px] font-medium leading-relaxed ${u.two_factor_confirmed_at ? 'text-primary/80' : 'text-warning/80'}`}>
                                                    {u.two_factor_confirmed_at ? "Aktif & aman" : "Nonaktif (rentan)"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>
                        </div>
                    </div>
                ) : activeTab === "security" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500 pb-10">
                        {/* Left Column */}
                        <div className="flex flex-col gap-8">
                            {/* 2FA Manager */}
                            <SectionCard title={t("title_autentikasi_dua_faktor_2fa")} icon={Key} className="shadow-sm border-border/50 rounded-xl">
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

                            {/* Delete Account */}
                            <SectionCard title={t("title_hapus_akun_permanen")} icon={Trash2} className="shadow-sm border-destructive/20 rounded-xl bg-destructive/5">
                                <div className="space-y-4 py-2">
                                    <p className="text-xs text-destructive/70 leading-relaxed text-left">
                                        Tindakan ini permanen. Seluruh data identitas UMKM, riwayat asesmen, dan dokumen akan dihapus selamanya dan tidak dapat dipulihkan.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-destructive/20 text-destructive font-bold text-xs hover:bg-destructive/5"
                                        onClick={() => handleSensitiveAction('delete_account')}
                                    >
                                        <Trash2 size={16} className="mr-2" /> Hapus akun permanen
                                    </Button>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-8">
                            {/* Session Manager */}
                            <SectionCard title={t("title_sesi_perangkat_aktif")} icon={Shield} className="shadow-sm border-border/50 rounded-xl">
                                <div className="space-y-4 py-2">
                                    {loadingSecurity ? (
                                        <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                                    ) : sessions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic text-center py-10">{t("tidak_ada_data_sesi_aktif")}</p>
                                    ) : (
                                        <>
                                            {sessions.map((session) => (
                                                <div key={session.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                                            {session.platform === 'Windows' || session.platform === 'Mac OS' ? <Settings size={18} strokeWidth={1.5} /> : <Phone size={18} strokeWidth={1.5} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-foreground">{session.browser} di {session.platform}</p>
                                                                {session.is_current_device && <Badge className="bg-success/10 text-success text-[10px] border-none">{t("perangkat_ini")}</Badge>}
                                                            </div>
                                                            <p className="text-[10px] font-medium text-muted-foreground tracking-tight">{session.ip_address} • Aktif {session.last_active}</p>
                                                        </div>
                                                    </div>
                                                    {!session.is_current_device && (
                                                        <Button variant="ghost" size="sm" onClick={() => onLogoutSession(session.id)} className="text-xs font-bold text-destructive hover:bg-destructive/10 h-8 px-3">
                                                            Putuskan
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}

                                            {sessions.length > 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleSensitiveAction('logout_others')}
                                                    className="w-full h-11 rounded-xl border-destructive/20 text-destructive font-bold text-xs hover:bg-destructive/5"
                                                >
                                                    <LogOut size={16} className="mr-2" strokeWidth={1.5} />
                                                    Keluar dari semua perangkat lain
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Activity Log */}
                            <SectionCard title={t("title_log_aktivitas_terbaru")} icon={Activity} className="shadow-sm border-border/50 rounded-xl">
                                <div className="space-y-6 py-2">
                                    {loadingSecurity ? (
                                        <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                                    ) : activityLog.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic text-center py-10">{t("belum_ada_aktivitas_tercatat")}</p>
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
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            <SectionCard title={t("title_ubah_profil_akun")} icon={User} className="rounded-xl shadow-sm border-border/50 h-full flex flex-col">
                                <div className="flex-1 py-4">
                                    <ProfileForm
                                        form={profileForm}
                                        onSubmit={onProfileSubmit}
                                        isSubmitting={isSubmitting}
                                        user={user}
                                        t={t}
                                    />
                                </div>
                            </SectionCard>

                            <SectionCard title={t("title_keamanan_password")} icon={Key} className="rounded-xl shadow-sm border-border/50 h-full flex flex-col">
                                <div className="flex-1 py-4">
                                    <PasswordForm
                                        form={passwordForm}
                                        onSubmit={onPasswordSubmit}
                                        isSubmitting={isSubmitting}
                                        t={t}
                                    />
                                </div>
                            </SectionCard>
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
