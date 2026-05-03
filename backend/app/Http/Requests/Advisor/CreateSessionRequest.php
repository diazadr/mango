<?php

namespace App\Http\Requests\Advisor;

use Illuminate\Foundation\Http\FormRequest;

class CreateSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scheduled_at' => [
                'required',
                'date',
            ],
            'duration_minutes' => [
                'nullable',
                'integer',
            ],
            'medium' => [
                'required',
                'in:online,offline',
            ],
        ];
    }
}
