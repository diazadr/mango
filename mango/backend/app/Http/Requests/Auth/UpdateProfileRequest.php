<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                'unique:users,email,'.$this->user()->id,
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'nik' => [
                'nullable',
                'string',
                'size:16',
                'unique:users,nik,'.$this->user()->id,
            ],
            'dob' => ['nullable', 'date'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
