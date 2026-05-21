<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasRole('super_admin');
    }

    public function rules()
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:permissions,name',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->name) {
            $this->merge([
                'name' => trim(strtolower($this->name)),
            ]);
        }
    }
}
