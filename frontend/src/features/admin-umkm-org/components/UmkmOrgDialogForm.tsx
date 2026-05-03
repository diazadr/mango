"use client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Loader2 } from "lucide-react";

interface UmkmOrgDialogFormProps {
  form: UseFormReturn<UmkmOrganizationFormData>;
  uptList: any[];
  onSubmit: (data: UmkmOrganizationFormData) => void;
  isSubmitting: boolean;
  onClose: () => void;
  editingOrg: any;
  t: any;
  tc: any;
}

export function UmkmOrgDialogForm({
  form,
  uptList,
  onSubmit,
  isSubmitting,
  onClose,
  editingOrg,
  t,
  tc,
}: UmkmOrgDialogFormProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const currentUptId = watch("upt_id")?.toString();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingOrg ? "Edit Organisasi UMKM" : "Tambah Organisasi UMKM"}</DialogTitle>
          <DialogDescription>
            Kelola data organisasi payung untuk IKM/UMKM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="upt_id">UPT Pembina</Label>
            <Select
              value={currentUptId}
              onValueChange={(val) => setValue("upt_id", parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih UPT Pembina" />
              </SelectTrigger>
              <SelectContent>
                {uptList.map((upt) => (
                  <SelectItem key={upt.id} value={upt.id.toString()}>
                    {upt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.upt_id && (
              <p className="text-xs text-destructive">{errors.upt_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Organisasi</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Contoh: Koperasi Batik Jaya"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="org@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="08xxxxxxxx"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Jl. Raya No. 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Kota/Kabupaten</Label>
              <Input id="city" {...register("city")} placeholder="Contoh: Bandung" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <Input id="province" {...register("province")} placeholder="Contoh: Jawa Barat" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Kode Pos</Label>
              <Input id="postal_code" {...register("postal_code")} placeholder="12345" />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingOrg ? tc("update") : tc("create")}...
                </>
              ) : (
                editingOrg ? tc("update") : tc("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
