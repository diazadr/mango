<?php

namespace App\Http\Requests\Advisor;

use Illuminate\Foundation\Http\FormRequest;

class IndexConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sort_by' => ['nullable', 'string', 'in:created_at,topic,status'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
