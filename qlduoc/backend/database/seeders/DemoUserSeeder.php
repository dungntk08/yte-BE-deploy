<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a Demo Account
        $account = Account::create([
            'name' => 'Nhà Thuốc Demo',
            'active' => true,
        ]);

        // Create an Admin Role for this Account
        $role = Role::create([
            'name' => 'Quản trị viên',
            'description' => 'Quản trị toàn bộ hệ thống nhà thuốc',
            'account_id' => $account->id,
        ]);

        // Create Default Rules
        $rules = [
            ['code' => 'product.view', 'description' => 'Xem danh sách sản phẩm'],
            ['code' => 'product.create', 'description' => 'Thêm mới sản phẩm'],
            ['code' => 'product.update', 'description' => 'Cập nhật sản phẩm'],
            ['code' => 'product.delete', 'description' => 'Xóa sản phẩm'],
        ];

        foreach ($rules as $r) {
            $rule = \App\Models\Rule::firstOrCreate(['code' => $r['code']], $r);
            $role->rules()->attach($rule->id);
        }

        // Create the Demo User
        User::create([
            'name' => 'Dược sĩ Demo',
            'email' => 'demo@qlduoc.com',
            'password' => Hash::make('123123'),
            'account_id' => $account->id,
            'role_id' => $role->id,
        ]);

        $this->command->info('Demo User Created:');
        $this->command->info('Email: demo@qlduoc.com');
        $this->command->info('Password: 123123');
    }
}
