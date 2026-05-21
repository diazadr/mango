<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Hasil Assessment INDI 4.0 — MANGO Platform</title>
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
.footer-inner { display: table; width: 100%; }
.footer-left, .footer-right { display: table-cell; vertical-align: middle; }
.footer-right { text-align: right; }
.footer-brand { font-size: 8px; font-weight: bold; color: #64748b; }
.footer-sub   { font-size: 7px; color: #94a3b8; margin-top: 1px; }

/* ─── HEADER ─── */
.header {
    background: #1e3a5f;
    padding: 10mm 12mm 8mm 12mm;
    color: #ffffff;
}
.header-inner { display: table; width: 100%; }
.header-left, .header-right { display: table-cell; vertical-align: middle; }
.header-right { text-align: right; width: 36%; }
.header-eyebrow { font-size: 7.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #93c5fd; margin-bottom: 4px; }
.header-title  { font-size: 20px; font-weight: bold; letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 3px; }
.header-sub    { font-size: 10px; color: #bfdbfe; margin-bottom: 8px; }
.header-badge  {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 8px; font-weight: bold;
    letter-spacing: 1px; text-transform: uppercase;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: #fff;
}
.header-logo-img { width: 32px; height: auto; margin-bottom: 6px; }
.header-doc-label { font-size: 8px; color: #93c5fd; }
.header-doc-val   { font-size: 11px; font-weight: bold; color: #fff; margin-bottom: 4px; }

/* ─── CONTENT ─── */
.content { padding: 8mm 12mm 4mm 12mm; }

/* ─── SECTION ─── */
.section { margin-bottom: 6mm; page-break-inside: avoid; }
.section-title {
    font-size: 8.5px; font-weight: bold; color: #1e3a5f;
    text-transform: uppercase; letter-spacing: 1px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 3px; margin-bottom: 4mm;
}

/* ─── INFO GRID ─── */
.info-grid { display: table; width: 100%; }
.info-cell { display: table-cell; width: 50%; padding: 0 3mm 3mm 0; vertical-align: top; }
.info-label {
    font-size: 7.5px; color: #94a3b8; text-transform: uppercase;
    font-weight: bold; letter-spacing: 0.5px; margin-bottom: 1.5px;
}
.info-value { font-size: 11px; font-weight: bold; color: #0f172a; }
.info-sub   { font-size: 9px; color: #64748b; margin-top: 1px; }

/* ─── SCORE CARD ─── */
.score-card {
    background: #1e3a5f;
    color: #fff;
    border-radius: 8px;
    padding: 5mm 6mm;
    text-align: center;
}
.score-card-lbl { font-size: 8px; font-weight: bold; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
.score-card-val { font-size: 38px; font-weight: bold; line-height: 1; color: #fff; margin-bottom: 3px; }
.score-card-lvl { font-size: 13px; font-weight: bold; color: #bfdbfe; }
.score-card-div { height: 1px; background: rgba(255,255,255,0.2); margin: 4mm 0; }
.score-card-note { font-size: 8.5px; color: #93c5fd; line-height: 1.5; }

/* ─── TWO-COL LAYOUT ─── */
.two-col { display: table; width: 100%; border-collapse: separate; border-spacing: 4mm 0; }
.col-left  { display: table-cell; vertical-align: top; width: 58%; }
.col-right { display: table-cell; vertical-align: top; width: 42%; }

/* ─── DIM TABLE ─── */
.dim-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
.dim-table th {
    background: #f8fafc;
    padding: 2.5mm 3mm;
    font-size: 7.5px; font-weight: bold; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
}
.dim-table td { padding: 2.5mm 3mm; font-size: 9.5px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.dim-table .num { text-align: center; }
.dim-table .bold-blue { font-weight: bold; color: #1e3a5f; }

/* ─── REC ROWS ─── */
.rec-row { margin-bottom: 3mm; border: 1px solid #e2e8f0; border-radius: 5px; overflow: hidden; page-break-inside: avoid; }
.rec-high { border-left: 3.5px solid #ef4444; }
.rec-med  { border-left: 3.5px solid #f59e0b; }
.rec-low  { border-left: 3.5px solid #22c55e; }
.rec-head { background: #f8fafc; padding: 2mm 3mm; display: table; width: 100%; border-bottom: 1px solid #f1f5f9; }
.rec-cat  { display: table-cell; font-size: 9px; font-weight: bold; color: #1e3a5f; }
.rec-badge-wrap { display: table-cell; text-align: right; vertical-align: middle; }
.rec-gap  { font-size: 7.5px; font-weight: bold; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 3px; }
.rec-body { padding: 2.5mm 3mm; font-size: 9px; color: #334155; line-height: 1.6; }

/* ─── QR ─── */
.qr-wrap { border: 1px solid #e2e8f0; border-radius: 6px; padding: 3px; background: #fff; display: inline-block; }
.qr-caption { font-size: 7px; font-weight: bold; color: #94a3b8; text-align: center; margin-top: 2px; letter-spacing: 0.5px; text-transform: uppercase; }

/* ─── PAGE BREAK ─── */
.page-break { page-break-before: always; }
</style>
</head>
<body>

@php
    $issued = $assessment->created_at->timezone('Asia/Jakarta')->format('d M Y, H:i');
    $total  = number_format($assessment->total_score ?? 0, 1);
    $level  = $assessment->level ?? '-';
@endphp

{{-- ── FOOTER ── --}}
<div class="page-footer">
    <div class="footer-inner">
        <div class="footer-left">
            <div class="footer-brand">MANGO Platform &mdash; Hasil Assessment INDI 4.0</div>
            <div class="footer-sub">Dokumen elektronik sah tanpa tanda tangan basah. Verifikasi via QR code.</div>
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
            <div class="header-eyebrow">MANGO Platform &mdash; Self-Assessment INDI 4.0</div>
            <div class="header-title">Hasil Analisis Kematangan</div>
            <div class="header-sub">
                {{ $assessment->umkm->name ?? 'UMKM' }}
                @if(!empty($assessment->umkm->organization)) &middot; {{ $assessment->umkm->organization->name }} @endif
            </div>
            <span class="header-badge">{{ strtoupper($assessment->status ?? 'completed') }}</span>
        </div>
        <div class="header-right">
            @if(!empty($mangoLogoBase64))
                <img src="{{ $mangoLogoBase64 }}" class="header-logo-img" alt="MANGO"><br>
            @endif
            <div class="header-doc-label">No. Dokumen</div>
            <div class="header-doc-val">{{ $docNo }}</div>
            <div class="header-doc-label">Diterbitkan</div>
            <div class="header-doc-val">{{ $issued }} WIB</div>
        </div>
    </div>
</div>

{{-- ── CONTENT ── --}}
<div class="content">

    {{-- ── Ringkasan ── --}}
    <div class="section">
        <div class="section-title">Ringkasan Hasil</div>
        <div class="two-col">
            <div class="col-left">
                <div class="info-grid">
                    <div class="info-cell">
                        <div class="info-label">Nama Bisnis / UMKM</div>
                        <div class="info-value">{{ $assessment->umkm->name ?? '-' }}</div>
                    </div>
                    <div class="info-cell">
                        <div class="info-label">Pemilik</div>
                        <div class="info-value">{{ $assessment->umkm->user->name ?? '-' }}</div>
                    </div>
                    <div class="info-cell">
                        <div class="info-label">Sektor</div>
                        <div class="info-value">{{ $assessment->umkm->sector ?? '-' }}</div>
                    </div>
                    <div class="info-cell">
                        <div class="info-label">Tanggal Assessment</div>
                        <div class="info-value">{{ $issued }} WIB</div>
                    </div>
                </div>
                <div style="margin-top:3mm; font-size:9px; color:#475569; line-height:1.6; border-left:3px solid #cbd5e1; padding-left:3mm;">
                    Berdasarkan hasil analisa mandiri yang telah dilakukan, unit bisnis Anda
                    saat ini berada pada tingkat kematangan <strong>{{ $level }}</strong>
                    dengan skor total <strong>{{ $total }}</strong>.
                    Prioritaskan dimensi yang memiliki capaian rendah untuk program pendampingan ke depan.
                </div>
            </div>
            <div class="col-right">
                <div class="score-card">
                    <div class="score-card-lbl">Skor Total INDI 4.0</div>
                    <div class="score-card-val">{{ $total }}</div>
                    <div class="score-card-div"></div>
                    <div class="score-card-lvl">{{ $level }}</div>
                    <div class="score-card-note" style="margin-top:3mm;">dari skala 0 &ndash; 5</div>
                </div>
            </div>
        </div>
    </div>

    {{-- ── Grafik Visualisasi ── --}}
    <div class="section">
        <div class="section-title">Visualisasi Capaian Per Dimensi</div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;">
            {!! $chartSvg !!}
        </div>
        {{-- Legend --}}
        <div style="margin-top:5px;">
            <span style="display:inline-block;width:10px;height:10px;background:#22c55e;border-radius:2px;margin-right:3px;vertical-align:middle;"></span><span style="font-size:8px;color:#475569;margin-right:10px;">Baik (&ge;70%)</span>
            <span style="display:inline-block;width:10px;height:10px;background:#f59e0b;border-radius:2px;margin-right:3px;vertical-align:middle;"></span><span style="font-size:8px;color:#475569;margin-right:10px;">Sedang (40&ndash;69%)</span>
            <span style="display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:2px;margin-right:3px;vertical-align:middle;"></span><span style="font-size:8px;color:#475569;">Perlu Perhatian (&lt;40%)</span>
        </div>
    </div>

    {{-- ── Tabel Rincian ── --}}
    <div class="section">
        <div class="section-title">Rincian Per Dimensi</div>
        <table class="dim-table">
            <thead>
                <tr>
                    <th style="width:46%">Dimensi</th>
                    <th style="width:18%; text-align:center">Skor Maks</th>
                    <th style="width:20%; text-align:center">Skor Diperoleh</th>
                    <th style="width:16%; text-align:center">Capaian</th>
                </tr>
            </thead>
            <tbody>
                @foreach($chartData as $d)
                @php
                    $pct = $d['fullMark'] > 0 ? round(($d['score'] / $d['fullMark']) * 100) : 0;
                    $dimColor = $pct >= 70 ? '#16a34a' : ($pct >= 40 ? '#d97706' : '#dc2626');
                @endphp
                <tr>
                    <td style="font-weight:bold">{{ $d['subject'] }}</td>
                    <td class="num">{{ $d['fullMark'] }}</td>
                    <td class="num bold-blue">{{ number_format($d['score'], 1) }}</td>
                    <td class="num" style="color:{{ $dimColor }}; font-weight:bold">{{ $pct }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    {{-- ── Rekomendasi ── --}}
    @if($assessment->recommendations && $assessment->recommendations->count() > 0)
    <div class="section page-break">
        <div class="section-title">Rekomendasi Intervensi</div>
        @foreach($assessment->recommendations as $rec)
        @php
            $recClass = $rec->priority === 'high' ? 'rec-high' : ($rec->priority === 'medium' ? 'rec-med' : 'rec-low');
        @endphp
        <div class="rec-row {{ $recClass }}">
            <div class="rec-head">
                <span class="rec-cat">{{ $rec->category->name ?? '-' }}</span>
                <span class="rec-badge-wrap">
                    <span class="rec-gap">GAP: {{ number_format($rec->gap_score ?? 0, 1) }}</span>
                </span>
            </div>
            <div class="rec-body">{{ $rec->recommendation_text }}</div>
        </div>
        @endforeach
    </div>
    @endif

    {{-- ── QR Code ── --}}
    @if(!empty($qrSvgBase64))
    <div style="text-align:right; margin-top:4mm;">
        <div class="qr-wrap">
            <img src="data:image/svg+xml;base64,{{ $qrSvgBase64 }}" width="80" height="80" alt="QR">
        </div>
        <div class="qr-caption">Scan Verifikasi Dokumen</div>
    </div>
    @endif

</div>
</body>
</html>
