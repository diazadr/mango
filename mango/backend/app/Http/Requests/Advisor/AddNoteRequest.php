<?php

namespace App\Http\Requests\Advisor;

use Illuminate\Foundation\Http\FormRequest;

class AddNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'               => ['required', 'string'],
            'improved_categories'   => ['nullable', 'array'],
            'improved_categories.*' => ['integer', 'exists:assessment_categories,id'],
            'session_output'        => ['nullable', 'string', 'max:2000'],
            'has_measurable_impact' => ['boolean'],
        ];
    }
}
