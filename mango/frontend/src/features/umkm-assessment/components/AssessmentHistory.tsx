"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { api } from "@/src/lib/http/axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";

import { Button } from "@/src/components/ui/button";

import {
  TrendingUp,
  Calendar,
  Trophy,
  ArrowRight,
  History,
  ClipboardCheck,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";

import { useRouter } from "@/src/i18n/navigation";

import {
  AdminPagination,
  AdminToolbar,
  AdminSearchFilter,
  AdminSelectFilter,
} from "@/src/components/ui/dashboard/AdminDataView";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";

import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";

import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";

import MaturityTrendChart from "./MaturityTrendChart";
import { useTranslations } from "next-intl";

interface AssessmentHistoryProps {
  umkmId: number;
}

export default function AssessmentHistory({
  umkmId,
}: AssessmentHistoryProps) {
  const t = useTranslations("AssessmentHistory");
  const [history, setHistory] = useState<any[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [levelFilter, setLevelFilter] =
    useState("all");

  const [sortKey, setSortKey] =
    useState("date");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const router = useRouter();

  const perPage = 10;

  const fetchHistory = useCallback(
    async (page: number) => {
      setLoading(true);

      try {
        const res = await api.get(
          `/v1/assessments?umkm_id=${umkmId}&page=${page}`
        );

        setHistory(res.data.data || []);

        setTotalPages(
          res.data.meta?.last_page || 1
        );
      } catch (err) {
        console.error(
          "Failed to fetch assessment history",
          err
        );

        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [umkmId]
  );

  useEffect(() => {
    fetchHistory(currentPage);
  }, [fetchHistory, currentPage]);

  const handleSort = (
    key: string
  ) => {
    if (sortKey === key) {
      setSortOrder((prev) =>
        prev === "asc"
          ? "desc"
          : "asc"
      );

      return;
    }

    setSortKey(key);
    setSortOrder("asc");
  };

const levelOptions = [
  {
    value: "all",
    label: "Semua Level",
  },
  {
    value: "1",
    label: "Level 1",
  },
  {
    value: "2",
    label: "Level 2",
  },
  {
    value: "3",
    label: "Level 3",
  },
  {
    value: "4",
    label: "Level 4",
  },
  {
    value: "5",
    label: "Level 5",
  },
];
  const filteredHistory = useMemo(() => {
    let data = [...history];

    if (searchTerm) {
      data = data.filter((item) => {
        return (
          String(item.level || "")
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||
          String(item.total_score || "")
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        );
      });
    }

if (levelFilter !== "all") {
  data = data.filter((item) => {
    const itemLevel = String(
      item.level || ""
    ).toLowerCase();

    return (
      itemLevel.includes(levelFilter) ||
      itemLevel.includes(
        `level ${levelFilter}`
      ) ||
      itemLevel.includes(
        `level_${levelFilter}`
      )
    );
  });
}

    data.sort((a, b) => {
      if (sortKey === "score") {
        return sortOrder === "asc"
          ? a.total_score -
              b.total_score
          : b.total_score -
              a.total_score;
      }

      const dateA = new Date(
        a.created_at
      ).getTime();

      const dateB = new Date(
        b.created_at
      ).getTime();

      return sortOrder === "asc"
        ? dateA - dateB
        : dateB - dateA;
    });

    return data;
  }, [
    history,
    searchTerm,
    levelFilter,
    sortKey,
    sortOrder,
  ]);

  const paginatedHistory =
    filteredHistory.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    );

  const trendData = useMemo(() => {
    return filteredHistory
      .map((h) => ({
        date: h.created_at,
        score: h.total_score,
        chart_data: h.chart_data,
      }))
      .reverse();
  }, [filteredHistory]);

  const pageNumbers = Array.from(
    {
      length: Math.ceil(
        filteredHistory.length /
          perPage
      ),
    },
    (_, i) => i + 1
  );

  const hasAssessment =
    !loading &&
    filteredHistory.length > 0;

  return (
    <div className="space-y-8">
      {filteredHistory.length > 1 && (
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Perkembangan Skor Maturity
                </CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Visualisasi progres kematangan UMKM dari waktu ke waktu.
                  Hover titik untuk melihat rincian dimensi.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <MaturityTrendChart data={trendData} />
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/10 px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <History className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    Riwayat Assessment
                  </CardTitle>
                  <div className="rounded-full border border-primary/10 bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
                    {filteredHistory.length} DATA
                  </div>
                </div>
                <CardDescription className="max-w-2xl text-sm leading-relaxed">
                  Riwayat perkembangan maturity assessment UMKM berdasarkan evaluasi digitalisasi dan kesiapan industri.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

<CardContent className="p-0">
  
  {loading ? (
    <div className="p-6">
      <LoadingState message={t("message_memuat_riwayat_assessment")} />
    </div>
  ) : history.length === 0 ? (
    <div className="p-8">
      <EmptyState
        icon={ClipboardCheck}
        title={t("title_belum_ada_assessment")}
        description={t("description_umkm_ini_belum_pernah_melakukan_assessme")}
      />
    </div>
  ) : (
    <>
      <div className="border-b border-border/50 p-5">
        
        <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <AdminSearchFilter
            placeholder={t("placeholder_cari_level_atau_skor_assessment")}
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            containerClassName="max-w-none md:flex-1"
          />

          <div className="flex flex-wrap items-center gap-3">
            
            <AdminSelectFilter
              label={t("label_level")}
              value={levelFilter}
              onChange={setLevelFilter}
              options={levelOptions}
            />

            <AdminSelectFilter
              label={t("label_urutkan")}
              value={`${sortKey}-${sortOrder}`}
              onChange={(v) => {
                const [key, order] =
                  v.split("-");

                setSortKey(key);

                setSortOrder(
                  order as
                    | "asc"
                    | "desc"
                );
              }}
              options={[
                {
                  value: "date-desc",
                  label:
                    "Tanggal Terbaru",
                },
                {
                  value: "date-asc",
                  label:
                    "Tanggal Terlama",
                },
                {
                  value: "score-desc",
                  label:
                    "Skor Tertinggi",
                },
                {
                  value: "score-asc",
                  label:
                    "Skor Terendah",
                },
              ]}
            />
          </div>
        </AdminToolbar>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            {filteredHistory.length} hasil
          </div>

          {levelFilter !==
            "all" && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
              <Filter className="h-3.5 w-3.5" />
              Level {levelFilter}
            </div>
          )}

          <div className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-3 py-2 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
            <Sparkles className="h-3.5 w-3.5" />
            Avg Score{" "}
            {filteredHistory.length >
            0
              ? Math.round(
                  filteredHistory.reduce(
                    (
                      acc,
                      item
                    ) =>
                      acc +
                      Number(
                        item.total_score ||
                          0
                      ),
                    0
                  ) /
                    filteredHistory.length
                )
              : 0}
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Search}
            title={t("title_data_tidak_ditemukan")}
            description={t("description_tidak_ada_data_assessment_yang_sesuai_de")}
          />
        </div>
      ) : (
        <>
          <AdminTable>
            
            <AdminTableHeader>
              
              <AdminTableRow>
                
                <SortableHeader
                  label={t("label_tanggal")}
                  sortKey="date"
                  currentSort={sortKey}
                  direction={sortOrder}
                  onSort={handleSort}
                />

                <AdminTableHeadCell>
                  Level
                </AdminTableHeadCell>

                <SortableHeader
                  label={t("label_total_skor")}
                  sortKey="score"
                  currentSort={sortKey}
                  direction={sortOrder}
                  onSort={handleSort}
                />

                <AdminTableHeadCell align="right">
                  Aksi
                </AdminTableHeadCell>
              </AdminTableRow>
            </AdminTableHeader>

            <AdminTableBody>
              {paginatedHistory.map(
                (item) => (
                  <AdminTableRow
                    key={item.id}
                  >
                    <AdminTableCell>
                      
                      <div className="flex items-center gap-3">
                        
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Calendar className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-semibold">
                            {new Date(
                              item.created_at
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month:
                                  "long",
                                year:
                                  "numeric",
                              }
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Assessment dilakukan
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>

                    <AdminTableCell>
                      
                      <div className="inline-flex items-center rounded-xl border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                        {item.level}
                      </div>
                    </AdminTableCell>

                    <AdminTableCell>
                      
                      <div className="flex items-center justify-center">
                        
                        <div className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-2">
                          
                          <Trophy className="h-4 w-4 text-yellow-500" />

                          <span className="text-base font-bold">
                            {
                              item.total_score
                            }
                          </span>
                        </div>
                      </div>
                    </AdminTableCell>

                    <AdminTableCell align="right">
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/workspace/umkm/assessment/${item.id}/result`
                          )
                        }
                        className="rounded-xl"
                      >
                        Detail

                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                )
              )}
            </AdminTableBody>
          </AdminTable>

          {pageNumbers.length >
            1 && (
            <div className="border-t border-border/50 p-4">
              <AdminPagination
                currentPage={
                  currentPage
                }
                totalPages={
                  pageNumbers.length
                }
                pageNumbers={
                  pageNumbers
                }
                onPageChange={
                  setCurrentPage
                }
              />
            </div>
          )}
        </>
      )}
    </>
  )}
</CardContent>
    </Card>
    </div>
  );
}