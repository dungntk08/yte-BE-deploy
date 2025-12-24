<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryNote extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'type', // import, export
        'warehouse_id', // Source for export, Dest for import (wait, 'warehouse_id' is usually WHERE stock is affected. For Export, it's Source.)
        'supplier_id',
        'inventory_request_id',
        'destination_warehouse_id',
        'receiver_id',
        'receiver_name',
        'created_by',
        'status',
        'description',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function destinationWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function inventoryRequest()
    {
        return $this->belongsTo(InventoryRequest::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(InventoryNoteDetail::class);
    }
}
