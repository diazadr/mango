<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;

class AddRoleRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasRole('super_admin')
            || $this->user()?->hasRole('admin');
    }

    public function rules()
    {
        return [
            'role' => [
                'required',
                'string',
                'exists:roles,name',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->role) {
            $this->merge([
                'role' => trim($this->role),
            ]);
        }
    }
}
