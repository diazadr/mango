<?php

namespace App\Services\Admin\Master;

use App\Models\Master\Organization;
use Illuminate\Support\Str;

class OrganizationService
{
    public function create(array $data): Organization
    {
        return Organization::create([
            ...$data,
            'is_active' => true,
        ]);
    }

    public function update(
        Organization $organization,
        array $data
    ): Organization {
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']).'-'.time();
        }

        $organization->update($data);

        return $organization->fresh();
    }

    public function delete(
        Organization $organization
    ): ?bool {
        return $organization->delete();
    }
}
