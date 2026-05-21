<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Invoice Reservasi — MANGO Platform</title>
<style>
@page {
    size: A4 portrait;
    margin: 0mm 0mm 18mm 0mm;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'inter', 'DejaVu Sans', sans-serif;
    font-size: 10px;
    color: #334155;
    background: #ffffff;
    line-height: 1.55;
}

/* ─── FIXED FOOTER ─── */
.page-footer {
    position: fixed;
    bottom: -18mm;
    left: 0; right: 0;
    height: 18mm;
    border-top: 1px solid #e2e8f0;
    padding: 4mm 12mm 0 12mm;
}
.footer-inner {
    display: table;
    width: 100%;
}
.footer-left, .footer-right {
    display: table-cell;
    vertical-align: middle;
}
.footer-right { text-align: right; }
.footer-brand { font-size: 8px; font-weight: bold; color: #64748b; }
.footer-sub   { font-size: 7px; color: #94a3b8; margin-top: 1px; }

/* ─── HEADER BLOCK ─── */
.header {
    background: #1e3a5f;
    padding: 10mm 12mm 8mm 12mm;
    color: #ffffff;
}
.header-inner { display: table; width: 100%; }
.header-left, .header-right {
    display: table-cell;
    vertical-align: middle;
}
.header-right { text-align: right; width: 38%; }
.header-eyebrow {
    font-size: 7.5px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #93c5fd;
    margin-bottom: 4px;
}
.header-doc-no {
    font-size: 22px;
    font-weight: bold;
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin-bottom: 3px;
}
.header-machine {
    font-size: 10px;
    color: #bfdbfe;
    margin-bottom: 8px;
}
.status-pill {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 8px;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
}
.pill-approved  { background: #bbf7d0; color: #14532d; }
.pill-completed { background: #bbf7d0; color: #14532d; }
.pill-pending   { background: #fef3c7; color: #78350f; }
.pill-rejected  { background: #fee2e2; color: #7f1d1d; }
.pill-cancelled { background: #fee2e2; color: #7f1d1d; }
.header-logo-img { width: 32px; height: auto; opacity: 0.95; }
.header-date-label { font-size: 8px; color: #93c5fd; margin-top: 8px; }
.header-date-val   { font-size: 11px; font-weight: bold; color: #ffffff; }

/* ─── CONTENT ─── */
.content { padding: 8mm 12mm 4mm 12mm; }

/* ─── SECTION ─── */
.section { margin-bottom: 6mm; page-break-inside: avoid; }
.section-title {
    font-size: 8.5px;
    font-weight: bold;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 3px;
    margin-bottom: 4mm;
}

/* ─── INFO GRID ─── */
.info-grid { display: table; width: 100%; border-collapse: collapse; }
.info-cell {
    display: table-cell;
    width: 50%;
    padding: 0 3mm 3mm 0;
    vertical-align: top;
}
.info-label {
    font-size: 7.5px;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 0.5px;
    margin-bottom: 1.5px;
}
.info-value {
    font-size: 11px;
    font-weight: bold;
    color: #0f172a;
}
.info-sub {
    font-size: 9px;
    color: #64748b;
    margin-top: 1px;
}

/* ─── ITEMS TABLE ─── */
.items-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}
.items-table th {
    background: #f8fafc;
    padding: 3mm 3.5mm;
    font-size: 7.5px;
    font-weight: bold;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
}
.items-table td {
    padding: 3.5mm 3.5mm;
    font-size: 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
}
.items-table .num { text-align: right; }
.items-table .bold { font-weight: bold; color: #0f172a; }

.total-row td { background: #eff6ff; border-bottom: none; }
.total-label { font-size: 10px; font-weight: bold; color: #1e3a5f; text-align: right; }
.total-value { font-size: 16px; font-weight: bold; color: #1e3a5f; text-align: right; }

/* ─── STATUS COLOURS ─── */
.c-green  { color: #16a34a; font-weight: bold; }
.c-amber  { color: #d97706; font-weight: bold; }
.c-red    { color: #dc2626; font-weight: bold; }
.c-blue   { color: #1e3a5f; font-weight: bold; }

/* ─── QR + NOTE ROW ─── */
.bottom-row { display: table; width: 100%; }
.bottom-left, .bottom-right {
    display: table-cell;
    vertical-align: bottom;
}
.bottom-right { text-align: right; width: 100px; }
.note-box {
    border-left: 3px solid #cbd5e1;
    padding: 2.5mm 3.5mm;
    background: #f8fafc;
    font-size: 9px;
    color: #475569;
    line-height: 1.6;
}
.note-label { font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
.qr-wrap { border: 1px solid #e2e8f0; border-radius: 6px; padding: 3px; background: #fff; display: inline-block; }
.qr-caption { font-size: 7px; font-weight: bold; color: #94a3b8; text-align: center; margin-top: 2px; letter-spacing: 0.5px; text-transform: uppercase; }

/* ─── WATERMARK ─── */
.watermark {
    position: fixed;
    top: 38%; left: 8%;
    font-size: 100px;
    font-weight: bold;
    color: rgba(0,0,0,0.04);
    transform: rotate(-30deg);
    z-index: -1;
}
</style>
</head>
<body>

@php
    use Carbon\Carbon;
    $docNo     = 'INV-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT);
    $issued    = $reservation->created_at->timezone('Asia/Jakarta')->format('d M Y, H:i');
    $startDt   = $reservation->start_time ? Carbon::parse($reservation->start_time)->timezone('Asia/Jakarta') : null;
    $endDt     = $reservation->end_time   ? Carbon::parse($reservation->end_time)->timezone('Asia/Jakarta')   : null;
    $duration  = round($reservation->duration_hours ?? 0, 2);
    $price     = $reservation->quoted_price ?? 0;
    $isFree    = $price == 0;
    $ownerName = $reservation->machine->owner->name ?? '-';

    $statusLabel = ['approved'=>'Disetujui','completed'=>'Selesai','pending'=>'Menunggu','rejected'=>'Ditolak','cancelled'=>'Dibatalkan'][$reservation->status] ?? ucfirst($reservation->status);
    $statusPill  = 'pill-' . $reservation->status;

    $payLabel = ['paid'=>'Lunas','free'=>'Bebas Biaya','pending'=>'Belum Dibayar','processing'=>'Diproses'][$reservation->payment_status] ?? $reservation->payment_status;
    $payClass = in_array($reservation->payment_status, ['paid','free']) ? 'c-green' : (in_array($reservation->status, ['rejected','cancelled']) ? 'c-red' : 'c-amber');
@endphp

@if(in_array($reservation->status, ['pending','rejected','cancelled']))
<div class="watermark">{{ strtoupper($reservation->status) }}</div>
@endif

{{-- ── FOOTER ── --}}
<div class="page-footer">
    <div class="footer-inner">
        <div class="footer-left">
            <div class="footer-brand">MANGO Platform — Invoice Reservasi</div>
            <div class="footer-sub">Dokumen elektronik sah tanpa tanda tangan basah. Verifikasi via QR.</div>
        </div>
        <div class="footer-right">
            <div class="footer-sub">Dicetak: {{ now()->timezone('Asia/Jakarta')->format('d M Y, H:i') }} WIB</div>
        </div>
    </div>
</div>

{{-- ── HEADER ── --}}
<div class="header">
    <div class="header-inner">
        <div class="header-left">
            <div class="header-eyebrow">MANGO Platform &mdash; Invoice Reservasi Mesin</div>
            <div class="header-doc-no">{{ $docNo }}</div>
            <div class="header-machine">{{ $reservation->machine->name ?? '-' }} &middot; {{ $ownerName }}</div>
            <span class="status-pill {{ $statusPill }}">{{ $statusLabel }}</span>
        </div>
        <div class="header-right">
            @if(!empty($mangoLogoBase64))
                <img src="{{ $mangoLogoBase64 }}" class="header-logo-img" alt="MANGO"><br>
            @endif
            <div class="header-date-label">Tanggal Diterbitkan</div>
            <div class="header-date-val">{{ $issued }} WIB</div>
        </div>
    </div>
</div>

{{-- ── CONTENT ── --}}
<div class="content">

    {{-- Pihak-pihak --}}
    <div class="section">
        <div class="section-title">Informasi Pihak</div>
        <div class="info-grid">
            <div class="info-cell">
                <div class="info-label">Pemohon (UMKM)</div>
                <div class="info-value">{{ $reservation->requesterUmkm->name ?? '-' }}</div>
                <div class="info-sub">{{ $reservation->requesterUser->name ?? '-' }}</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Penyedia Mesin</div>
                <div class="info-value">{{ $ownerName }}</div>
                <div class="info-sub">{{ $reservation->machine->name ?? '-' }}</div>
            </div>
        </div>
    </div>

    {{-- Detail Reservasi --}}
    <div class="section">
        <div class="section-title">Detail Reservasi</div>
        <div class="info-grid">
            <div class="info-cell">
                <div class="info-label">Waktu Mulai</div>
                <div class="info-value">{{ $startDt ? $startDt->format('d M Y') : '-' }}</div>
                <div class="info-sub">{{ $startDt ? $startDt->format('H:i') . ' WIB' : '' }}</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Waktu Selesai</div>
                <div class="info-value">{{ $endDt ? $endDt->format('d M Y') : '-' }}</div>
                <div class="info-sub">{{ $endDt ? $endDt->format('H:i') . ' WIB' : '' }}</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Durasi</div>
                <div class="info-value">{{ $duration }} Jam</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Keperluan</div>
                <div class="info-value">{{ $reservation->purpose ?? '-' }}</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Status Reservasi</div>
                <div class="info-value {{ $payClass }}">{{ strtoupper($statusLabel) }}</div>
            </div>
            <div class="info-cell">
                <div class="info-label">Status Pembayaran</div>
                <div class="info-value {{ $payClass }}">{{ strtoupper($payLabel) }}</div>
            </div>
        </div>
    </div>

    {{-- Tagihan --}}
    <div class="section">
        <div class="section-title">Rincian Tagihan</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width:48%">Deskripsi</th>
                    <th style="width:14%; text-align:center">Durasi</th>
                    <th style="width:22%; text-align:right">Harga/Jam</th>
                    <th style="width:16%; text-align:right">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="bold">Penggunaan {{ $reservation->machine->name ?? '-' }}</td>
                    <td style="text-align:center">{{ $duration }} Jam</td>
                    <td class="num">
                        @if(!$isFree && $duration > 0)
                            Rp {{ number_format($price / $duration, 0, ',', '.') }}
                        @else &mdash; @endif
                    </td>
                    <td class="num">
                        @if($isFree) <span class="c-green">GRATIS</span>
                        @else Rp {{ number_format($price, 0, ',', '.') }} @endif
                    </td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" class="total-label">TOTAL TAGIHAN</td>
                    <td class="total-value">
                        @if($isFree) <span class="c-green">Rp 0</span>
                        @else Rp {{ number_format($price, 0, ',', '.') }} @endif
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    {{-- QR + Catatan --}}
    <div class="bottom-row" style="margin-top: 4mm;">
        <div class="bottom-left">
            @if($reservation->quotation_notes)
            <div class="note-box">
                <div class="note-label">Catatan</div>
                {{ $reservation->quotation_notes }}
            </div>
            @endif
        </div>
        <div class="bottom-right">
            @if(!empty($qrSvgBase64))
            <div class="qr-wrap">
                <img src="data:image/svg+xml;base64,{{ $qrSvgBase64 }}" width="80" height="80" alt="QR">
            </div>
            <div class="qr-caption">Scan Verifikasi</div>
            @endif
        </div>
    </div>

</div>
</body>
</html>
