<?php

namespace App\Http\Requests\Advisor;

use Illuminate\Foundation\Http\FormRequest;

class AssignDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => [
                'required',
                'exists:departments,id',
            ],
        ];
    }
}
