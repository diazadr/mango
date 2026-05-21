<?php

namespace App\Models\Project;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Deliverable extends Model
{
    protected $fillable = [
        'action_plan_id',
        'title',
        'description',
        'file_path',
        'file_disk',
        'file_mime',
        'file_size',
        'url',
        'completed_by',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'file_size'    => 'integer',
    ];

    // ── Relasi ───────────────────────────────────────────────────────────────

    public function actionPlan(): BelongsTo
    {
        return $this->belongsTo(ActionPlan::class);
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    // ── Accessor: URL download yang aman (melalui controller, bukan URL publik) ─
    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }
        // File disimpan di disk 'local' — frontend harus memanggil endpoint download khusus
        return route('deliverables.download', $this->id);
    }
}
