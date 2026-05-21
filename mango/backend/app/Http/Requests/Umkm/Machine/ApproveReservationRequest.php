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
            'action'          => ['required', 'in:approve,reject'],
            'comment'         => ['nullable', 'string', 'max:2000'],
            'quoted_price'    => ['nullable', 'numeric', 'min:0'],
            'quotation_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'action.required'       => 'Aksi (approve/reject) wajib dipilih.',
            'action.in'             => 'Aksi tidak valid.',
            'quoted_price.numeric'  => 'Harga penawaran harus berupa angka.',
            'quoted_price.min'      => 'Harga penawaran tidak boleh negatif.',
        ];
    }
}
