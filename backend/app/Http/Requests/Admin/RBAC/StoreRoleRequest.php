<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
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
                'unique:roles,name',
            ],

            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'required',
                'string',
                'exists:permissions,name',
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

        if (is_array($this->permissions)) {
            $this->merge([
                'permissions' => array_map(fn ($p) => trim(strtolower($p)), $this->permissions),
            ]);
        }
    }
}
