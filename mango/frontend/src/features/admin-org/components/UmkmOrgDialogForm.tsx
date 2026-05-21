"use client";

import { useTranslations } from "next-intl";

import React from "react";

import { UseFormReturn } from "react-hook-form";

import { UmkmOrganizationFormData } from "../schema/umkmOrgSchema";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";

import { Input } from "@/src/components/ui/input";

import { Label } from "@/src/components/ui/label";

import { Loader2 } from "lucide-react";

interface UmkmOrgDialogFormProps {
    form: UseFormReturn<UmkmOrganizationFormData>;

    onSubmit: (
        data: UmkmOrganizationFormData
    ) => void;

    isSubmitting: boolean;

    onClose: () => void;

    editingOrg: any;

    t: any;

    tc: any;
}

export function UmkmOrgDialogForm({
    form,
    onSubmit,
    isSubmitting,
    onClose,
    editingOrg,
}: UmkmOrgDialogFormProps) {
    const t =
        useTranslations(
            "UmkmOrgDialogForm"
        );

    const tc =
        useTranslations(
            "DashboardCommon"
        );

    const {
        register,
        formState: {
            errors,
        },
    } = form;

    return (
        <Dialog
            open={true}
            onOpenChange={
                onClose
            }
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 p-0 sm:max-w-2xl">
                
                <DialogHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
                    
                    <DialogTitle className="text-xl font-bold">
                        {editingOrg
                            ? "Edit Organisasi UMKM"
                            : "Tambah Organisasi UMKM"}
                    </DialogTitle>

                    <DialogDescription className="mt-1">
                        {t(
                            "kelola_data_organisasi_payung_"
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(
                        onSubmit
                    )}
                    className="space-y-6 p-6"
                >
                    
                    <div className="space-y-2">
                        
                        <Label
                            htmlFor="name"
                            className="text-[11px] font-semibold text-muted-foreground"
                        >
                            {t(
                                "nama_organisasi"
                            )}
                        </Label>

                        <Input
                            id="name"
                            {...register(
                                "name"
                            )}
                            placeholder={t(
                                "contoh_koperasi_batik_jaya"
                            )}
                            className="h-11 rounded-xl border-border/50"
                        />

                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {
                                    errors
                                        .name
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        
                        <div className="space-y-2">
                            
                            <Label
                                htmlFor="email"
                                className="text-[11px] font-semibold text-muted-foreground"
                            >
                                {t(
                                    "email"
                                )}
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                {...register(
                                    "email"
                                )}
                                placeholder={t(
                                    "org_example_com"
                                )}
                                className="h-11 rounded-xl border-border/50"
                            />

                            {errors.email && (
                                <p className="text-xs text-destructive">
                                    {
                                        errors
                                            .email
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            
                            <Label
                                htmlFor="phone"
                                className="text-[11px] font-semibold text-muted-foreground"
                            >
                                {t(
                                    "nomor_telepon"
                                )}
                            </Label>

                            <Input
                                id="phone"
                                {...register(
                                    "phone"
                                )}
                                placeholder={t(
                                    "08xxxxxxxx"
                                )}
                                className="h-11 rounded-xl border-border/50"
                            />

                            {errors.phone && (
                                <p className="text-xs text-destructive">
                                    {
                                        errors
                                            .phone
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        
                        <Label
                            htmlFor="address"
                            className="text-[11px] font-semibold text-muted-foreground"
                        >
                            {t(
                                "alamat"
                            )}
                        </Label>

                        <Input
                            id="address"
                            {...register(
                                "address"
                            )}
                            placeholder={t(
                                "jl_raya_no_123"
                            )}
                            className="h-11 rounded-xl border-border/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        
                        <div className="space-y-2">
                            
                            <Label
                                htmlFor="city"
                                className="text-[11px] font-semibold text-muted-foreground"
                            >
                                {t(
                                    "kota_kabupaten"
                                )}
                            </Label>

                            <Input
                                id="city"
                                {...register(
                                    "city"
                                )}
                                placeholder={t(
                                    "contoh_bandung"
                                )}
                                className="h-11 rounded-xl border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            
                            <Label
                                htmlFor="province"
                                className="text-[11px] font-semibold text-muted-foreground"
                            >
                                {t(
                                    "provinsi"
                                )}
                            </Label>

                            <Input
                                id="province"
                                {...register(
                                    "province"
                                )}
                                placeholder={t(
                                    "contoh_jawa_barat"
                                )}
                                className="h-11 rounded-xl border-border/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        
                        <div className="space-y-2">
                            
                            <Label
                                htmlFor="postal_code"
                                className="text-[11px] font-semibold text-muted-foreground"
                            >
                                {t(
                                    "kode_pos"
                                )}
                            </Label>

                            <Input
                                id="postal_code"
                                {...register(
                                    "postal_code"
                                )}
                                placeholder={t(
                                    "12345"
                                )}
                                className="h-11 rounded-xl border-border/50"
                            />
                        </div>

                        <div className="flex items-end">
                            
                            <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-muted/10 px-4">
                                
                                <input
                                    type="checkbox"
                                    {...register(
                                        "is_active"
                                    )}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                />

                                <span className="text-sm font-medium">
                                    {t(
                                        "aktif"
                                    )}
                                </span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/50 pt-6">
                        
                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                onClose
                            }
                            disabled={
                                isSubmitting
                            }
                            className="h-11 rounded-xl border-border/50 font-semibold"
                        >
                            {tc(
                                "cancel"
                            )}
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isSubmitting
                            }
                            className="h-11 rounded-xl font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                    {editingOrg
                                        ? tc(
                                              "update"
                                          )
                                        : tc(
                                              "create"
                                          )}
                                    ...
                                </>
                            ) : editingOrg ? (
                                tc(
                                    "update"
                                )
                            ) : (
                                tc(
                                    "create"
                                )
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}