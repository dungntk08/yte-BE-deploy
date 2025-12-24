<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Supplier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_id',
        'code',
        'name',
        'phone',
        'email',
        'address',
        'tax_code',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function scopeAccessible($query, $accountId)
    {
        return $query->where(function($q) use ($accountId) {
             $q->whereNull('account_id')
               ->orWhere('account_id', $accountId);
        });
    }

    public function inventoryNotes()
    {
        return $this->hasMany(InventoryNote::class);
    }
}
