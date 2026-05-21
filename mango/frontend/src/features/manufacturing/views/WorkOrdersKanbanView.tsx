"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Badge } from "@/src/components/ui/badge";
import { manufacturingService } from "@/src/features/manufacturing/services/manufacturingService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface WorkOrder {
    id: number;
    code: string;
    title: string;
    status: string;
    target_quantity: number;
    completed_quantity: number;
    priority: string;
    machine?: { name: string };
}

interface Column {
    id: string;
    title: string;
    items: WorkOrder[];
}

const COLUMNS: Record<string, string> = {
    draft: "Draft",
    released: "Released",
    in_progress: "In Progress",
    completed: "Completed",
};

const PRIORITY_MAP: Record<string, string> = {
    low: "text-muted-foreground",
    normal: "text-primary",
    high: "text-warning",
    urgent: "text-destructive",
};

export function WorkOrdersKanbanView({ 
    search, 
    machineFilter 
}: { 
    search: string; 
    machineFilter: string;
}) {
    const t = useTranslations("ManufacturingPage");
    const [columns, setColumns] = useState<Record<string, Column>>({});
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            // Load max to render on kanban
            const res = await manufacturingService.getWorkOrders({
                search: search || undefined,
                machine_id: machineFilter || undefined,
                per_page: 200, 
            });
            const data: WorkOrder[] = Array.isArray(res.data?.data) ? res.data?.data : (res.data?.data?.data ?? []);
            
            const cols: Record<string, Column> = {};
            Object.keys(COLUMNS).forEach(key => {
                cols[key] = { id: key, title: COLUMNS[key], items: [] };
            });

            data.forEach(wo => {
                if (cols[wo.status]) cols[wo.status].items.push(wo);
            });

            setColumns(cols);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load & Polling (Live Sync)
    useEffect(() => {
        loadOrders();
        const interval = setInterval(() => {
            loadOrders();
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [search, machineFilter]);

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        // Optimistic UI Update
        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];
        
        const [movedItem] = sourceItems.splice(source.index, 1);
        movedItem.status = destination.droppableId;
        
        if (source.droppableId === destination.droppableId) {
            sourceItems.splice(destination.index, 0, movedItem);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, items: sourceItems }
            });
        } else {
            destItems.splice(destination.index, 0, movedItem);
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, items: sourceItems },
                [destination.droppableId]: { ...destCol, items: destItems }
            });
        }

        // Backend Update
        try {
            await manufacturingService.updateWorkOrder(Number(draggableId), { status: destination.droppableId });
            toast.success(t("success_status_updated"));
        } catch (e: any) {
            toast.error(manufacturingService.parseErrors(e));
            loadOrders(); // Revert on failure
        }
    };

    if (loading && Object.keys(columns).length === 0) {
        return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="p-4 overflow-x-auto h-full min-h-[500px]">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 h-full items-start">
                    {Object.values(columns).map(column => (
                        <div key={column.id} className="w-80 shrink-0 bg-muted/30 rounded-xl flex flex-col border border-border/50">
                            <div className="p-4 border-b border-border/50 flex justify-between items-center">
                                <h3 className="font-bold text-sm text-foreground">{column.title}</h3>
                                <Badge variant="secondary" className="text-xs">{column.items.length}</Badge>
                            </div>
                            
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div 
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`p-3 space-y-3 flex-1 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-background border rounded-lg p-4 shadow-sm ${snapshot.isDragging ? 'shadow-lg border-primary ring-1 ring-primary/20 cursor-grabbing' : 'border-border hover:border-primary/50 cursor-grab'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs font-bold font-mono">{item.code}</span>
                                                            <span className={`text-[10px] font-bold ${PRIORITY_MAP[item.priority]}`}>{item.priority}</span>
                                                        </div>
                                                        <h4 className="text-sm font-medium leading-tight mb-3">{item.title}</h4>
                                                        <div className="flex justify-between items-end text-xs text-muted-foreground">
                                                            <span>{item.machine?.name || "No Machine"}</span>
                                                            <span className="font-mono bg-muted px-2 py-0.5 rounded">{item.completed_quantity} / {item.target_quantity}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
