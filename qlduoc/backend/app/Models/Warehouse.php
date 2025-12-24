<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Warehouse extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_id',
        'code',
        'name',
        'type',
        'department',
        'is_pharmacy',
        'active',
        'sub_account_id',
    ];

    protected $casts = [
        'is_pharmacy' => 'boolean',
        'active' => 'boolean',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function subAccount()
    {
        return $this->belongsTo(SubAccount::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'warehouse_user');
    }

    public function batches()
    {
        return $this->hasMany(WarehouseBatch::class);
    }
}
