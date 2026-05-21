"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { InteractiveGanttChart, GanttTask } from "../components/InteractiveGanttChart";
import { manufacturingService } from "../services/manufacturingService";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export const ScheduleView = () => {
    const t = useTranslations("ManufacturingPage");
    const [tasks, setTasks] = useState<GanttTask[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Default to current month
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState(endOfMonth(new Date()));

    const fetchSchedule = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const res = await manufacturingService.getSchedule({
                from: startDate.toISOString(),
                to: endDate.toISOString(),
            });
            setTasks(res.data?.data?.items || []);
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
            if (showLoader) toast.error(t("error_load"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule(true);

        const interval = setInterval(() => {
            fetchSchedule(false);
        }, 10000); // Live-Sync every 10s

        return () => clearInterval(interval);
    }, [startDate, endDate]);

    const handleTaskMove = async (taskId: number, newStart: string, newEnd: string) => {
        // Optimistic UI Update
        const previousTasks = [...tasks];
        setTasks(current => 
            current.map(task => 
                task.id === taskId 
                    ? { ...task, start: newStart, end: newEnd }
                    : task
            )
        );

        try {
            await manufacturingService.updateWorkOrder(taskId, {
                planned_start_at: newStart,
                planned_end_at: newEnd
            });
            toast.success(t("success_schedule_updated"));
        } catch (error) {
            console.error("Failed to update work order:", error);
            toast.error(t("error_save"));
            // Revert on failure
            setTasks(previousTasks);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("schedule_title")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("schedule_subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 border rounded-xl shadow-sm bg-background flex items-center gap-2 text-sm font-medium">
                        <CalendarIcon size={16} className="text-primary" />
                        Periode Bulan Ini
                    </div>
                </div>
            </div>

            {loading && tasks.length === 0 ? (
                <div className="min-h-[400px] flex items-center justify-center border border-border/50 rounded-2xl bg-muted/10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <InteractiveGanttChart 
                    tasks={tasks}
                    startDate={startDate}
                    endDate={endDate}
                    onTaskMove={handleTaskMove}
                />
            )}
        </div>
    );
};
