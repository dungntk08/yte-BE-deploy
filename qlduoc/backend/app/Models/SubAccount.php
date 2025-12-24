<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SubAccount extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_id',
        'name',
        'code',
        'active',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class);
    }
}
