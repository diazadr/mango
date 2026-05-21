"use client";

import {
    useState,
    useEffect,
    useCallback,
    useRef,
    use,
} from "react";

import api from "@/src/lib/http/axios";

import { useRouter } from "@/src/i18n/navigation";

import {
    Loader2,
    Calendar,
    Info,
    Save,
    X,
    Building2,
    MapPin,
    ArrowLeft,
    Upload,
    Wrench,
    ChevronLeft,
    ChevronRight,
    Clock3,
    BadgeDollarSign,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
    Alert,
    AlertDescription,
} from "@/src/components/ui/alert";

import { Badge } from "@/src/components/ui/badge";

import { Label } from "@/src/components/ui/label";

import { Input } from "@/src/components/ui/input";

import { Textarea } from "@/src/components/ui/textarea";

import { Separator } from "@/src/components/ui/separator";

import { DateTimePicker } from "@/src/components/ui/date-time-picker";
import { format } from "date-fns";

function calcDurationHours(
    start: string,
    end: string
): number {
    if (!start || !end)
        return 0;

    const diff =
        (
            new Date(
                end
            ).getTime() -
            new Date(
                start
            ).getTime()
        ) / 3600000;

    return Math.max(
        0,
        diff
    );
}

function formatRp(
    n: number
) {
    return (
        "Rp " +
        Number(
            n || 0
        ).toLocaleString(
            "id-ID"
        )
    );
}

function getOwnerLogo(machine: any) {
    if (!machine) return null;
    return (
        machine.owner_logo ||
        machine.owner_logo_url ||
        machine.owner?.logo_url ||
        machine.owner?.image_url ||
        null
    );
}

const HOUR_START = 6;
const HOUR_END = 22;
const TOTAL_HOURS =
    HOUR_END -
    HOUR_START;

const HOUR_MARKS = [
    6,
    9,
    12,
    15,
    18,
    21,
];

function pct(h: number) {
    return (
        ((h -
            HOUR_START) /
            TOTAL_HOURS) *
        100
    );
}

function clamp(
    v: number,
    min = 0,
    max = 100
) {
    return Math.min(
        max,
        Math.max(
            min,
            v
        )
    );
}

