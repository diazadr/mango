<?php

namespace App\Http\Requests\Umkm\Machine;

use Illuminate\Foundation\Http\FormRequest;

class ApproveReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', 'in:approve,reject'],
            'comment' => ['nullable', 'string'],
        ];
    }
}
