<?php

namespace App\Http\Requests\Admin\Master;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasAnyRole(['super_admin', 'admin', 'upt']);
    }

    public function rules()
    {
        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'pic_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'pic_phone' => [
                'nullable',
                'string',
                'max:20',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            'province' => [
                'nullable',
                'string',
                'max:255',
            ],

            'regency' => [
                'nullable',
                'string',
                'max:255',
            ],

            'district' => [
                'nullable',
                'string',
                'max:255',
            ],

            'village' => [
                'nullable',
                'string',
                'max:255',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:10',
            ],

            'logo' => [
                'nullable',
                'image',
                'max:2048',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->name) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        if ($this->email) {
            $this->merge([
                'email' => strtolower($this->email),
            ]);
        }
    }
}