function MachineTimeline({
    schedule,
    selStart,
    selEnd,
}: {
    schedule: any[];
    selStart: string;
    selEnd: string;
}) {
    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const days =
        Array.from(
            {
                length: 7,
            },
            (
                _,
                i
            ) => {
                const d =
                    new Date(
                        today
                    );

                d.setDate(
                    d.getDate() +
                        i
                );

                return d;
            }
        );

    const slotsForDay =
        (
            day: Date
        ) =>
            schedule.filter(
                (
                    s
                ) => {
                    const sStart =
                        new Date(
                            s.start_time
                        ).getTime();

                    const sEnd =
                        new Date(
                            s.end_time
                        ).getTime();

                    const dStart =
                        day.getTime();

                    const dEnd =
                        dStart +
                        86400000;

                    return (
                        sStart <
                            dEnd &&
                        sEnd >
                            dStart
                    );
                }
            );

    const selBlock = (
        day: Date
    ) => {
        if (
            !selStart ||
            !selEnd
        )
            return null;

        const sS =
            new Date(
                selStart
            );

        const sE =
            new Date(
                selEnd
            );

        const dS =
            day.getTime();

        const dE =
            dS +
            86400000;

        if (
            sS.getTime() >=
                dE ||
            sE.getTime() <=
                dS
        )
            return null;

        const sh =
            sS.getHours() +
            sS.getMinutes() /
                60;

        const eh =
            sE.getHours() +
            sE.getMinutes() /
                60;

        return {
            left: clamp(
                pct(sh)
            ),
            width: clamp(
                pct(
                    eh
                ) -
                    pct(
                        sh
                    ),
                0,
                100 -
                    clamp(
                        pct(
                            sh
                        )
                    )
            ),
        };
    };

    const dayLabel = (
        d: Date
    ) =>
        d.toLocaleDateString(
            "id-ID",
            {
                weekday:
                    "short",
                day: "2-digit",
                month:
                    "short",
            }
        );

    const isToday = (
        d: Date
    ) =>
        d.toDateString() ===
        new Date().toDateString();

    return (
        <div className="space-y-2">
            
            <div className="ml-20 flex pr-1">
                
                {HOUR_MARKS.map(
                    (
                        h
                    ) => (
                        <div
                            key={
                                h
                            }
                            className="flex-1 text-center text-[9px] font-bold text-muted-foreground/60"
                        >
                            {h <
                            10
                                ? `0${h}`
                                : h}
                            :00
                        </div>
                    )
                )}
            </div>

            {days.map(
                (
                    day,
                    di
                ) => {
                    const slots =
                        slotsForDay(
                            day
                        );

                    const sel =
                        selBlock(
                            day
                        );

                    return (
                        <div
                            key={
                                di
                            }
                            className="flex items-center gap-3"
                        >
                            
                            <div
                                className={`w-20 shrink-0 text-[10px] font-bold leading-tight ${
                                    isToday(
                                        day
                                    )
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {dayLabel(
                                    day
                                )}
                            </div>

                            <div className="relative h-8 flex-1 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                                
                                {HOUR_MARKS.map(
                                    (
                                        h
                                    ) => (
                                        <div
                                            key={
                                                h
                                            }
                                            className="absolute top-0 h-full border-l border-border/40"
                                            style={{
                                                left: `${pct(
                                                    h
                                                )}%`,
                                            }}
                                        />
                                    )
                                )}

                                {slots.map(
                                    (
                                        s,
                                        si
                                    ) => {
                                        const sh =
                                            new Date(
                                                s.start_time
                                            ).getHours() +
                                            new Date(
                                                s.start_time
                                            ).getMinutes() /
                                                60;

                                        const eh =
                                            new Date(
                                                s.end_time
                                            ).getHours() +
                                            new Date(
                                                s.end_time
                                            ).getMinutes() /
                                                60;

                                        const l =
                                            clamp(
                                                pct(
                                                    sh
                                                )
                                            );

                                        const w =
                                            clamp(
                                                pct(
                                                    eh
                                                ) -
                                                    l,
                                                0,
                                                100 -
                                                    l
                                            );

                                        return (
                                            <div
                                                key={
                                                    si
                                                }
                                                className="absolute bottom-1 top-1 rounded-lg border border-destructive/20 bg-destructive/50"
                                                style={{
                                                    left: `${l}%`,
                                                    width: `${w}%`,
                                                }}
                                            />
                                        );
                                    }
                                )}

                                {sel && (
                                    <div
                                        className="absolute bottom-1 top-1 rounded-lg border border-primary/20 bg-primary/40"
                                        style={{
                                            left: `${sel.left}%`,
                                            width: `${sel.width}%`,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                }
            )}

            <div className="ml-20 mt-3 flex flex-wrap items-center gap-4">
                
                <div className="flex items-center gap-2">
                    
                    <div className="h-3 w-5 rounded bg-destructive/50" />

                    <span className="text-[10px] font-bold text-muted-foreground">
                        Terpakai
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    
                    <div className="h-3 w-5 rounded bg-primary/40" />

                    <span className="text-[10px] font-bold text-muted-foreground">
                        Pilihan Anda
                    </span>
                </div>
            </div>
        </div>
    );
}

import { useAuth } from "@/src/components/providers/AuthProvider";
import { useTranslations } from "next-intl";

export function ReservationDetailView({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
  const t = useTranslations("ReservationDetailView");
    const { id } =
        use(params);

    const { user } = useAuth();

    const router =
        useRouter();

    const [machine, setMachine] =
        useState<any>(
            null
        );

    const [
        machineSchedule,
        setMachineSchedule,
    ] = useState<any[]>(
        []
    );

    const [loading, setLoading] =
        useState(true);

    const [
        scheduleLoading,
        setScheduleLoading,
    ] = useState(true);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [status, setStatus] =
        useState<{
            type:
                | "success"
                | "destructive";
            message: string;
        } | null>(
            null
        );

    const [form, setForm] =
        useState({
            start_time:
                "",
            end_time:
                "",
            purpose:
                "",
            proposed_price:
                "",
        });

    const [
        designFile,
        setDesignFile,
    ] = useState<File | null>(
        null
    );

    const designFileRef =
        useRef<HTMLInputElement>(
            null
        );

    const [
        currentImageIndex,
        setCurrentImageIndex,
    ] = useState(0);

    const fetchData =
        useCallback(
            async () => {
                setLoading(
                    true
                );

                try {
                    const [
                        userRes,
                        machRes,
                    ] =
                        await Promise.all(
                            [
                                api.get(
                                    "/v1/me"
                                ),
                                api.get(
                                    `/v1/machines/${id}`
                                ),
                            ]
                        );

                    const userData =
                        userRes
                            .data
                            .data
                            ?.user ||
                        userRes
                            .data
                            .user;

                    const ownerType =
                        userData.roles?.includes(
                            "upt"
                        )
                            ? "App\\Models\\Master\\Organization"
                            : "App\\Models\\Umkm\\Umkm";

                    const ownerId =
                        userData.roles?.includes(
                            "upt"
                        )
                            ? userData
                                  .organizations?.[0]
                                  ?.id
                            : userData
                                  .umkm
                                  ?.id;

                    const m =
                        machRes
                            .data
                            .data;

                    m.is_mine =
                        m.owner_type ===
                            ownerType &&
                        m.owner_id ===
                            ownerId;

                    setMachine(
                        m
                    );
                } catch (
                    err
                ) {
                    console.error(
                        err
                    );

                    router.push(
                        "/workspace/reservations"
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            [id, router]
        );

    const fetchSchedule =
        useCallback(
            async () => {
                setScheduleLoading(
                    true
                );

                try {
                    const res =
                        await api.get(
                            `/v1/machines/${id}/schedule`
                        );

                    setMachineSchedule(
                        res
                            .data
                            .data ||
                            []
                    );
                } catch {
                    setMachineSchedule(
                        []
                    );
                } finally {
                    setScheduleLoading(
                        false
                    );
                }
            },
            [id]
        );

    useEffect(() => {
        fetchData();
        fetchSchedule();
    }, [
        fetchData,
        fetchSchedule,
    ]);

    const handleReserve =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            setSubmitting(
                true
            );

            setStatus(
                null
            );

            try {
                const fd =
                    new FormData();

                fd.append(
                    "machine_id",
                    id
                );

                fd.append(
                    "start_time",
                    form.start_time
                );

                fd.append(
                    "end_time",
                    form.end_time
                );

                fd.append(
                    "purpose",
                    form.purpose
                );

                if (
                    form.proposed_price
                ) {
                    fd.append(
                        "proposed_price",
                        form.proposed_price.replace(
                            /\D/g,
                            ""
                        )
                    );
                }

                if (
                    designFile
                ) {
                    fd.append(
                        "design_file",
                        designFile
                    );
                }

                await api.post(
                    "/v1/machines/reservations",
                    fd,
                    {
                        headers:
                            {
                                "Content-Type":
                                    "multipart/form-data",
                            },
                    }
                );

                setStatus(
                    {
                        type:
                            "success",
                        message:
                            "Permohonan reservasi berhasil dikirim.",
                    }
                );

                setTimeout(
                    () => {
                        router.push(
                            "/workspace/reservations/history"
                        );
                    },
                    1500
                );
            } catch (
                err: any
            ) {
                const errorData =
                    err
                        .response
                        ?.data;

                let message =
                    errorData?.message ||
                    "Gagal membuat reservasi.";

                if (
                    errorData?.errors
                ) {
                    const firstErrors =
                        Object.values(
                            errorData.errors
                        )[0] as string[];

                    if (
                        firstErrors?.[0]
                    ) {
                        message =
                            firstErrors[0];
                    }
                }

                setStatus(
                    {
                        type:
                            "destructive",
                        message,
                    }
                );

                setSubmitting(
                    false
                );
            }
        };

    if (loading) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
                
                <Loader2 className="h-8 w-8 animate-spin text-primary" />

                <p className="text-sm font-medium text-muted-foreground">
                    Memuat detail mesin...
                </p>
            </div>
        );
    }

    if (!machine)
        return null;

    const durationHours =
        calcDurationHours(
            form.start_time,
            form.end_time
        );

    const estimatedCost =
        durationHours *
        (machine.hourly_rate ||
            0);

    const images =
        machine.images &&
        machine.images
            .length > 0
            ? machine.images
            : machine.image_large ||
                machine.image_url ||
                machine.image
            ? [
                  {
                      id: "main",
                      url:
                          machine.image_large ||
                          machine.image_url ||
                          machine.image,
                  },
              ]
            : [];

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-6">
            
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                
                <Button
                    variant="outline"
                    className="h-11 rounded-xl border-border/50 px-5 font-semibold"
                    onClick={() =>
                        router.back()
                    }
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
            </div>

            {status && (
                <Alert
                    variant={
                        status.type
                    }
                >
                    {status.type ===
                    "success" ? (
                        <Calendar className="h-4 w-4" />
                    ) : (
                        <Info className="h-4 w-4" />
                    )}

                    <AlertDescription className="flex items-center justify-between">
                        {
                            status.message
                        }

                        {status.type !==
                            "success" && (
                            <button
                                onClick={() =>
                                    setStatus(
                                        null
                                    )
                                }
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                
                <div className="space-y-6 xl:col-span-7">
                    
                    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted/20 shadow-sm">
                        
                        {images.length >
                        0 ? (
                            <>
                                <img
                                    src={
                                        images[
                                            currentImageIndex
                                        ]
                                            .url
                                    }
                                    alt={
                                        machine.name
                                    }
                                    className="h-full w-full object-cover"
                                />

                                {images.length >
                                    1 && (
                                    <>
                                        <div className="absolute inset-y-0 left-0 flex items-center">
                                            
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="ml-4 rounded-xl border border-border/50 bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                                onClick={() =>
                                                    setCurrentImageIndex(
                                                        (
                                                            prev
                                                        ) =>
                                                            prev ===
                                                            0
                                                                ? images.length -
                                                                  1
                                                                : prev -
                                                                  1
                                                    )
                                                }
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="mr-4 rounded-xl border border-border/50 bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                                onClick={() =>
                                                    setCurrentImageIndex(
                                                        (
                                                            prev
                                                        ) =>
                                                            prev ===
                                                            images.length -
                                                                1
                                                                ? 0
                                                                : prev +
                                                                  1
                                                    )
                                                }
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                                
                                <Wrench className="mb-4 h-10 w-10 opacity-20" />

                                <p className="text-sm font-medium">
                                    Tidak ada foto mesin
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
                        
                        <div className="border-b border-border/50 bg-muted/10 px-6 py-5">
                            
                            <div className="flex flex-wrap items-center gap-2">
                                
                                <Badge
                                    variant="outline"
                                    className="rounded-lg border-primary/10 bg-primary/5 text-[10px] font-bold text-primary"
                                >
                                    {
                                        machine.type
                                    }
                                </Badge>

                                <Badge
                                    variant="outline"
                                    className="rounded-lg text-[10px]"
                                >
                                    {
                                        machine.code
                                    }
                                </Badge>
                            </div>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight">
                                {
                                    machine.name
                                }
                            </h1>

                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                                {
                                    machine.brand
                                }
                            </p>
                        </div>

                        <div className="space-y-6 p-6">
                            
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                
                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                    
                                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground">
                                        Kondisi
                                    </p>

                                    <p className="mt-2 text-sm font-semibold">
                                        {
                                            machine.condition_label
                                        }
                                    </p>
                                </div>

                                {machine.purchase_year && (
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground">
                                            Tahun
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {machine.purchase_year}
                                        </p>
                                    </div>
                                )}

                                {machine.dimensions && (
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground">
                                            Dimensi
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {machine.dimensions}
                                        </p>
                                    </div>
                                )}

                                {machine.power_consumption_watt && (
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground">
                                            Daya
                                        </p>
                                        <p className="mt-2 text-sm font-semibold">
                                            {machine.power_consumption_watt} W
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div>
                                
                                <p className="mb-3 text-[10px] font-bold tracking-wide text-muted-foreground">
                                    Deskripsi Mesin
                                </p>

                                <div className="rounded-xl border border-border/50 bg-muted/20 p-5 text-sm leading-relaxed text-foreground/80">
                                    {machine.description ||
                                        "Tidak ada deskripsi tambahan."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

<div className="space-y-6 xl:col-span-5">
    
    <div className="rounded-2xl border border-border/50 bg-card">
        
        <div className="flex items-center gap-4 p-6">
            
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                
                {getOwnerLogo(
                    machine
                ) ? (
                    <img
                        src={getOwnerLogo(
                            machine
                        )}
                        alt={t("alt_logo")}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                        PT
                    </div>
                )}
            </div>

            <div className="min-w-0">

                <p className="text-[11px] font-semibold text-muted-foreground">
                    {machine.is_mine ? "Kepemilikan" : "Penyedia"}
                </p>

                <h3 className="mt-1 truncate text-lg font-bold">
                    {machine.is_mine 
                        ? "Milik Anda Sendiri" 
                        : (machine.owner?.name || "Polman Bandung")}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    
                    <MapPin className="h-3 w-3 text-primary shrink-0" />

                    <span className="truncate">
                        {machine.location ||
                         machine.owner?.address ||
                         machine.owner?.city ||
                         machine.owner?.regency ||
                         "Lokasi tidak tersedia"}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        
        <div className="border-b border-border/50 bg-muted/10 px-6 py-5">
            
            <div className="flex items-center justify-between">
                
                <div>
                    
                    <p className="text-[11px] font-semibold text-primary">
                        Tarif Mesin
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-primary">
                        {formatRp(
                            machine.hourly_rate
                        )}
                    </h2>
                </div>

                <div className="h-14 w-20 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                    
                    {images.length >
                    0 ? (
                        <img
                            src={
                                images[
                                    currentImageIndex
                                ]
                                    .url
                            }
                            alt={
                                machine.name
                            }
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                            CNC
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6 p-6">
            
            {machine.is_mine ? (
                <Alert className="border-primary/20 bg-primary/5">
                    
                    <Info className="h-4 w-4 text-primary" />

                    <AlertDescription>
                        Ini adalah mesin milik Anda sendiri. Anda tidak dapat melakukan reservasi pada mesin milik sendiri.
                    </AlertDescription>
                </Alert>
            ) : (
                <form
                    onSubmit={
                        handleReserve
                    }
                    className="space-y-6"
                >
                    
                    <div className="space-y-3">
                        
                        <div className="flex items-center gap-2">
                            
                            <Clock3 className="h-4 w-4 text-primary" />

                            <p className="text-[11px] font-semibold text-primary">
                                Jadwal Mesin
                            </p>
                        </div>

                        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                            
                            {scheduleLoading ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    
                                    <Loader2 className="h-3 w-3 animate-spin" />

                                    Memuat jadwal...
                                </div>
                            ) : (
                                <MachineTimeline
                                    schedule={
                                        machineSchedule
                                    }
                                    selStart={
                                        form.start_time
                                    }
                                    selEnd={
                                        form.end_time
                                    }
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        
                        <div className="space-y-2">
                            
                            <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                                Mulai
                            </Label>

                            <DateTimePicker
                                includeTime
                                value={
                                    form.start_time ? new Date(form.start_time) : null
                                }
                                onChange={(
                                    d
                                ) =>
                                    setForm(
                                        {
                                            ...form,
                                            start_time:
                                                d ? format(d, "yyyy-MM-dd'T'HH:mm") : "",
                                        }
                                    )
                                }
                                className="h-11 rounded-xl border-border/50"
                            />
                        </div>

                        <div className="space-y-2">
                            
                            <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                                Selesai
                            </Label>

                            <DateTimePicker
                                includeTime
                                value={
                                    form.end_time ? new Date(form.end_time) : null
                                }
                                onChange={(
                                    d
                                ) =>
                                    setForm(
                                        {
                                            ...form,
                                            end_time:
                                                d ? format(d, "yyyy-MM-dd'T'HH:mm") : "",
                                        }
                                    )
                                }
                                className="h-11 rounded-xl border-border/50"
                            />
                        </div>
                    </div>

                    {durationHours >
                        0 && (
                        <div className="space-y-4 rounded-xl border border-primary/10 bg-primary/5 p-5">
                            
                            <div className="flex items-center justify-between text-sm">
                                
                                <span className="text-muted-foreground">
                                    Estimasi
                                </span>

                                <span className="font-semibold">
                                    {durationHours.toFixed(
                                        1
                                    )}{" "}
                                    Jam
                                </span>
                            </div>

                            <div className="flex items-end justify-between">
                                
                                <div>
                                    
                                    <p className="text-[11px] font-semibold text-primary">
                                        Total Biaya
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold text-primary">
                                        {formatRp(
                                            estimatedCost
                                        )}
                                    </h3>
                                </div>

                                <div className="h-12 w-16 overflow-hidden rounded-xl border border-primary/10 bg-background">
                                    
                                    {images.length >
                                    0 ? (
                                        <img
                                            src={
                                                images[
                                                    currentImageIndex
                                                ]
                                                    .url
                                            }
                                            alt={
                                                machine.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                            CNC
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                
                                <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                                    Penawaran Harga
                                </Label>

                                <Input
                                    type="text"
                                    placeholder={t("placeholder_opsional")}
                                    value={
                                        form.proposed_price
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setForm(
                                            {
                                                ...form,
                                                proposed_price:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                    className="h-11 rounded-xl border-border/50"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        
                        <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                            Deskripsi Produksi
                        </Label>

                        <Textarea
                            value={
                                form.purpose
                            }
                            onChange={(
                                e
                            ) =>
                                setForm(
                                    {
                                        ...form,
                                        purpose:
                                            e
                                                .target
                                                .value,
                                    }
                                )
                            }
                            placeholder={t("placeholder_jelaskan_kebutuhan_produksi")}
                            className="min-h-[120px] resize-none rounded-xl border-border/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        
                        <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                            File Desain
                        </Label>

                        <div
                            onClick={() =>
                                designFileRef.current?.click()
                            }
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-muted/10 px-4 py-4 transition-all ${
                                designFile
                                    ? "border-primary/30"
                                    : "border-border/50 hover:border-primary/20"
                            }`}
                        >
                            
                            <Upload className="h-4 w-4 text-primary" />

                            <div className="min-w-0 flex-1">
                                
                                {designFile ? (
                                    <p className="truncate text-xs font-semibold text-primary">
                                        {
                                            designFile.name
                                        }
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Upload file desain CAD / PDF
                                    </p>
                                )}
                            </div>

                            {designFile && (
                                <button
                                    type="button"
                                    onClick={(
                                        ev
                                    ) => {
                                        ev.stopPropagation();

                                        setDesignFile(
                                            null
                                        );
                                    }}
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <input
                            ref={
                                designFileRef
                            }
                            type="file"
                            className="hidden"
                            accept=".pdf,.zip,.step,.igs,.stl,.dxf,.dwg,image/*"
                            onChange={(
                                e
                            ) =>
                                setDesignFile(
                                    e
                                        .target
                                        .files?.[0] ||
                                        null
                                )
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            submitting ||
                            durationHours <
                                1
                        }
                        className="h-12 w-full rounded-xl font-semibold"
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}

                        Ajukan Reservasi
                    </Button>
                </form>
            )}
        </div>
    </div>
</div>
            </div>
        </div>
    );
}