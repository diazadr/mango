<?php

namespace App\Http\Requests\Advisor;

use Illuminate\Foundation\Http\FormRequest;

class AssignMentorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mentor_user_id' => [
                'required',
                'exists:users,id',
            ],
        ];
    }
}
