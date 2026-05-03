<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     *
     * @throws ValidationException
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'nik' => ['required', 'string', 'size:16', Rule::unique(User::class)],
            'dob' => ['required', 'date'],
            'password' => $this->passwordRules(),
            'avatar' => ['nullable', 'image', 'max:2048'],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'nik' => $input['nik'],
            'dob' => $input['dob'],
            'password' => Hash::make($input['password']),
        ]);

        if (isset($input['avatar']) && $input['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            $user->addMedia($input['avatar'])->toMediaCollection('avatars');
        }

        // Assign default role for new registrations
        $user->assignRole('umkm');

        return $user;
    }
}
