<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUmkmRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation()
    {
        // Fields that should be converted to NULL if they are empty strings
        $nullableFields = [
            'latitude', 'longitude', 'employee_count',
            'established_year', 'website', 'email', 'postal_code', 'organization_id',
            'village',
            'nib',
            'main_product', 'market_target',
        ];

        foreach ($nullableFields as $field) {
            if ($this->has($field) && ($this->input($field) === '' || $this->input($field) === 'null')) {
                $this->merge([$field => null]);
            }
        }

        // Decode JSON fields if they arrive as strings (multipart/form-data behavior)
        if ($this->has('operating_hours') && is_string($this->operating_hours)) {
            $this->merge([
                'operating_hours' => json_decode($this->operating_hours, true),
            ]);
        }

        if ($this->has('certifications') && is_string($this->certifications)) {
            $this->merge([
                'certifications' => json_decode($this->certifications, true),
            ]);
        }

        if ($this->has('has_sop')) {
            $this->merge([
                'has_sop' => filter_var($this->has_sop, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }

    public function rules()
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'legal_entity_type' => ['sometimes', 'string'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['sometimes', 'string'],
            'province' => ['sometimes', 'string'],
            'regency' => ['sometimes', 'string'],
            'district' => ['sometimes', 'string'],
            'village' => ['sometimes', 'nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'sector' => ['sometimes', 'string', 'max:100'],
            'nib' => ['sometimes', 'nullable', 'string', 'max:100'],
            'established_year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:'.date('Y')],
            'employee_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'certifications' => ['nullable', 'array'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'nib_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],

            // Strategic Profile fields
            'vision' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],
            'main_product' => ['nullable', 'string', 'max:255'],
            'market_target' => ['nullable', 'string', 'max:255'],
        ];
    }
}
