<?php

namespace App\Services\Admin\RBAC;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function getUsers(array $filters, $user)
    {
        if ($user->hasRole('super_admin')) {
            $query = User::query();
        } else {
            $institutionIds = $user->institutions()->pluck('institutions.id');

            $query = User::query()
                ->whereHas('institutions', function ($builder) use ($institutionIds) {
                    $builder->whereIn('institutions.id', $institutionIds);
                });
        }

        $query->with(['roles', 'institutions', 'organizations']);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['role'])) {
            $role = $filters['role'];
            $query->whereHas('roles', function ($builder) use ($role) {
                $builder->where('name', $role);
            });
        }

        $sortableColumns = ['name', 'email', 'phone', 'is_active', 'created_at'];
        $sortBy = in_array($filters['sort_by'] ?? '', $sortableColumns) ? $filters['sort_by'] : 'created_at';
        $sortDir = strtolower($filters['sort_dir'] ?? '') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'avatar' => $data['avatar'] ?? null,
                'email_verified_at' => now(), // Auto-verify for admin-created users
            ]);

            if (! empty($data['role'])) {
                $user->assignRole($data['role']);
            }

            if (! empty($data['institution_id'])) {
                $user->institutions()->attach($data['institution_id'], [
                    'is_active' => true,
                    'joined_at' => now(),
                    'department_id' => $data['department_id'] ?? null,
                ]);
            }

            if (! empty($data['organization_id'])) {
                $user->organizations()->attach($data['organization_id'], [
                    'is_active' => true,
                    'joined_at' => now(),
                ]);
            }

            return $user->load('roles', 'institutions', 'organizations');
        });
    }

    public function update(User $user, array $data)
    {
        return DB::transaction(function () use ($user, $data) {

            if (! empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            if (isset($data['role'])) {
                $user->syncRoles([$data['role']]);
            }

            return $user->load('roles', 'institutions', 'organizations');
        });
    }

    public function delete(User $user)
    {
        return $user->delete();
    }
}
