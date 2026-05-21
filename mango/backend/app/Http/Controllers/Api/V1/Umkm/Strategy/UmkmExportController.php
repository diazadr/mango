<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Models\Umkm\Umkm;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Throwable;

class UmkmExportController extends Controller
{
    public function exportResume(Umkm $umkm)
    {
        try {
            $this->authorize('view', $umkm);

            $umkm->load([
                'certificationDocs',
                'organization',
                'institution',
                'user',
                'assessmentResults' => fn ($query) => $query->latest('created_at'),
            ]);

            // Generate QR Code as SVG inline
            $profileUrl = config('app.frontend_url', 'https://mango-platform.id') . '/umkm/' . $umkm->slug;
            $qrSvg = $this->generateQrSvg($profileUrl);

            // Get MANGO logo as base64
            $mangoLogoPath = public_path('images/logo-mango.png');
            $mangoLogoBase64 = '';
            if (file_exists($mangoLogoPath)) {
                $mangoLogoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($mangoLogoPath));
            }

            // Get UMKM logo as base64
            $umkmLogoBase64 = '';
            if ($umkm->logo_url && !str_contains($umkm->logo_url, 'placeholders')) {
                try {
                    $logoPath = str_replace('/storage/', '', parse_url($umkm->logo_url, PHP_URL_PATH));
                    $fullLogoPath = storage_path('app/public/' . $logoPath);
                    if (file_exists($fullLogoPath)) {
                        $ext = pathinfo($fullLogoPath, PATHINFO_EXTENSION) ?: 'png';
                        $umkmLogoBase64 = 'data:image/' . $ext . ';base64,' . base64_encode(file_get_contents($fullLogoPath));
                    }
                } catch (\Exception $e) {
                    // Fallback: no logo
                }
            }

            $pdf = Pdf::loadView('pdf.umkm-resume', [
                'umkm' => $umkm,
                'qrSvg' => $qrSvg,
                'mangoLogoBase64' => $mangoLogoBase64,
                'umkmLogoBase64' => $umkmLogoBase64,
                'profileUrl' => $profileUrl,
            ])
                ->setPaper('a4', 'portrait');

            return $pdf->download("MANGO-Resume-{$umkm->slug}.pdf");
        } catch (Throwable $e) {
            Log::error('PDF Export Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Gagal membuat file PDF: ' . $e->getMessage()], 500);
        }
    }

    private function generateQrSvg(string $data): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle(150, 0),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);

        return $writer->writeString($data);
    }
}
