<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryRequestDetail extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inventory_request_id',
        'product_id',
        'quantity',
        'unit',
    ];

    public function request()
    {
        return $this->belongsTo(InventoryRequest::class, 'inventory_request_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
