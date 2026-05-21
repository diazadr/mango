<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;

class AssignRoleRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasRole('super_admin')
            || $this->user()?->hasRole('admin');
    }

    public function rules()
    {
        return [
            'roles' => [
                'required',
                'array',
                'min:1',
            ],

            'roles.*' => [
                'required',
                'string',
                'exists:roles,name',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        if (is_array($this->roles)) {
            $this->merge([
                'roles' => array_map(fn ($role) => trim($role), $this->roles),
            ]);
        }
    }
}
