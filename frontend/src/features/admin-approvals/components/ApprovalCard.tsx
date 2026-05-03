"use client";

import React from "react";
import { Mail, UserCheck, UserX, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface ApprovalCardProps {
  member: any;
  isProcessing: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export const ApprovalCard = ({ member, isProcessing, onApprove, onReject }: ApprovalCardProps) => {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden rounded-3xl bg-white group">
      <CardHeader className="bg-muted/30 pb-4 border-b border-border/30">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
              {member.name?.[0].toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-primary uppercase tracking-tight">{member.name}</CardTitle>
              <CardDescription className="text-[10px] font-medium flex items-center gap-1">
                <Mail size={10} /> {member.email}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mendaftar Pada</p>
            <p className="text-xs font-bold text-foreground">
              {format(new Date(member.created_at), "dd MMM yyyy", { locale: localeId })}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Peran Sistem</p>
            <p className="text-xs font-bold text-primary uppercase">
              {member.roles?.[0]?.name || "UMKM"}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button 
            onClick={() => onApprove(member.id)}
            disabled={isProcessing}
            className="flex-1 bg-success hover:bg-success/90 text-white font-bold rounded-xl gap-2 h-11 shadow-lg shadow-success/20"
          >
            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <UserCheck size={18} />}
            Setujui
          </Button>
          <Button 
            variant="outline"
            onClick={() => onReject(member.id)}
            disabled={isProcessing}
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 font-bold rounded-xl gap-2 h-11"
          >
            <UserX size={18} />
            Tolak
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
