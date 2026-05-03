"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { BusinessProfileFormData } from "../schema/onboardingSchema";

interface BusinessProfileFormProps {
  form: UseFormReturn<BusinessProfileFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  onBack: () => void;
  t: any;
}

export const BusinessProfileForm = ({ form, onSubmit, isSubmitting, onBack, t }: BusinessProfileFormProps) => {
  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground">Profil Strategis</h3>
        
        <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("main_product")}</Label>
                <Input {...register("main_product")} placeholder={t("main_product_placeholder")} disabled={isSubmitting} className="h-10 rounded-lg" />
                {errors.main_product && <p className="text-xs font-medium text-destructive">{t(`errors.${errors.main_product.message}`)}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("market_target")}</Label>
                    <Input {...register("market_target")} placeholder={t("market_target_placeholder")} disabled={isSubmitting} className="h-10 rounded-lg" />
                    {errors.market_target && <p className="text-xs font-medium text-destructive">{t(`errors.${errors.market_target.message}`)}</p>}
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="flex-1 h-11 rounded-lg font-bold">
          {t("back")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 bg-primary rounded-lg font-bold">
          {isSubmitting ? <Loader2 className="animate-spin" /> : t("complete")}
        </Button>
      </div>
    </form>
  );
};
