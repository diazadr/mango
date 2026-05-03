<?php

namespace App\Services\Umkm\Strategy;

use App\Models\Umkm\Umkm;

class BusinessProfileService
{
    public function upsert(Umkm $umkm, array $data)
    {
        $umkm->update($data);
        return $umkm;
    }
}
