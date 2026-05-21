<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Resume UMKM — MANGO Platform</title>
    <style>
        /* ═══════════════════════════════════════════════════
           MANGO Platform — UMKM Resume PDF
           DomPDF-compatible stylesheet
           ═══════════════════════════════════════════════════ */

        @page {
            margin: 0;
            size: A4 portrait;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
        }

        /* ─── FIXED FOOTER ─── */
        .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #f8fafc;
            border-top: 1px solid #cbd5e1;
            padding: 10px 36px;
        }

        .page-footer table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-left {
            vertical-align: middle;
            text-align: left;
        }

        .footer-right {
            vertical-align: middle;
            text-align: right;
        }

        .footer-brand {
            font-size: 8px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 2px;
        }

        .footer-text {
            font-size: 7px;
            color: #94a3b8;
            line-height: 1.6;
        }

        .footer-logo {
            width: 22px;
            height: auto;
            opacity: 0.5;
        }

        /* ─── HEADER BANNER ─── */
        .header {
            background-color: #1e477e;
            color: #ffffff;
            padding: 24px 36px 20px 36px;
        }

        .header table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-logo {
            width: 36px;
            height: auto;
            margin-bottom: 8px;
        }

        .header-eyebrow {
            font-size: 7px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #93c5fd;
            margin-bottom: 5px;
        }

        .header-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .header-sub {
            font-size: 9px;
            color: #bfdbfe;
        }

        .header-meta {
            font-size: 8px;
            color: #bfdbfe;
            line-height: 1.8;
        }

        .header-badge {
            display: inline-block;
            background-color: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.3);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #ffffff;
            margin-top: 6px;
        }

        /* ─── MAIN CONTENT ─── */
        .content {
            padding: 20px 36px 80px 36px;
        }

        /* ─── IDENTITY CARD ─── */
        .id-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            margin-bottom: 16px;
            background-color: #f8fafc;
        }

        .id-card table {
            width: 100%;
            border-collapse: collapse;
        }

        .id-logo {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            object-fit: cover;
        }

        .id-logo-ph {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background-color: #1e477e;
            color: #ffffff;
            text-align: center;
            line-height: 50px;
            font-size: 22px;
            font-weight: bold;
        }

        .id-name {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 2px;
        }

        .id-detail {
            font-size: 8px;
            color: #64748b;
            line-height: 1.7;
        }

        .qr-wrap {
            text-align: right;
        }

        .qr-box {
            display: inline-block;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 4px;
            background: #fff;
        }

        .qr-label {
            font-size: 6px;
            color: #94a3b8;
            text-align: center;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
        }

        /* ─── SECTION ─── */
        .section {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 14px;
            overflow: hidden;
        }

        .section-head {
            background-color: #f1f5f9;
            padding: 7px 14px;
            border-bottom: 1px solid #e2e8f0;
        }

        .section-title {
            font-size: 9px;
            font-weight: bold;
            color: #1e477e;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .section-body {
            padding: 12px 14px;
        }

        /* ─── DATA TABLE ─── */
        .dtable {
            width: 100%;
            border-collapse: collapse;
        }

        .dtable td {
            padding: 5px 6px 5px 0;
            vertical-align: top;
            width: 50%;
            border-bottom: 1px dashed #f1f5f9;
        }

        .dtable tr:last-child td {
            border-bottom: none;
        }

        .dlabel {
            font-size: 7px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
            margin-bottom: 1px;
        }

        .dval {
            font-size: 9px;
            font-weight: bold;
            color: #1e293b;
            word-break: break-word;
        }

        .dval-mono {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 8px;
            letter-spacing: 0.3px;
        }

        /* ─── DESCRIPTION ─── */
        .desc-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
            margin-top: 6px;
        }

        .desc-text {
            font-size: 9px;
            color: #334155;
            line-height: 1.7;
            font-style: italic;
        }

        /* ─── SCORE ─── */
        .score-card {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 12px 14px;
        }

        .score-num {
            font-size: 22px;
            font-weight: bold;
            color: #1e477e;
        }

        .score-lbl {
            font-size: 7px;
            font-weight: bold;
            color: #1e477e;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
        }

        .score-sub {
            font-size: 8px;
            color: #3b82f6;
            margin-top: 2px;
        }

        .score-empty {
            font-size: 9px;
            color: #94a3b8;
            font-style: italic;
            padding: 10px 0;
        }

        /* ─── CERT TABLE ─── */
        .ctable {
            width: 100%;
            border-collapse: collapse;
        }

        .ctable th {
            background-color: #f1f5f9;
            padding: 6px 8px;
            text-align: left;
            font-size: 7px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
        }

        .ctable td {
            padding: 6px 8px;
            font-size: 8px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
        }

        /* ─── HOURS ─── */
        .htable {
            width: 100%;
            border-collapse: collapse;
        }

        .htable td {
            padding: 4px 6px;
            font-size: 8px;
            border-bottom: 1px solid #f1f5f9;
        }

        .hday {
            font-weight: bold;
            color: #1e293b;
            width: 70px;
        }

        .htime {
            color: #1e477e;
            font-weight: bold;
        }

        .hclosed {
            color: #94a3b8;
            font-style: italic;
        }

        /* ─── UTILS ─── */
        .text-green { color: #16a34a; font-weight: bold; }
        .text-red   { color: #dc2626; font-weight: bold; }
        .text-center { text-align: center; }
        .mt-6  { margin-top: 6px; }
        .mt-10 { margin-top: 10px; }
    </style>
</head>
<body>

@php
    $latestAssessment = $umkm->assessmentResults->first();
    $fullAddress = collect([
        $umkm->address, $umkm->village, $umkm->district,
        $umkm->regency, $umkm->province, $umkm->postal_code,
    ])->filter()->implode(', ');

    $days = [
        'monday' => 'Senin', 'tuesday' => 'Selasa', 'wednesday' => 'Rabu',
        'thursday' => 'Kamis', 'friday' => 'Jumat', 'saturday' => 'Sabtu', 'sunday' => 'Minggu',
    ];
    $hours = is_array($umkm->operating_hours) ? $umkm->operating_hours : [];
@endphp

{{-- ════════ FIXED FOOTER ════════ --}}
<div class="page-footer">
    <table>
        <tr>
            <td class="footer-left">
                <div class="footer-brand">MANGO Platform</div>
                <div class="footer-text">
                    Dokumen ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah.
                    Scan QR code untuk verifikasi keaslian.
                </div>
            </td>
            <td class="footer-right">
                @if(!empty($mangoLogoBase64))
                    <img src="{{ $mangoLogoBase64 }}" class="footer-logo" alt="M">
                @endif
                <div class="footer-text mt-6">
                    &copy; {{ date('Y') }} MANGO Platform
                </div>
            </td>
        </tr>
    </table>
</div>

{{-- ════════ HEADER ════════ --}}
<div class="header">
    <table>
        <tr>
            <td style="vertical-align: top; width: 65%;">
                @if(!empty($mangoLogoBase64))
                    <img src="{{ $mangoLogoBase64 }}" class="header-logo" alt="MANGO">
                @endif
                <div class="header-eyebrow">MANGO Platform &mdash; Resume Identitas Bisnis</div>
                <div class="header-title">{{ $umkm->name ?? 'Resume UMKM' }}</div>
                <div class="header-sub">
                    {{ $umkm->sector ?? '' }}
                    @if($umkm->organization) &middot; {{ $umkm->organization->name }} @endif
                </div>
                <div class="header-badge">
                    {{ $umkm->is_active ? 'TERVERIFIKASI' : 'MENUNGGU VERIFIKASI' }}
                </div>
            </td>
            <td style="vertical-align: top; text-align: right; width: 35%;">
                <div class="header-meta">
                    No. Registrasi: <strong>{{ $umkm->registration_number ?? '-' }}</strong><br>
                    NIB: <strong>{{ $umkm->nib ?? '-' }}</strong>
                </div>
                <div class="header-meta" style="margin-top: 8px; color: #93c5fd;">
                    Diterbitkan: {{ now()->timezone('Asia/Jakarta')->format('d M Y, H:i') }} WIB
                </div>
            </td>
        </tr>
    </table>
</div>

{{-- ════════ CONTENT ════════ --}}
<div class="content">

    {{-- Identity Card --}}
    <div class="id-card">
        <table>
            <tr>
                <td style="width: 60px; vertical-align: top; padding-right: 12px;">
                    @if(!empty($umkmLogoBase64))
                        <img src="{{ $umkmLogoBase64 }}" class="id-logo" alt="{{ $umkm->name }}">
                    @else
                        <div class="id-logo-ph">{{ strtoupper(substr($umkm->name ?? 'M', 0, 1)) }}</div>
                    @endif
                </td>
                <td style="vertical-align: top;">
                    <div class="id-name">{{ $umkm->name }}</div>
                    <div class="id-detail">
                        Pemilik: <strong>{{ $umkm->user->name ?? '-' }}</strong> &middot;
                        {{ $umkm->legal_entity_type ?? 'Perseorangan' }}
                        @if($umkm->established_year) &middot; Berdiri {{ $umkm->established_year }} @endif
                        <br>
                        {{ $umkm->phone ?? '-' }} &middot; {{ $umkm->email ?? '-' }}
                    </div>
                </td>
                <td style="width: 80px; vertical-align: top;" class="qr-wrap">
                    @if(!empty($qrSvg))
                        <div class="qr-box">{!! $qrSvg !!}</div>
                        <div class="qr-label">Scan Profil</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- ── Identitas Bisnis ── --}}
    <div class="section">
        <div class="section-head"><div class="section-title">Identitas Bisnis</div></div>
        <div class="section-body">
            <table class="dtable">
                <tr>
                    <td><div class="dlabel">Nama UMKM</div><div class="dval">{{ $umkm->name ?? '-' }}</div></td>
                    <td><div class="dlabel">Pemilik / PIC</div><div class="dval">{{ $umkm->user->name ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Badan Usaha</div><div class="dval">{{ $umkm->legal_entity_type ?? '-' }}</div></td>
                    <td><div class="dlabel">Tahun Berdiri</div><div class="dval">{{ $umkm->established_year ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Email Bisnis</div><div class="dval">{{ $umkm->email ?? '-' }}</div></td>
                    <td><div class="dlabel">Telepon</div><div class="dval">{{ $umkm->phone ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Sektor Usaha</div><div class="dval">{{ $umkm->sector ?? '-' }}</div></td>
                    <td><div class="dlabel">Website</div><div class="dval">{{ $umkm->website ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Organisasi</div><div class="dval">{{ $umkm->organization->name ?? '-' }}</div></td>
                    <td><div class="dlabel">Institusi Pembina</div><div class="dval">{{ $umkm->institution->name ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Jumlah Karyawan</div><div class="dval">{{ $umkm->employee_count ?? '-' }}</div></td>
                    <td><div class="dlabel">NIB</div><div class="dval dval-mono">{{ $umkm->nib ?? '-' }}</div></td>
                </tr>
            </table>
        </div>
    </div>

    {{-- ── Alamat ── --}}
    <div class="section">
        <div class="section-head"><div class="section-title">Alamat &amp; Lokasi</div></div>
        <div class="section-body">
            <table class="dtable">
                <tr>
                    <td colspan="2"><div class="dlabel">Alamat Lengkap</div><div class="dval">{{ $fullAddress ?: '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Provinsi</div><div class="dval">{{ $umkm->province ?? '-' }}</div></td>
                    <td><div class="dlabel">Kota / Kabupaten</div><div class="dval">{{ $umkm->regency ?? '-' }}</div></td>
                </tr>
                <tr>
                    <td><div class="dlabel">Kecamatan</div><div class="dval">{{ $umkm->district ?? '-' }}</div></td>
                    <td><div class="dlabel">Kode Pos</div><div class="dval">{{ $umkm->postal_code ?? '-' }}</div></td>
                </tr>
                @if($umkm->latitude && $umkm->longitude)
                <tr>
                    <td colspan="2">
                        <div class="dlabel">Koordinat GPS</div>
                        <div class="dval dval-mono">{{ $umkm->latitude }}, {{ $umkm->longitude }}</div>
                    </td>
                </tr>
                @endif
            </table>
        </div>
    </div>

    {{-- ── Keterangan ── --}}
    <div class="section">
        <div class="section-head"><div class="section-title">Keterangan Usaha</div></div>
        <div class="section-body">
            <div class="dlabel">Deskripsi Bisnis</div>
            <div class="desc-box">
                <div class="desc-text">{{ $umkm->description ?: 'Belum ada deskripsi bisnis.' }}</div>
            </div>
            @if($umkm->vision)
                <div class="mt-10">
                    <div class="dlabel">Visi</div>
                    <div class="dval" style="font-size: 8px; font-weight: normal; line-height: 1.6; margin-top: 2px;">{{ $umkm->vision }}</div>
                </div>
            @endif
            @if($umkm->mission)
                <div class="mt-6">
                    <div class="dlabel">Misi</div>
                    <div class="dval" style="font-size: 8px; font-weight: normal; line-height: 1.6; margin-top: 2px;">{{ $umkm->mission }}</div>
                </div>
            @endif
        </div>
    </div>

    {{-- ── Assessment ── --}}
    <div class="section">
        <div class="section-head"><div class="section-title">Ringkasan Assessment INDI 4.0</div></div>
        <div class="section-body">
            @if($latestAssessment)
                <div class="score-card">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="vertical-align: top; width: 40%;">
                                <div class="score-lbl">Skor Terakhir</div>
                                <div class="score-num">{{ number_format($latestAssessment->total_score ?? 0, 1) }}</div>
                                <div class="score-sub">Level: {{ $latestAssessment->level ?? '-' }}</div>
                            </td>
                            <td style="vertical-align: top;">
                                <div class="score-lbl">Tanggal Assessment</div>
                                <div class="dval">{{ optional($latestAssessment->created_at)->timezone('Asia/Jakarta')->format('d M Y, H:i') }} WIB</div>
                            </td>
                        </tr>
                    </table>
                </div>
            @else
                <div class="score-empty">Belum ada data assessment yang tercatat.</div>
            @endif
        </div>
    </div>

    {{-- ── Sertifikasi ── --}}
    @if($umkm->certificationDocs && $umkm->certificationDocs->count() > 0)
    <div class="section">
        <div class="section-head"><div class="section-title">Sertifikasi &amp; Dokumen</div></div>
        <div class="section-body" style="padding: 0;">
            <table class="ctable">
                <thead>
                    <tr>
                        <th style="width: 5%;">No</th>
                        <th style="width: 35%;">Nama</th>
                        <th style="width: 25%;">Penerbit</th>
                        <th style="width: 20%;">Berlaku Hingga</th>
                        <th style="width: 15%;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($umkm->certificationDocs as $i => $c)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td style="font-weight: bold;">{{ $c->name ?? '-' }}</td>
                        <td>{{ $c->issuer ?? '-' }}</td>
                        <td>{{ $c->valid_until ? \Carbon\Carbon::parse($c->valid_until)->format('d M Y') : '-' }}</td>
                        <td>
                            @if($c->valid_until && \Carbon\Carbon::parse($c->valid_until)->isFuture())
                                <span class="text-green">Aktif</span>
                            @else
                                <span class="text-red">Kedaluwarsa</span>
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endif

    {{-- ── Jam Operasional ── --}}
    @if(!empty($hours))
    <div class="section">
        <div class="section-head"><div class="section-title">Jam Operasional</div></div>
        <div class="section-body" style="padding: 6px 14px;">
            <table class="htable">
                @foreach($days as $k => $lbl)
                    @php $h = $hours[$k] ?? []; @endphp
                    <tr>
                        <td class="hday">{{ $lbl }}</td>
                        <td>
                            @if(!empty($h['closed']))
                                <span class="hclosed">Tutup</span>
                            @else
                                <span class="htime">{{ $h['open'] ?? '08:00' }} &mdash; {{ $h['close'] ?? '17:00' }}</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>
    @endif

</div>
</body>
</html>
