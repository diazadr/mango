<?php

namespace App\Http\Requests\Admin\RBAC;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['super_admin', 'admin', 'upt']);
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('organization_id') && ! $this->filled('institution_id')) {
            $this->merge([
                'institution_id' => $this->organization_id,
            ]);
        }

        if ($this->filled('email')) {
            $this->merge([
                'email' => strtolower($this->email),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'integer', 'exists:institutions,id'],
        ];
    }
}
