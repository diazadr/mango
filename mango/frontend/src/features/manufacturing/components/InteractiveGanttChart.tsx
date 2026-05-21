import { useTranslations } from "next-intl";
import React, { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays, addDays, startOfDay, parseISO, isSameDay, max, min, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface GanttTask {
    id: number;
    code: string;
    title: string;
    machine_id: number | null;
    machine_name: string;
    status: string;
    color: string;
    start: string;
    end: string;
    target_quantity: number;
}

interface InteractiveGanttChartProps {
    tasks: GanttTask[];
    startDate: Date;
    endDate: Date;
    onTaskMove: (taskId: number, newStart: string, newEnd: string) => void;
}

const PIXELS_PER_DAY = 120;
const ROW_HEIGHT = 64;

export const InteractiveGanttChart: React.FC<InteractiveGanttChartProps> = ({
    tasks,
    startDate,
    endDate,
    onTaskMove,
}) => {
    const t = useTranslations("InteractiveGanttChart");
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter tasks that have valid start and end
    const validTasks = useMemo(() => {
        return tasks.filter(t => t.start && t.end);
    }, [tasks]);

    // Group tasks by machine
    const machines = useMemo(() => {
        const groups: Record<string, GanttTask[]> = {};
        validTasks.forEach(task => {
            const mName = task.machine_name || "Unassigned";
            if (!groups[mName]) groups[mName] = [];
            groups[mName].push(task);
        });
        return Object.entries(groups).map(([name, tasks]) => ({ name, tasks }));
    }, [validTasks]);

    // Calculate dates array
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const datesArray = Array.from({ length: totalDays }).map((_, i) => addDays(startDate, i));

    const handleDragEnd = (event: any, info: any, task: GanttTask) => {
        const offsetX = info.offset.x;
        const daysShifted = Math.round(offsetX / PIXELS_PER_DAY);
        
        if (daysShifted === 0) return;

        const originalStart = parseISO(task.start);
        const originalEnd = parseISO(task.end);
        
        const newStart = addDays(originalStart, daysShifted);
        const newEnd = addDays(originalEnd, daysShifted);

        onTaskMove(task.id, newStart.toISOString(), newEnd.toISOString());
    };

    return (
        <div className="flex border border-border/50 rounded-2xl overflow-hidden bg-background shadow-sm relative">
            {/* Left Sidebar (Machine Names) */}
            <div className="w-48 shrink-0 border-r border-border/50 bg-muted/20 z-20 sticky left-0">
                <div className="h-14 border-b border-border/50 flex items-center px-4 font-bold text-sm text-muted-foreground tracking-wider">
                    Mesin
                </div>
                {machines.map((machine, i) => (
                    <div 
                        key={i} 
                        className="flex items-center px-4 text-sm font-semibold text-foreground truncate"
                        style={{ height: ROW_HEIGHT }}
                    >
                        {machine.name}
                    </div>
                ))}
            </div>

            {/* Gantt Timeline Area */}
            <div className="flex-1 overflow-x-auto relative" ref={containerRef}>
                {/* Header (Dates) */}
                <div 
                    className="h-14 border-b border-border/50 flex bg-muted/10 sticky top-0 z-10"
                    style={{ width: totalDays * PIXELS_PER_DAY }}
                >
                    {datesArray.map((date, i) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div 
                                key={i} 
                                className={cn(
                                    "flex flex-col justify-center items-center shrink-0 border-r border-border/50 text-xs transition-colors",
                                    isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"
                                )}
                                style={{ width: PIXELS_PER_DAY }}
                            >
                                <span className={cn("font-bold", isToday && "text-primary")}>
                                    {format(date, "EEE", { locale: localeId })}
                                </span>
                                <span>{format(date, "d MMM")}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Grid Rows */}
                <div className="relative" style={{ width: totalDays * PIXELS_PER_DAY }}>
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {datesArray.map((_, i) => (
                            <div key={i} className="shrink-0 h-full border-r border-border/20 border-dashed" style={{ width: PIXELS_PER_DAY }} />
                        ))}
                    </div>

                    {/* Machine Rows */}
                    {machines.map((machine, rowIndex) => (
                        <div key={rowIndex} className="relative border-b border-border/50 hover:bg-muted/5 transition-colors" style={{ height: ROW_HEIGHT }}>
                            {machine.tasks.map(task => {
                                const startDt = parseISO(task.start);
                                const endDt = parseISO(task.end);
                                
                                // Calculate position
                                const diffStart = differenceInDays(startDt, startDate);
                                const duration = Math.max(1, differenceInDays(endDt, startDt) + 1);
                                
                                const left = diffStart * PIXELS_PER_DAY;
                                const width = duration * PIXELS_PER_DAY;

                                return (
                                    <TooltipProvider key={task.id} delayDuration={300}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <motion.div
                                                    drag="x"
                                                    dragMomentum={false}
                                                    dragElastic={0.1}
                                                    dragSnapToOrigin={true}
                                                    dragConstraints={containerRef}
                                                    onDragEnd={(e, info) => handleDragEnd(e, info, task)}
                                                    whileHover={{ scale: 1.02, zIndex: 10 }}
                                                    whileTap={{ scale: 0.98, cursor: "grabbing" }}
                                                    className="absolute top-2 bottom-2 rounded-lg cursor-grab shadow-sm border overflow-hidden flex flex-col justify-center px-3"
                                                    style={{ 
                                                        left, 
                                                        width: width - 8, // slight margin
                                                        backgroundColor: task.color + '20', // 20% opacity
                                                        borderColor: task.color + '50',
                                                        color: task.color,
                                                        borderLeftWidth: '4px',
                                                        borderLeftColor: task.color
                                                    }}
                                                >
                                                    <p className="text-xs font-bold truncate">{task.code}</p>
                                                    <p className="text-[10px] opacity-80 truncate">{task.title}</p>
                                                </motion.div>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-background/95 backdrop-blur border-border p-3 rounded-xl shadow-xl z-50">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm">{task.code}</p>
                                                        <Badge variant="outline" style={{ color: task.color, borderColor: task.color }}>{task.status}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{task.title}</p>
                                                    <div className="pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                                        <span className="text-muted-foreground">{t("mulai")}</span>
                                                        <span className="font-medium">{format(startDt, "d MMM yyyy")}</span>
                                                        <span className="text-muted-foreground">{t("selesai")}</span>
                                                        <span className="font-medium">{format(endDt, "d MMM yyyy")}</span>
                                                        <span className="text-muted-foreground">{t("target_qty")}</span>
                                                        <span className="font-medium">{task.target_quantity}</span>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                );
                            })}
                        </div>
                    ))}
                    
                    {/* Empty state padder */}
                    {machines.length === 0 && (
                        <div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height: ROW_HEIGHT * 3 }}>
                            Tidak ada jadwal di periode ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
