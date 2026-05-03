<?php

namespace App\Http\Requests\Admin\RBAC;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user') instanceof User
            ? $this->route('user')->id
            : $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'role' => ['sometimes', 'required', 'string', 'exists:roles,name'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
