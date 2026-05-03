<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            AssessmentCategorySeeder::class,
            QuestionSeeder::class,
            InstitutionSeeder::class,
            OrganizationSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
            UmkmSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
