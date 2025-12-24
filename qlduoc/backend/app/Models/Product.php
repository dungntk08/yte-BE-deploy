<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_id',
        'category_id',
        'code',
        'name',
        'unit',
        'price',
        'min_stock',
        'material_type',
        'drug_type',
        'concentration',
        'active_ingredient',
        'active_ingredient_code',
        'registration_number',
        'usage_route',
        'dosage',
        'pharma_type',
        'pharma_group',
        'drug_group',
        'insurance_group',
        'dmdc_code',
        'byt_decision_name',
        'packaging_spec',
        'program',
        'indication',
        'insurance_coverage_rate',
        'goods_code',
        'prescription_unit',
        'qd130_code',
        'funding_source',
        'manufacturer',
        'country_of_origin',
        'bidder',
        'hospital_drug_code',
        'bid_type',
        'bid_group',
        'decision_number',
        'usage_route_code',
        'insurance_name',
        'approval_order',
        'byt_order',
        'bid_price',
        'bid_package',
        'bid_decision_issuer',
        'winning_bid_date',
        'issuance_year',
        'bid_info_130',
        'is_priority',
        'hospital_id',
        'external_id',
        'active',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function batches()
    {
        return $this->hasMany(WarehouseBatch::class);
    }

    // Helper to get total stock
    public function getTotalStockAttribute()
    {
        return $this->batches()
            ->where('expiry_date', '>=', now())
            ->sum('quantity');
    }
}
