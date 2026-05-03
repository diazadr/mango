<?php

namespace App\Services\Umkm\Strategy;

use App\Models\Umkm\MachineManual;
use App\Models\Umkm\ProductionCapacity;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class TechnicalProfileService
{
    public function getProductionCapacities(
        Umkm $umkm
    ): Collection {
        return $umkm->productionCapacities;
    }

    public function storeProductionCapacity(
        Umkm $umkm,
        array $data
    ): ProductionCapacity {
        return $umkm
            ->productionCapacities()
            ->create($data);
    }

    public function updateProductionCapacity(
        ProductionCapacity $capacity,
        array $data
    ): ProductionCapacity {
        $capacity->update($data);

        return $capacity->fresh();
    }

    public function deleteProductionCapacity(
        ProductionCapacity $capacity
    ): bool {
        return $capacity->delete();
    }

    public function getMachineManuals(
        Umkm $umkm
    ): Collection {
        return $umkm->machineManuals;
    }

    public function storeMachineManual(
        Umkm $umkm,
        array $data
    ): MachineManual {
        $image = $data['image'] ?? null;
        unset($data['image']);

        $machine = $umkm->machineManuals()->create($data);

        if ($image && $image instanceof UploadedFile) {
            $machine->addMedia($image)->toMediaCollection('images');
        }

        return $machine;
    }

    public function updateMachineManual(
        MachineManual $machine,
        array $data
    ): MachineManual {
        $image = $data['image'] ?? null;
        unset($data['image']);

        $machine->update($data);

        if ($image && $image instanceof UploadedFile) {
            $machine->addMedia($image)->toMediaCollection('images');
        }

        return $machine->fresh();
    }

    public function deleteMachineManual(
        MachineManual $machine
    ): bool {
        return $machine->delete();
    }
}
