<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductionCapacityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in policy/controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_name' => ['required', 'string', 'max:255'],
            'capacity_per_day' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
