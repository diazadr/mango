"use client";

import React from "react";
import { 
  Clock, CheckCircle2, Building2, UserCheck, ChevronRight, User, ExternalLink, ShieldCheck, X 
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";

interface MentoringCardProps {
  request: any;
  isAdmin: boolean;
  departments: any[];
  advisors: any[];
  assigningDeptId: number | null;
  setAssigningDeptId: (id: number | null) => void;
  assigningAdvisorId: number | null;
  setAssigningAdvisorId: (id: number | null) => void;
  selectedDept: string;
  setSelectedDept: (id: string) => void;
  selectedAdvisor: string;
  setSelectedAdvisor: (id: string) => void;
  handleAssignDepartment: (id: number) => void;
  handleAssignAdvisor: (id: number) => void;
}

export const MentoringCard = ({
  request,
  isAdmin,
  departments,
  advisors,
  assigningDeptId,
  setAssigningDeptId,
  assigningAdvisorId,
  setAssigningAdvisorId,
  selectedDept,
  setSelectedDept,
  selectedAdvisor,
  setSelectedAdvisor,
  handleAssignDepartment,
  handleAssignAdvisor,
}: MentoringCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px] font-black uppercase"><Clock size={10} className="mr-1" /> Pending</Badge>;
      case 'assigned': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase"><CheckCircle2 size={10} className="mr-1" /> Assigned</Badge>;
      case 'ongoing': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-pulse text-[10px] font-black uppercase">Ongoing</Badge>;
      case 'done': return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-black uppercase">Selesai</Badge>;
      default: return <Badge variant="outline" className="text-[10px] font-black uppercase">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="p-6 flex-1 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary">{request.category}</Badge>
                  {getStatusBadge(request.status)}
                </div>
                <h3 className="text-lg font-bold text-primary uppercase tracking-tight line-clamp-1">{request.topic}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pengaju</p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Building2 size={12} className="text-primary" /> {request.umkm?.name}</p>
              </div>
              
              {request.department && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Delegasi Unit</p>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" /> {request.department.name}</p>
                </div>
              )}

              {request.mentor && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Advisor</p>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><UserCheck size={12} className="text-primary" /> {request.mentor.name}</p>
                </div>
              )}
            </div>
            
            {isAdmin && request.status === 'pending' && !request.department_id && (
              <div className="pt-4 border-t border-dashed border-border/50">
                {assigningDeptId === request.id ? (
                  <div className="space-y-3 p-3 bg-muted/30 rounded-xl">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Pilih Unit Delegasi</Label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold"
                      >
                        <option value="">-- Pilih Departemen --</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <Button size="sm" onClick={() => handleAssignDepartment(request.id)} className="h-9 px-4 bg-primary text-white text-[10px] font-black uppercase">Assign</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAssigningDeptId(null)} className="h-9 w-9 p-0 text-muted-foreground"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAssigningDeptId(request.id)} className="w-full h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[10px] gap-2">
                    Delegasikan ke Unit <ShieldCheck size={14} />
                  </Button>
                )}
              </div>
            )}

            {isAdmin && request.status === 'pending' && request.department_id && !request.mentor_user_id && (
              <div className="pt-4 border-t border-dashed border-border/50">
                {assigningAdvisorId === request.id ? (
                  <div className="space-y-3 p-3 bg-muted/30 rounded-xl">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Pilih Advisor</Label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedAdvisor} 
                        onChange={(e) => setSelectedAdvisor(e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold"
                      >
                        <option value="">-- Pilih Advisor --</option>
                        {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <Button size="sm" onClick={() => handleAssignAdvisor(request.id)} className="h-9 px-4 bg-primary text-white text-[10px] font-black uppercase">Assign</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAssigningAdvisorId(null)} className="h-9 w-9 p-0 text-muted-foreground"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAssigningAdvisorId(request.id)} className="w-full h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[10px] gap-2">
                    Tugaskan Advisor <UserCheck size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 sm:w-16 flex sm:flex-col items-center justify-center p-3 sm:p-0 gap-2 border-t sm:border-t-0 sm:border-l border-border/50 group-hover:bg-primary transition-colors group-hover:text-white text-muted-foreground">
             <ChevronRight size={20} className="hidden sm:block" />
             <ExternalLink size={18} className="sm:hidden" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
