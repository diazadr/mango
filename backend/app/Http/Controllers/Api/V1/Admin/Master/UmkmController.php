<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\Master\UmkmResource;
use App\Models\Umkm\Umkm;
use App\Services\Admin\Master\UmkmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UmkmController extends Controller
{
    public function __construct(protected UmkmService $umkmService) {}

    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->hasRole('super_admin')) {
                $query = Umkm::query();
            } else {
                $institutionIds = $user->institutions()
                    ->pluck('institutions.id');

                $query = Umkm::query()
                    ->whereIn('institution_id', $institutionIds);
            }

            $query->with([
                'institution',
                'organization',
                'user',
                'products',
            ]);

            if ($search = $request->get('search')) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            if ($sector = $request->get('sector')) {
                $query->where('sector', $sector);
            }

            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }

            if (! is_null($request->get('is_active'))) {
                $query->where(
                    'is_active',
                    $request->boolean('is_active')
                );
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return UmkmResource::collection(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('UMKM index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch UMKM',
            ], 500);
        }
    }

    public function approve(Umkm $umkm)
    {
        try {
            $this->umkmService->approve($umkm);

            return response()->json(['message' => 'UMKM approved successfully.']);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to approve UMKM.'], 500);
        }
    }

    public function reject(Request $request, Umkm $umkm)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $this->umkmService->reject($umkm, $request->reason);

            return response()->json(['message' => 'UMKM rejected successfully.']);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to reject UMKM.'], 500);
        }
    }
}
