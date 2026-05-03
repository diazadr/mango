<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Models\Umkm\Umkm;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\Facades\Pdf;
use Illuminate\Support\Facades\Log;
use Throwable;

class UmkmExportController extends Controller
{
    public function exportResume(Umkm $umkm)
    {
        try {
            $this->authorize('view', $umkm);

            $umkm->load(['certificationDocs', 'managingOrganization']);

            return Pdf::view('pdf.umkm-resume', ['umkm' => $umkm])
                ->name("MANGO-Resume-{$umkm->slug}.pdf")
                ->withBrowsershot(function ($browsershot) {
                    $browsershot->noSandbox();
                    $browsershot->setOption('args', ['--disable-web-security']);
                })
                ->download();
        } catch (Throwable $e) {
            Log::error('PDF Export Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json(['message' => 'Gagal membuat file PDF. Pastikan sistem siap mencetak.'], 500);
        }
    }
}
