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
                'date_format:Y-m-d\TH:i',
            ],
            'duration_minutes' => [
                'nullable',
                'integer',
            ],
            'medium' => [
                'required',
                'in:online,offline',
            ],
            'meeting_link' => [
                'nullable',
                'string',
                'max:500',
            ],
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }
}
