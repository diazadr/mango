<?php

namespace App\Models\Content;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Article extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'category',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($article) {
            if (! $article->slug) {
                $article->slug = Str::slug($article->title).'-'.Str::random(5);
            }
        });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
