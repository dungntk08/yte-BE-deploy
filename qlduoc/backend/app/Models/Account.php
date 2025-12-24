<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Account extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'active'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function subAccounts()
    {
        return $this->hasMany(SubAccount::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class);
    }
}
