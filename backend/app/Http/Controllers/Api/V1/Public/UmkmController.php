<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\Master\UmkmResource;
use App\Models\Umkm\Umkm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UmkmController extends Controller
{
    /**
     * Display a listing of UMKMs.
     */
    public function index(Request $request)
    {
        try {
            $query = Umkm::query()
                ->where('status', 'active')
                ->where('is_active', true);

            if ($search = $request->get('search')) {
                $query->where('name', 'like', "%{$search}%");
            }

            if ($sector = $request->get('sector')) {
                $query->where('sector', $sector);
            }

            $perPage = min((int) $request->get('per_page', 12), 100);

            return UmkmResource::collection($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Public UMKM index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Failed to fetch UMKMs'], 500);
        }
    }

    /**
     * Display the specified UMKM by slug or uuid.
     */
    public function show(string $identifier)
    {
        try {
            $umkm = Umkm::query()
                ->where('status', 'active')
                ->where('is_active', true)
                ->where(function ($query) use ($identifier) {
                    $query->where('slug', $identifier)
                        ->orWhere('uuid', $identifier);
                })
                ->with(['products'])
                ->firstOrFail();

            return new UmkmResource($umkm);
        } catch (Throwable $e) {
            Log::error('Public UMKM show error', [
                'identifier' => $identifier,
                'message' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'UMKM not found'], 404);
        }
    }
}
