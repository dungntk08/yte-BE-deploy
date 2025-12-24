<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_id',
        'code',
        'request_warehouse_id',
        'supply_warehouse_id',
        'created_by',
        'status',
        'description',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function requestWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'request_warehouse_id');
    }

    public function supplyWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'supply_warehouse_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(InventoryRequestDetail::class);
    }
}
