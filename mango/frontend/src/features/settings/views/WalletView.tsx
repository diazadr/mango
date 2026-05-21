"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Wallet,
    Building2,
    CreditCard,
    ArrowDownToLine,
    Loader2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import api from "@/src/lib/http/axios";

interface BalanceData {
    balance: number;
    bank_code: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
}

interface Bank {
    name: string;
    code: string;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function WalletView() {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [noXenditAccount, setNoXenditAccount] = useState(false);

    // Form state
    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [amount, setAmount] = useState("");

    // Dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const PAYOUT_FEE = 5000;

    const fetchBalance = useCallback(async () => {
        setLoadingBalance(true);
        setError(null);
        setNoXenditAccount(false);
        try {
            const res = await api.get("/v1/payment/balance");
            const data = res.data.data;
            setBalance(data);
            // Pre-fill bank info if already saved
            if (data.bank_code) setBankCode(data.bank_code);
            if (data.bank_account_name) setAccountName(data.bank_account_name);
            if (data.bank_account_number) setAccountNumber(data.bank_account_number);
        } catch (err: unknown) {
            const status = (err as { response?: { status: number } })?.response?.status;
            if (status === 404) {
                setNoXenditAccount(true);
            } else {
                setError("Gagal memuat saldo. Pastikan koneksi Anda tersambung.");
            }
        } finally {
            setLoadingBalance(false);
        }
    }, []);

    const fetchBanks = useCallback(async () => {
        setLoadingBanks(true);
        try {
            const res = await api.get("/v1/payment/banks");
            setBanks(res.data.data ?? []);
        } catch {
            // silently fail, banks list not critical
        } finally {
            setLoadingBanks(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
        fetchBanks();
    }, [fetchBalance, fetchBanks]);

    const handlePayoutSubmit = async () => {
        setSubmitting(true);
        setSubmitError(null);
        try {
            await api.post("/v1/payment/payout", {
                amount: parseFloat(amount),
                bank_code: bankCode,
                bank_account_name: accountName,
                bank_account_number: accountNumber,
            });
            setSuccessMessage(`Penarikan ${formatRupiah(parseFloat(amount))} berhasil diproses. Dana akan masuk dalam 1-3 hari kerja.`);
            setShowConfirmDialog(false);
            setAmount("");
            fetchBalance();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setSubmitError(msg ?? "Penarikan gagal. Silakan coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    const totalDeduction = parseFloat(amount || "0") + PAYOUT_FEE;
    const isFormValid =
        bankCode && accountName && accountNumber &&
        parseFloat(amount) >= 10000 &&
        (balance?.balance ?? 0) >= totalDeduction;

    if (noXenditAccount) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Akun Pembayaran Belum Aktif</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Entitas Anda belum memiliki saldo Xendit. Akun akan otomatis terdaftar saat pertama kali Anda menerima pembayaran dari penyewa mesin.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/70 font-medium uppercase tracking-wide">Saldo Xendit</p>
                            {loadingBalance ? (
                                <div className="flex items-center gap-2 mt-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-white/70">Memuat saldo...</span>
                                </div>
                            ) : error ? (
                                <p className="text-red-200 text-sm mt-2">{error}</p>
                            ) : (
                                <p className="text-3xl font-bold tracking-tight mt-1">
                                    {formatRupiah(balance?.balance ?? 0)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <button
                                onClick={fetchBalance}
                                className="text-white/60 hover:text-white transition-colors"
                                title="Refresh saldo"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {!loadingBalance && !error && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-xs text-white/60">
                                Fee penarikan: <span className="text-white font-medium">{formatRupiah(PAYOUT_FEE)}</span> per transaksi (ditanggung PT)
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Success Message */}
            {successMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            {/* Payout Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                        Tarik Saldo ke Rekening Bank
                    </CardTitle>
                    <CardDescription>
                        Isi informasi rekening bank tujuan dan nominal penarikan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Bank Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            Bank Tujuan
                        </Label>
                        {loadingBanks ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Memuat daftar bank...
                            </div>
                        ) : (
                            <Select value={bankCode} onValueChange={setBankCode}>
                                <SelectTrigger id="bank_code">
                                    <SelectValue placeholder="Pilih bank..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {banks.length > 0 ? banks.map((bank) => (
                                        <SelectItem key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </SelectItem>
                                    )) : (
                                        // Fallback to popular banks
                                        [
                                            { code: "BCA", name: "BCA (Bank Central Asia)" },
                                            { code: "BNI", name: "BNI (Bank Negara Indonesia)" },
                                            { code: "BRI", name: "BRI (Bank Rakyat Indonesia)" },
                                            { code: "MANDIRI", name: "Bank Mandiri" },
                                            { code: "CIMB", name: "CIMB Niaga" },
                                            { code: "PERMATA", name: "Bank Permata" },
                                            { code: "BSI", name: "Bank Syariah Indonesia" },
                                        ].map((bank) => (
                                            <SelectItem key={bank.code} value={bank.code}>
                                                {bank.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Account Name */}
                    <div className="space-y-2">
                        <Label htmlFor="account_name">Atas Nama (sesuai buku tabungan)</Label>
                        <Input
                            id="account_name"
                            placeholder="Nama pemilik rekening"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                        />
                    </div>

                    {/* Account Number */}
                    <div className="space-y-2">
                        <Label htmlFor="account_number" className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            Nomor Rekening
                        </Label>
                        <Input
                            id="account_number"
                            placeholder="Contoh: 1234567890"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            inputMode="numeric"
                        />
                    </div>

                    <Separator />

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Nominal Penarikan (Rp)</Label>
                        <Input
                            id="amount"
                            placeholder="Minimal Rp 10.000"
                            value={amount ? new Intl.NumberFormat('id-ID').format(parseFloat(amount)) : ""}
                            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                            inputMode="numeric"
                        />
                        {amount && parseFloat(amount) >= 10000 && (
                            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nominal Transfer</span>
                                    <span className="font-medium">{formatRupiah(parseFloat(amount))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fee Penarikan</span>
                                    <span className="font-medium text-amber-600">- {formatRupiah(PAYOUT_FEE)}</span>
                                </div>
                                <Separator className="my-1" />
                                <div className="flex justify-between font-semibold">
                                    <span>Total Saldo Dikurangi</span>
                                    <span>{formatRupiah(totalDeduction)}</span>
                                </div>
                            </div>
                        )}
                        {amount && parseFloat(amount) < 10000 && (
                            <p className="text-xs text-destructive">Minimal penarikan adalah Rp 10.000</p>
                        )}
                        {amount && parseFloat(amount) >= 10000 && (balance?.balance ?? 0) < totalDeduction && (
                            <p className="text-xs text-destructive">
                                Saldo tidak cukup. Saldo Anda: {formatRupiah(balance?.balance ?? 0)}
                            </p>
                        )}
                    </div>

                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!isFormValid || loadingBalance}
                        onClick={() => {
                            setSubmitError(null);
                            setShowConfirmDialog(true);
                        }}
                    >
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Tarik Saldo Sekarang
                    </Button>
                </CardContent>
            </Card>

            {/* Confirm Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penarikan Saldo</DialogTitle>
                        <DialogDescription>
                            Pastikan informasi rekening bank sudah benar sebelum melanjutkan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="rounded-lg border p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bank</span>
                                <span className="font-medium">{bankCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Atas Nama</span>
                                <span className="font-medium">{accountName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">No. Rekening</span>
                                <span className="font-medium">{accountNumber}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nominal</span>
                                <span className="font-medium">{formatRupiah(parseFloat(amount))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fee (ditanggung PT)</span>
                                <span className="font-medium text-amber-600">- {formatRupiah(PAYOUT_FEE)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base pt-1">
                                <span>Saldo Terpotong</span>
                                <span>{formatRupiah(totalDeduction)}</span>
                            </div>
                        </div>

                        {submitError && (
                            <Alert variant="destructive">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>{submitError}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button
                            onClick={handlePayoutSubmit}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Ya, Tarik Saldo
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
