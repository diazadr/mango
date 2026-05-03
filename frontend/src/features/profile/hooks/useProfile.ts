import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { profileService } from "../services/profileService";
import { 
  profileSchema, 
  passwordSchema, 
  ProfileFormData, 
  PasswordFormData 
} from "../schema/profileSchema";

export const useProfile = () => {
  const { user, refreshUser, logout } = useAuth();
  const t = useTranslations("ProfilePage");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);
  
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email_assessment: true,
    email_mentoring: true,
    email_system: true,
  });
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  // 2FA States
  const [showTwoFactorQrCode, setShowTwoFactorQrCode] = useState(false);
  const [twoFactorQrCode, setTwoFactorQrCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<any[]>([]);
  const [isConfirmingTwoFactor, setIsConfirmingTwoFactor] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      nik: user?.nik || "",
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const fetchSecurityData = useCallback(async () => {
    setLoadingSecurity(true);
    try {
      const [activityRes, sessionRes, notifyRes] = await Promise.all([
        profileService.getActivityLog(),
        profileService.getSessions(),
        profileService.getNotificationSettings(),
      ]);
      setActivityLog(activityRes.data.data);
      setSessions(sessionRes.data.data);
      setNotificationSettings(notifyRes.data.data);
    } catch (err) {
      console.error("Failed to fetch security data", err);
    } finally {
      setLoadingSecurity(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        nik: user.nik || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
      });
      fetchSecurityData();
    }
  }, [user, profileForm, fetchSecurityData]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      await profileService.updateProfile(data);
      await refreshUser();
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err: any) {
      const responseData = err.response?.data;
      setStatus({ type: "destructive", message: responseData?.message || "Failed to update profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      await profileService.updatePassword(data);
      passwordForm.reset();
      setStatus({ type: "success", message: "Password updated successfully." });
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        Object.keys(responseData.errors).forEach((key) => {
            passwordForm.setError(key as any, { message: responseData.errors[key][0] });
        });
      }
      setStatus({ type: "destructive", message: responseData?.message || "Failed to update password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      const res = await profileService.resendVerification();
      setStatus({ type: "success", message: res.data.message || "Link verifikasi telah dikirim." });
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal mengirim verifikasi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogoutSession = async (id: string) => {
    try {
        await profileService.logoutSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        setStatus({ type: "success", message: "Sesi berhasil dihentikan." });
    } catch (err) {
        setStatus({ type: "destructive", message: "Gagal menghentikan sesi." });
    }
  };

  const onLogoutOtherSessions = async (password: string) => {
    setIsSubmitting(true);
    try {
        await profileService.logoutOtherSessions(password);
        await fetchSecurityData();
        setStatus({ type: "success", message: "Berhasil keluar dari semua perangkat lain." });
        return true;
    } catch (err: any) {
        setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghentikan sesi lain." });
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const onDeleteAccount = async (password: string) => {
    setIsSubmitting(true);
    try {
        await profileService.deleteAccount(password);
        logout();
        return true;
    } catch (err: any) {
        setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghapus akun." });
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const onUpdateNotifications = async (settings: any) => {
    try {
        await profileService.updateNotificationSettings(settings);
        setNotificationSettings(settings);
        setStatus({ type: "success", message: "Pengaturan notifikasi disimpan." });
    } catch (err) {
        setStatus({ type: "destructive", message: "Gagal menyimpan pengaturan." });
    }
  };

  // 2FA Handlers
  const onEnableTwoFactor = async () => {
    setIsSubmitting(true);
    try {
        await profileService.enableTwoFactor();
        
        // Fetch QR Code
        const qrRes = await profileService.getTwoFactorQrCode();
        setTwoFactorQrCode(qrRes.data.svg);
        
        // Fetch Recovery Codes
        const recoveryRes = await profileService.getTwoFactorRecoveryCodes();
        setRecoveryCodes(recoveryRes.data);
        
        setIsConfirmingTwoFactor(true);
        await refreshUser();
    } catch (err: any) {
        setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal mengaktifkan 2FA." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onConfirmTwoFactor = async (code: string) => {
    setIsSubmitting(true);
    try {
        await profileService.confirmTwoFactor(code);
        setIsConfirmingTwoFactor(false);
        setTwoFactorQrCode(null);
        await refreshUser();
        setStatus({ type: "success", message: "2FA berhasil dikonfirmasi dan diaktifkan." });
    } catch (err: any) {
        setStatus({ type: "destructive", message: err.response?.data?.message || "Kode konfirmasi tidak valid." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onDisableTwoFactor = async () => {
    setIsSubmitting(true);
    try {
        await profileService.disableTwoFactor();
        await refreshUser();
        setStatus({ type: "success", message: "2FA dinonaktifkan." });
    } catch (err: any) {
        setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menonaktifkan 2FA." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onShowRecoveryCodes = async () => {
    try {
        const res = await profileService.getTwoFactorRecoveryCodes();
        setRecoveryCodes(res.data);
    } catch (err: any) {
        setStatus({ type: "destructive", message: "Gagal mengambil kode pemulihan." });
    }
  };

  const onRegenerateRecoveryCodes = async () => {
    setIsSubmitting(true);
    try {
        await profileService.regenerateTwoFactorRecoveryCodes();
        const res = await profileService.getTwoFactorRecoveryCodes();
        setRecoveryCodes(res.data);
        setStatus({ type: "success", message: "Kode pemulihan baru berhasil dibuat." });
    } catch (err: any) {
        setStatus({ type: "destructive", message: "Gagal membuat kode pemulihan baru." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return {
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
    
    onProfileSubmit: profileForm.handleSubmit(onProfileSubmit),
    onPasswordSubmit: passwordForm.handleSubmit(onPasswordSubmit),
    onResendVerification,
    onLogoutSession,
    onLogoutOtherSessions,
    onDeleteAccount,
    onUpdateNotifications,
    isSubmitting,
    status,
    setStatus,
    t,
  };
};
