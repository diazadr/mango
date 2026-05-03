<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexAssessmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'umkm_id' => ['nullable', 'exists:umkms,id'],
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:draft,submitted'],
            'sort_by' => ['nullable', 'string', 'in:created_at,total_score'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
