<?php

namespace Database\Seeders;

use App\Models\Edge\EdgeSite;
use Illuminate\Database\Seeder;

class EdgeSiteSeeder extends Seeder
{
    public function run(): void
    {
        $legacyKey    = config('edge.api_key', '');
        $legacySiteId = config('edge.site_id', 'POLMAN_BANDUNG_EDGE');

        if (! $legacyKey || $legacyKey === 'change-me-edge-key') {
            $this->command->warn('⚠️  EDGE_API_KEY tidak di-set atau masih placeholder. Skipping.');
            return;
        }

        $hash    = hash('sha256', $legacyKey);
        $preview = substr($legacyKey, 0, 8) . '****';

        // ── Hapus entry lama dengan site_id berbeda tapi key sama ──────────
        $old = EdgeSite::where('api_key_hash', $hash)
            ->where('site_id', '!=', $legacySiteId)
            ->first();

        if ($old) {
            $this->command->warn("⚠️  Menghapus edge site lama [{$old->site_id}] yang pakai key yang sama...");
            $old->delete();
        }

        // ── Buat atau update site dengan site_id yang benar ────────────────
        $site = EdgeSite::updateOrCreate(
            ['site_id' => $legacySiteId],
            [
                'name'            => 'Politeknik Manufaktur Bandung — Edge Site',
                'api_key_hash'    => $hash,
                'api_key_preview' => $preview,
                'description'     => 'Site Edge utama di POLMAN Bandung (dari EDGE_API_KEY .env).',
                'location'        => 'Bandung, Jawa Barat',
                'is_active'       => true,
            ]
        );

        if ($site->wasRecentlyCreated) {
            $this->command->info("✅  Edge site [{$legacySiteId}] berhasil dibuat.");
        } else {
            $this->command->info("♻️   Edge site [{$legacySiteId}] sudah ada, di-update.");
        }

        $this->command->info("   API Key preview : {$preview}");
        $this->command->info("   API Key hash    : {$hash}");
    }
}
