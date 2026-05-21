"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";
import { Loader2, HandshakeIcon, Building2, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface MentoringAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | null;
  departments: any[];
  advisors: any[];
  currentDeptId?: string;
  currentAdvisorId?: string;
  onAssign: (requestId: number, deptId: string, advisorId: string) => Promise<void>;
}

export function MentoringAssignmentDialog({
  open,
  onOpenChange,
  requestId,
  departments,
  advisors,
  currentDeptId,
  currentAdvisorId,
  onAssign,
}: MentoringAssignmentDialogProps) {
  const t = useTranslations("MentoringAssignmentDialog");
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>(currentDeptId || "");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>(currentAdvisorId || "");

  // Filter advisors based on selected department
  const filteredAdvisors = React.useMemo(() => {
    if (!selectedDept) return [];
    return advisors.filter((advisor) => 
      advisor.institutions?.some((inst: any) => String(inst.department_id) === selectedDept)
    );
  }, [advisors, selectedDept]);

  useEffect(() => {
    if (open) {
      setSelectedDept(currentDeptId || "");
      setSelectedAdvisor(currentAdvisorId || "");
    }
  }, [open, currentDeptId, currentAdvisorId]);

  // Reset advisor if department changes and current advisor is not in the new department
  useEffect(() => {
    if (selectedDept && selectedAdvisor) {
      const isStillValid = filteredAdvisors.some(a => String(a.id) === selectedAdvisor);
      if (!isStillValid) {
        setSelectedAdvisor("");
      }
    }
  }, [selectedDept, filteredAdvisors]);

  const handleAssign = async () => {
    if (!requestId || !selectedDept || !selectedAdvisor) return;
    setLoading(true);
    try {
      await onAssign(requestId, selectedDept, selectedAdvisor);
      onOpenChange(false);
    } catch (err) {
      console.error("Assignment failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HandshakeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{t("delegasi_mentoring")}</DialogTitle>
              <DialogDescription>
                Tugaskan departemen dan advisor untuk menangani permintaan ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <Building2 className="h-3 w-3" />
              Departemen Pelaksana
            </Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger>
                <SelectValue placeholder={t("placeholder_pilih_departemen")} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <UserCircle className="h-3 w-3" />
              Advisor / Mentor
            </Label>
            <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor} disabled={!selectedDept}>
              <SelectTrigger>
                <SelectValue placeholder={selectedDept ? "Pilih Advisor" : "Pilih Departemen terlebih dahulu"} />
              </SelectTrigger>
              <SelectContent>
                {filteredAdvisors.map((advisor) => (
                  <SelectItem key={advisor.id} value={String(advisor.id)}>
                    {advisor.name} ({advisor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={loading || !selectedDept || !selectedAdvisor}
            className="min-w-[120px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Simpan Delegasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
