"use client";

import React from "react";
import { 
    Landmark, Save, Loader2, School, 
    Mail, Phone, MapPin, Building2, Pencil, X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { useCampusInfo } from "../hooks/useCampusInfo";

interface OrgInfoViewProps {
  orgType?: "kampus" | "upt";
  pageTitle?: string;
  pageSubtitle?: string;
}

export function CampusInfoView({ orgType = "kampus", pageTitle, pageSubtitle }: OrgInfoViewProps) {
  const {
    campus,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    status,
    setStatus,
    form,
    onSubmit,
  } = useCampusInfo(orgType);

  const title = pageTitle || "Informasi kampus";
  const subtitle = pageSubtitle || "Kelola identitas resmi institusi dalam ekosistem MANGO.";
  const OrgIcon = Landmark;

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingState message="Sinkronisasi data institusi..." />
    </div>
  );

  if (!campus) return (
    <DashboardPageShell title={title} subtitle="Identitas institusi" icon={OrgIcon}>
        <EmptyState icon={School} title="Data tidak ditemukan" description="Data institusi tidak ditemukan atau Anda tidak memiliki akses." />
    </DashboardPageShell>
  );

  return (
    <DashboardPageShell
        title={title}
        subtitle={subtitle}
        icon={OrgIcon}
    >
        <div className="space-y-6">
            <StatusAlert status={status} onDismiss={() => setStatus(null)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
                {!isEditing ? (
                    <Card>
                        <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 size={18} className="text-primary" /> Profil institusi
                                </CardTitle>
                                <CardDescription>Detail identitas resmi yang terdaftar.</CardDescription>
                            </div>
                            <Button 
                                onClick={() => setIsEditing(true)}
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                            >
                                <Pencil size={14} /> Edit profil
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Nama institusi</p>
                                    <p className="text-base font-medium text-foreground">{campus.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Email resmi</p>
                                    <p className="text-sm text-foreground flex items-center gap-2">
                                        <Mail size={14} className="text-primary" /> {campus.email || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">No. telepon</p>
                                    <p className="text-sm text-foreground flex items-center gap-2">
                                        <Phone size={14} className="text-primary" /> {campus.phone || "—"}
                                    </p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground">Alamat lengkap</p>
                                    <div className="flex gap-2 items-start mt-1">
                                        <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            {campus.address || "Alamat belum diatur"}
                                            {campus.city && `, ${campus.city}`}
                                            {campus.province && `, ${campus.province}`}
                                            {campus.postal_code && ` ${campus.postal_code}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-primary/20 ring-2 ring-primary/5">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-primary flex items-center gap-2 text-base">
                                    <Pencil size={18} /> Edit informasi
                                </CardTitle>
                                <CardDescription>Perbarui data profil dan alamat institusi.</CardDescription>
                            </div>
                            <Button 
                                onClick={() => setIsEditing(false)}
                                variant="ghost" 
                                size="icon-sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                            >
                                <X size={18} />
                            </Button>
                        </CardHeader>
                        <form onSubmit={onSubmit}>
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Nama institusi</Label>
                                    <Input {...form.register("name")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all font-medium" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground">Email resmi</Label>
                                        <Input {...form.register("email")} type="email" className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground">No. telepon</Label>
                                        <Input {...form.register("phone")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Alamat jalan</Label>
                                    <Input {...form.register("address")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground">Kota / kab</Label>
                                        <Input {...form.register("city")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-muted-foreground">Provinsi</Label>
                                        <Input {...form.register("province")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <Label className="text-xs font-medium text-muted-foreground">Kode pos</Label>
                                        <Input {...form.register("postal_code")} className="h-10 rounded-lg bg-muted/30 border-transparent focus:bg-background transition-all" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 p-6 flex gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 gap-2"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan perubahan
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-primary text-primary-foreground border-primary/20 shadow-lg shadow-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold opacity-80 text-primary-foreground">Kartu identitas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-6">
                        <div className="flex flex-col items-center py-4">
                            <div className="w-24 h-24 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary-foreground/5 shadow-2xl">
                                <School size={48} className="text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-center tracking-tight">{campus.name}</h3>
                            <p className="text-xs font-medium opacity-60 mt-1 capitalize">{campus.type || orgType}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </DashboardPageShell>
  );
}
