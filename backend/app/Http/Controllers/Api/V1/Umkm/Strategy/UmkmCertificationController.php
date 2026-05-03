<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Models\Umkm\Umkm;
use App\Models\Umkm\UmkmCertification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UmkmCertificationController extends Controller
{
    public function store(Request $request, Umkm $umkm): JsonResponse
    {
        $this->authorize('update', $umkm);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'certificate_number' => ['nullable', 'string', 'max:255'],
            'issued_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        try {
            $certification = $umkm->certificationDocs()->create([
                'name' => $validated['name'],
                'certificate_number' => $validated['certificate_number'],
                'issued_date' => $validated['issued_date'],
                'expiry_date' => $validated['expiry_date'],
            ]);

            if ($request->hasFile('file')) {
                $certification->addMediaFromRequest('file')
                    ->toMediaCollection('certificate_documents');
            }

            return response()->json([
                'success' => true,
                'message' => 'Sertifikat berhasil diunggah.',
                'data' => [
                    'id' => $certification->id,
                    'name' => $certification->name,
                    'file_url' => $certification->getFirstMediaUrl('certificate_documents'),
                ]
            ], 201);
        } catch (Throwable $e) {
            Log::error('Certification store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengunggah sertifikat.'], 500);
        }
    }

    public function destroy(Umkm $umkm, UmkmCertification $certification): JsonResponse
    {
        $this->authorize('update', $umkm);

        if ($certification->umkm_id !== $umkm->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $certification->delete();
            return response()->json(['message' => 'Sertifikat berhasil dihapus.']);
        } catch (Throwable $e) {
            Log::error('Certification delete error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghapus sertifikat.'], 500);
        }
    }
}
