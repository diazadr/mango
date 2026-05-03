<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Foundation\Http\FormRequest;

class StoreUmkmRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'has_sop' => filter_var($this->has_sop, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }

    public function rules()
    {
        return [
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'name' => ['required', 'string', 'max:255'],
            'legal_entity_type' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'province' => ['required', 'string'],
            'regency' => ['required', 'string'],
            'district' => ['required', 'string'],
            'village' => ['required', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'sector' => ['required', 'string', 'max:255'],
            'nib' => ['required', 'string', 'max:20'],
            'established_year' => ['required', 'integer', 'min:1900', 'max:'.date('Y')],
            'employee_count' => ['required', 'integer', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'certifications' => ['nullable', 'array'],
            'main_product' => ['nullable', 'string', 'max:255'],
            'market_target' => ['nullable', 'string', 'max:255'],

            // Document uploads
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'nib_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
