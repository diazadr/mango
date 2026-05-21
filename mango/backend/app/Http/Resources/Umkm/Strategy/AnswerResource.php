<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'question' => new QuestionResource($this->whenLoaded('question')),
            'value' => $this->value,
            'answer_text' => $this->getAnswerLabel(),
            'score' => $this->score,
            'notes' => $this->notes,
        ];
    }

    /**
     * Map numeric value to human-readable label.
     */
    private function getAnswerLabel(): string
    {
        $labels = [
            0 => 'Belum diterapkan',
            1 => 'Sudah mulai diterapkan sebagian',
            2 => 'Diterapkan secara terstruktur',
            3 => 'Diterapkan dan dipantau berkala',
            4 => 'Terintegrasi dan berkelanjutan',
        ];

        return $labels[(int) $this->value] ?? "Nilai: {$this->value}";
    }
}
