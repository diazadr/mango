<?php

namespace App\Models\Edge;

use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EdgeSite extends Model
{
    protected $fillable = [
        'name',
        'site_id',
        'api_key_hash',
        'api_key_preview',
        'description',
        'location',
        'is_active',
        'machine_count',
        'last_sync_at',
        'institution_id',
        'organization_id',
        'umkm_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active'    => 'boolean',
            'last_sync_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }

    // ── Static Factory ────────────────────────────────────────────────────────

    /**
     * Generate a new API key, return the plaintext (shown once) and the model with hash stored.
     */
    public static function generateKey(): array
    {
        $plaintext = 'edge_' . Str::random(40);

        return [
            'plaintext'   => $plaintext,
            'hash'        => hash('sha256', $plaintext),
            'preview'     => substr($plaintext, 0, 8) . '****',
        ];
    }

    /**
     * Find an active site by the plaintext API key (constant-time comparison).
     */
    public static function findByApiKey(string $plaintext): ?static
    {
        $hash = hash('sha256', $plaintext);

        // Fetch candidates that match the hash (no timing attack since hash comparison is safe)
        return static::where('api_key_hash', $hash)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Record a successful sync from this site.
     */
    public function touchSync(): void
    {
        $this->updateQuietly(['last_sync_at' => now()]);
    }

    /**
     * How many minutes since last sync (null if never).
     */
    public function minutesSinceSync(): ?int
    {
        return $this->last_sync_at
            ? (int) $this->last_sync_at->diffInMinutes(now())
            : null;
    }

    /**
     * Is the site "live" (synced within last 10 minutes)?
     */
    public function isOnline(): bool
    {
        $minutes = $this->minutesSinceSync();
        return $minutes !== null && $minutes <= 10;
    }
}
