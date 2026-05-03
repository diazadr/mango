<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitAnswersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array'],
            'answers.*.question_id' => [
                'required',
                'exists:questions,id',
            ],
            'answers.*.value' => ['required'],
            'answers.*.score' => [
                'required',
                'numeric',
                'min:1',
                'max:5',
            ],
        ];
    }
}
