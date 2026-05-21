<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;

class SyncPermissionRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasRole('super_admin')
            || $this->user()?->hasRole('admin');
    }

    public function rules()
    {
        return [
            'permissions' => [
                'required',
                'array',
                'min:1',
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
        if (is_array($this->permissions)) {
            $this->merge([
                'permissions' => array_map(fn ($p) => trim(strtolower($p)), $this->permissions),
            ]);
        }
    }
}
