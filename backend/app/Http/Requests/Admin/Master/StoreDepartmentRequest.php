<?php

namespace App\Http\Requests\Admin\Master;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin')
            || $this->user()?->hasRole('admin');
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('organization_id') && ! $this->filled('institution_id')) {
            $this->merge([
                'institution_id' => $this->organization_id,
            ]);
        }

        if ($this->filled('name')) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'institution_id' => [
                'required',
                'integer',
                'exists:institutions,id',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ];
    }
}
