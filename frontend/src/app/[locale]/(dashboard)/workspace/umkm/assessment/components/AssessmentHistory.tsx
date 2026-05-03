"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/src/lib/http/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { 
  History, 
  ChevronRight, 
  Calendar, 
  Star, 
  FileText,
  Filter,
  X,
  Loader2
} from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminPagination, AdminToolbar } from "@/src/components/ui/dashboard/AdminDataView";

interface AssessmentHistoryProps {
  umkmId: number;
}

export default function AssessmentHistory({ umkmId }: AssessmentHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumbers, setPageNumbers] = useState<number[]>([]);

  // Filter State
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        umkm_id: umkmId.toString(),
        page: currentPage.toString(),
        per_page: "5",
      });

      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      if (status) params.append("status", status);

      const res = await api.get(`/v1/assessments?${params.toString()}`);
      setHistory(res.data.data);
      
      const meta = res.data.meta;
      if (meta) {
        setTotalPages(meta.last_page);
        setCurrentPage(meta.current_page);
        
        // Generate page numbers
        const pages = [];
        for (let i = 1; i <= meta.last_page; i++) {
          pages.push(i);
        }
        setPageNumbers(pages);
      }
    } catch (error) {
      console.error("Failed to fetch assessment history", error);
    } finally {
      setLoading(false);
    }
  }, [umkmId, currentPage, fromDate, toDate, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatus("");
    setCurrentPage(1);
  };

  return (
    <Card className="border-border/50 shadow-lg rounded-3xl overflow-hidden mt-12">
      <CardHeader className="bg-muted/30 border-b border-border/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <History size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Riwayat Assessment</CardTitle>
              <CardDescription>Daftar penilaian mandiri yang pernah Anda lakukan.</CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-background border rounded-xl px-3 py-1">
              <Calendar size={14} className="text-muted-foreground" />
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-xs outline-none"
              />
              <span className="text-muted-foreground text-xs">s/d</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-xs outline-none"
              />
            </div>
            
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-background border rounded-xl px-3 py-1.5 text-xs outline-none"
            >
              <option value="">Semua Status</option>
              <option value="submitted">Selesai</option>
              <option value="draft">Draft</option>
            </select>

            {(fromDate || toDate || status) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 w-8 p-0 rounded-full">
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Tidak ada riwayat assessment ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {history.map((item) => (
              <div key={item.id} className="p-6 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    item.total_score >= 4 ? 'bg-success/10 text-success' : 
                    item.total_score >= 2.5 ? 'bg-warning/10 text-warning' : 
                    'bg-destructive/10 text-destructive'
                  }`}>
                    <Star fill="currentColor" size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg">{item.level}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                        Skor: {item.total_score}
                      </Badge>
                      <Badge className={`${
                        item.status === 'submitted' ? 'bg-success/10 text-success border-success/20' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.status === 'submitted' ? 'Selesai' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {item.created_at ? format(new Date(item.created_at), "dd MMMM yyyy, HH:mm", { locale: id }) : "Tanggal tidak tersedia"}
                      </div>
                      {item.submitted_at && (
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          Submit: {format(new Date(item.submitted_at), "HH:mm")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Link href={`/workspace/umkm/assessment/${item.id}/result`}>
                  <Button variant="ghost" className="rounded-xl group gap-2 text-primary hover:text-primary/90 hover:bg-primary/5">
                    Lihat Detail
                    <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {!loading && totalPages > 1 && (
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
}
