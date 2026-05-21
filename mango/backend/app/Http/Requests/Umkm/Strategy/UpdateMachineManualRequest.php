<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMachineManualRequest extends FormRequest
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
            'machine_name' => ['sometimes', 'required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'power_consumption' => ['nullable', 'integer', 'min:0'],
            'purchase_year' => ['nullable', 'integer', 'min:1900', 'max:'.date('Y')],
            'last_maintenance_at' => ['nullable', 'date'],
            'maintenance_interval' => ['nullable', 'integer', 'min:0'],
            'dimensions' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'quantity' => ['sometimes', 'required', 'integer', 'min:1'],
            'condition' => ['sometimes', 'required', 'in:good,fair,poor'],
            'notes' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
