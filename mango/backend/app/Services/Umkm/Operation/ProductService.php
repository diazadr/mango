<?php

namespace App\Services\Umkm\Operation;

use App\Models\Umkm\Product;
use App\Models\Umkm\Umkm;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function create(Umkm $umkm, array $data): Product
    {
        return DB::transaction(function () use ($umkm, $data) {
            return Product::create([
                'umkm_id' => $umkm->id,
                ...$data,
            ]);
        });
    }

    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $product->update($data);

            return $product;
        });
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $product->delete();
        });
    }
}
