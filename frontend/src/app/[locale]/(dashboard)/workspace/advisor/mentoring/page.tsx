"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { GraduationCap, MessageSquare, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";

export default function AdvisorMentoringPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This endpoint should return requests assigned to this mentor
    api.get("/v1/mentoring/requests")
      .then((res) => setTasks(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardPageShell
      title="Tugas Mentoring"
      subtitle="Kelola bimbingan dan konsultasi aktif dengan mitra UMKM."
      icon={GraduationCap}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl">
          <p className="text-muted-foreground">Belum ada tugas mentoring yang ditugaskan kepada Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="border-border/50 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">{task.topic}</Badge>
                    <CardTitle className="text-primary">{task.umkm?.name || "Mitra UMKM"}</CardTitle>
                  </div>
                  <Badge variant="outline" className="capitalize">{task.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-foreground/80">{task.description}</p>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-xl gap-2"
                    onClick={() => router.push(`/workspace/advisor/mentoring/${task.id}`)}
                  >
                    <MessageSquare size={18} />
                    Buka Sesi
                  </Button>
                  <Button variant="outline" className="rounded-xl">Detail</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardPageShell>
  );
}
