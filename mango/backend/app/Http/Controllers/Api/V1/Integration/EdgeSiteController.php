<?php

namespace App\Http\Controllers\Api\V1\Integration;

use App\Http\Controllers\Controller;
use App\Models\Edge\EdgeSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EdgeSiteController extends Controller
{
    // GET /v1/edge-sites
    public function index(Request $request): JsonResponse
    {
        $sites = EdgeSite::with(['institution', 'organization', 'umkm'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (EdgeSite $s) => $this->formatSite($s));

        return $this->ok(['sites' => $sites]);
    }

    // POST /v1/edge-sites
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:100'],
            'site_id'         => ['required', 'string', 'max:50', 'unique:edge_sites,site_id', 'regex:/^[A-Z0-9_]+$/'],
            'description'     => ['nullable', 'string', 'max:500'],
            'location'        => ['nullable', 'string', 'max:255'],
            'institution_id'  => ['nullable', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'umkm_id'         => ['nullable', 'exists:umkms,id'],
        ]);

        $keyData = EdgeSite::generateKey();

        $site = EdgeSite::create([
            ...$validated,
            'api_key_hash'    => $keyData['hash'],
            'api_key_preview' => $keyData['preview'],
            'is_active'       => true,
        ]);

        return $this->ok([
            'site'    => $this->formatSite($site),
            // ONE-TIME reveal: return plaintext key only at creation
            'api_key' => $keyData['plaintext'],
            '_note'   => 'Store this API key securely. It cannot be retrieved again.',
        ], 'Edge site created.', 201);
    }

    // GET /v1/edge-sites/{site}
    public function show(EdgeSite $edgeSite): JsonResponse
    {
        $edgeSite->load(['institution', 'organization', 'umkm']);
        return $this->ok(['site' => $this->formatSite($edgeSite)]);
    }

    // PUT /v1/edge-sites/{site}
    public function update(Request $request, EdgeSite $edgeSite): JsonResponse
    {
        $validated = $request->validate([
            'name'            => ['sometimes', 'string', 'max:100'],
            'description'     => ['nullable', 'string', 'max:500'],
            'location'        => ['nullable', 'string', 'max:255'],
            'is_active'       => ['sometimes', 'boolean'],
            'institution_id'  => ['nullable', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'umkm_id'         => ['nullable', 'exists:umkms,id'],
        ]);

        $edgeSite->update($validated);

        return $this->ok(['site' => $this->formatSite($edgeSite->fresh())], 'Edge site updated.');
    }

    // DELETE /v1/edge-sites/{site}
    public function destroy(EdgeSite $edgeSite): JsonResponse
    {
        $edgeSite->delete();
        return $this->ok([], 'Edge site deleted.');
    }

    // POST /v1/edge-sites/{site}/rotate-key
    public function rotateKey(EdgeSite $edgeSite): JsonResponse
    {
        $keyData = EdgeSite::generateKey();

        $edgeSite->update([
            'api_key_hash'    => $keyData['hash'],
            'api_key_preview' => $keyData['preview'],
        ]);

        return $this->ok([
            'site'    => $this->formatSite($edgeSite->fresh()),
            'api_key' => $keyData['plaintext'],
            '_note'   => 'New API key generated. Update your edge config.yaml immediately.',
        ], 'API key rotated.');
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function formatSite(EdgeSite $site): array
    {
        return [
            'id'              => $site->id,
            'name'            => $site->name,
            'site_id'         => $site->site_id,
            'api_key_preview' => $site->api_key_preview,
            'description'     => $site->description,
            'location'        => $site->location,
            'is_active'       => $site->is_active,
            'is_online'       => $site->isOnline(),
            'machine_count'   => $site->machine_count,
            'last_sync_at'    => $site->last_sync_at?->toIso8601String(),
            'minutes_since_sync' => $site->minutesSinceSync(),
            'institution'     => $site->institution ? ['id' => $site->institution->id, 'name' => $site->institution->name] : null,
            'organization'    => $site->organization ? ['id' => $site->organization->id, 'name' => $site->organization->name] : null,
            'umkm'            => $site->umkm ? ['id' => $site->umkm->id, 'name' => $site->umkm->name] : null,
            'created_at'      => $site->created_at?->toIso8601String(),
        ];
    }
}
