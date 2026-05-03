<?php

namespace App\Http\Requests\Umkm\Machine;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalise datetime-local values (e.g. "2026-04-28T10:00") 
     * to standard PHP-parseable format ("2026-04-28 10:00").
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'start_time' => $this->start_time
                ? str_replace('T', ' ', $this->start_time)
                : null,
            'end_time' => $this->end_time
                ? str_replace('T', ' ', $this->end_time)
                : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'machine_id' => ['required', 'exists:machines,id'],
            'start_time' => ['required', 'date', 'after_or_equal:now'],
            'end_time'   => ['required', 'date', 'after:start_time'],
            'purpose'    => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'machine_id.required'    => 'Mesin wajib dipilih.',
            'machine_id.exists'      => 'Mesin tidak ditemukan.',
            'start_time.required'    => 'Waktu mulai wajib diisi.',
            'start_time.date'        => 'Format waktu mulai tidak valid.',
            'start_time.after_or_equal' => 'Waktu mulai tidak boleh di masa lalu.',
            'end_time.required'      => 'Waktu selesai wajib diisi.',
            'end_time.date'          => 'Format waktu selesai tidak valid.',
            'end_time.after'         => 'Waktu selesai harus setelah waktu mulai.',
            'purpose.required'       => 'Tujuan penggunaan wajib diisi.',
        ];
    }
}
