<?php

namespace App\Http\Requests\Umkm\Operation;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sku' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
            'dimensions' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'min_stock_level' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->name) {
            $this->merge([
                'name' => trim($this->name),
            ]);
        }

        if ($this->sku) {
            $this->merge([
                'sku' => trim($this->sku),
            ]);
        }
    }
}
