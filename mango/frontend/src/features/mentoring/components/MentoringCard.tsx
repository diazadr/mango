"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { 
  Clock, CheckCircle2, Building2, UserCheck, ChevronRight, User, ExternalLink, ShieldCheck, X, Eye
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { useRouter } from "@/src/i18n/navigation";

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
  userRole?: 'umkm' | 'advisor' | 'admin';
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
  userRole,
}: MentoringCardProps) => {
    const t = useTranslations("MentoringCard");

  const router = useRouter();

  const detailPath = isAdmin 
    ? `/workspace/advisor/mentoring/${request.id}`
    : `/workspace/umkm/mentoring/${request.id}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px] font-semibold"><Clock size={10} className="mr-1" />{t("pending")}</Badge>;
      case 'assigned': return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold"><CheckCircle2 size={10} className="mr-1" />{t("assigned")}</Badge>;
      case 'ongoing': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 animate-pulse text-[10px] font-semibold">{t("ongoing")}</Badge>;
      case 'done': return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold">{t("selesai")}</Badge>;
      default: return <Badge variant="outline" className="text-[10px] font-semibold">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden group bg-card">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="p-6 flex-1 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] font-semibold tracking-wider border-primary/20 text-primary">{request.category}</Badge>
                  {getStatusBadge(request.status)}
                </div>
                <h3 className="text-lg font-bold text-primary tracking-tight line-clamp-1">{request.topic}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider">{t("pengaju")}</p>
                {isAdmin || request.mentor_user_id ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5 cursor-pointer hover:underline">
                        <Building2 size={12} /> {request.umkm?.name} <ExternalLink size={10} />
                      </p>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{t("detail_umkm_assesment")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t("profil_usaha")}</Label>
                          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                            <p><strong>{t("nama")}</strong> {request.umkm?.name}</p>
                            <p><strong>{t("sektor")}</strong> {request.umkm?.sector || '-'}</p>
                            <p><strong>{t("lokasi")}</strong> {request.umkm?.regency || '-'}, {request.umkm?.province || '-'}</p>
                            <p><strong>{t("tahun_berdiri")}</strong> {request.umkm?.established_year || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t("hasil_assesment_terakhir")}</Label>
                          <div className="bg-muted/50 p-3 rounded-lg text-sm">
                            {request.umkm?.assessment_results?.length > 0 ? (
                              <div className="space-y-2">
                                {request.umkm.assessment_results.slice(0, 1).map((result: any) => (
                                  <div key={result.id}>
                                    <p className="font-bold">{result.assessment_title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Skor: {result.score}</Badge>
                                      <span className="text-xs text-muted-foreground">{new Date(result.completed_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground italic">{t("belum_ada_data_assesment")}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Building2 size={12} className="text-primary" /> {request.umkm?.name}
                  </p>
                )}
              </div>
              
              {request.department && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wider flex items-center justify-between">
                    <span>{t("delegasi_unit")}</span>
                    {isAdmin && (request.status === 'pending' || request.status === 'assigned') && assigningDeptId !== request.id && (
                      <button onClick={() => setAssigningDeptId(request.id)} className="text-primary hover:underline lowercase text-[9px] bg-primary/10 px-1.5 py-0.5 rounded">{t("edit")}</button>
                    )}
                  </div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" /> {request.department.name}</p>
                </div>
              )}

              {request.assignments?.[0]?.mentor && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wider flex items-center justify-between">
                    <span>{t("advisor")}</span>
                    {isAdmin && (request.status === 'pending' || request.status === 'assigned') && assigningAdvisorId !== request.id && (
                      <button onClick={() => setAssigningAdvisorId(request.id)} className="text-primary hover:underline lowercase text-[9px] bg-primary/10 px-1.5 py-0.5 rounded">{t("edit")}</button>
                    )}
                  </div>
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><UserCheck size={12} className="text-primary" /> {request.assignments[0].mentor.name}</p>
                </div>
              )}
            </div>
            
            {isAdmin && (request.status === 'pending' || request.status === 'assigned') && (!request.department_id || assigningDeptId === request.id) && (
              <div className="pt-4 border-t border-dashed border-border/50">
                {assigningDeptId === request.id ? (
                  <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">{t("pilih_unit_delegasi")}</Label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">{t("pilih_departemen")}</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <Button size="sm" onClick={() => handleAssignDepartment(request.id)} className="h-10 px-4 bg-primary text-white text-sm font-bold">{t("simpan")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAssigningDeptId(null)} className="h-10 w-10 p-0 text-muted-foreground"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAssigningDeptId(request.id)} className="w-full h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold text-sm gap-2">{t("delegasikan_ke_unit")}<ShieldCheck size={16} />
                  </Button>
                )}
              </div>
            )}

            {isAdmin && (request.status === 'pending' || request.status === 'assigned') && request.department_id && (!request.assignments?.[0]?.mentor || assigningAdvisorId === request.id) && (
              <div className="pt-4 border-t border-dashed border-border/50">
                {assigningAdvisorId === request.id ? (
                  <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/50">
                    <Label className="text-xs font-bold text-muted-foreground mb-1 block">{t("pilih_advisor")}</Label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedAdvisor} 
                        onChange={(e) => setSelectedAdvisor(e.target.value)}
                        className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">{t("pilih_advisor_1")}</option>
                        {advisors.filter(a => {
                          if (!request.department_id) return true;
                          return a.institutions?.some((inst: any) => inst.department_id === request.department_id);
                        }).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <Button size="sm" onClick={() => handleAssignAdvisor(request.id)} className="h-10 px-4 bg-primary text-white text-sm font-bold">{t("simpan")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAssigningAdvisorId(null)} className="h-10 w-10 p-0 text-muted-foreground"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setAssigningAdvisorId(request.id)} className="w-full h-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold text-sm gap-2">{t("tugaskan_advisor")}<UserCheck size={16} />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => router.push(detailPath)}
            className="bg-muted/10 sm:w-16 flex sm:flex-col items-center justify-center p-3 sm:p-0 gap-1.5 border-t sm:border-t-0 sm:border-l border-border/50 group-hover:bg-primary transition-colors group-hover:text-white text-muted-foreground"
          >
            <Eye size={18} className="hidden sm:block" />
            <span className="hidden sm:block text-[10px] font-semibold tracking-wider">{t("detail")}</span>
            <ExternalLink size={18} className="sm:hidden" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
