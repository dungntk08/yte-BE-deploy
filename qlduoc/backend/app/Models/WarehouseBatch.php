<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WarehouseBatch extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'batch_code',
        'expiry_date',
        'quantity',
        'import_price',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
