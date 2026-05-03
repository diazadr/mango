"use client";

import React from "react";
import { Store, User as UserIcon, Calendar, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface UmkmCardProps {
  umkm: any;
  onViewAnalysis: (id: number) => void;
}

export const UmkmCard = ({ umkm, onViewAnalysis }: UmkmCardProps) => {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden group bg-card">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/30">
        <div className="flex justify-between items-start">
          <Badge variant={umkm.is_active ? "default" : "secondary"} className="rounded-md text-xs">
            {umkm.is_active ? "Aktif" : "Nonaktif"}
          </Badge>
          <div className="p-2 rounded-lg bg-background shadow-sm text-primary">
            <Store size={14} />
          </div>
        </div>
        <div className="pt-2">
          <CardTitle className="text-base font-semibold text-foreground truncate">{umkm.name}</CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <UserIcon size={12} className="text-primary" /> {umkm.owner_name}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Sektor</p>
            <p className="text-sm text-foreground">{umkm.sector}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Karyawan</p>
            <p className="text-sm text-foreground">{umkm.employee_count} orang</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border/50 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={12} /> {umkm.established_year}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewAnalysis(umkm.id)}
            className="h-8 text-primary hover:text-primary/90 text-xs gap-1.5 px-3 rounded-lg hover:bg-primary/5"
          >
            Analisis <Activity size={12} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
