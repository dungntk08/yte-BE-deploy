<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountSetupController extends Controller
{
    public function setup(Request $request)
    {
        $request->validate([
            'account_name' => 'required|string|max:255',
            'user_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Create Account
            $account = Account::create([
                'name' => $request->account_name,
                'active' => true,
            ]);

            // 2. Create Master Role
            $role = Role::create([
                'name' => 'Master',
                'description' => 'Master Administrator',
                'account_id' => $account->id,
            ]);

            // 3. Create User
            $user = User::create([
                'name' => $request->user_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'account_id' => $account->id,
                'role_id' => $role->id,
            ]);

            // 4. Create Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Account setup successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load('account', 'role'),
            ], 201);
        });
    }
}
