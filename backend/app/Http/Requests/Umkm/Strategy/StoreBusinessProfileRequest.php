<?php

namespace App\Http\Requests\Umkm\Strategy;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessProfileRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'vision' => [
                'nullable',
                'string',
            ],

            'mission' => [
                'nullable',
                'string',
            ],

            'main_product' => [
                'nullable',
                'string',
                'max:255',
            ],

            'annual_revenue' => [
                'nullable',
                'string',
                'max:100',
            ],

            'market_target' => [
                'nullable',
                'string',
                'max:255',
            ],

            'production_workflow' => [
                'nullable',
                'string',
            ],

            'has_sop' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'has_sop' => filter_var($this->has_sop, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);

        if ($this->main_product) {
            $this->merge([
                'main_product' => trim($this->main_product),
            ]);
        }

        if ($this->market_target) {
            $this->merge([
                'market_target' => trim($this->market_target),
            ]);
        }
    }
}
