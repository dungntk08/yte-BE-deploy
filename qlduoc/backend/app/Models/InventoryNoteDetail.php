<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryNoteDetail extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inventory_note_id',
        'product_id',
        'batch_code',
        'expiry_date',
        'quantity',
        'price',
        'vat',
        'discount',
        'unit',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'vat' => 'decimal:2',
        'discount' => 'decimal:2',
    ];

    public function note()
    {
        return $this->belongsTo(InventoryNote::class, 'inventory_note_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
