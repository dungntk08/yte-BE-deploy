<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Facades\Auth;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Filter by user's account
        return Product::where('account_id', Auth::user()->account_id)->get();
    }

    public function headings(): array
    {
        return [
            'MA_DMDC', // Key
            'TEN_THUOC',
            'HOAT_CHAT',
            'HAM_LUONG',
            'SO_DANG_KY',
            'DON_VI_TINH',
            'DON_GIA',
            'HANG_SX',
            'NUOC_SX',
            'NHA_THAU',
            'MA_THUOC_BV',
            'MA_HOAT_CHAT',
            'MA_DUONG_DUNG',
            'DUONG_DUNG',
            'DONG_GOI',
            'LOAI_THUOC',
            'LOAI_THAU',
            'NHOM_THAU',
            'QUYET_DINH',
            'TEN_BHYT',
            'STT_PHE_DUYET',
            'STT_DM_BYT',
            'DON_GIA_THAU',
            'GOI_THAU',
            'DON_VI_BAN_HANH_QD_THAU',
            'NGAY_TRUNG_THAU',
            'NAM_BAN_HANH',
            'THONG_TIN_THAU_130',
            'UU_TIEN',
            'BENH_VIEN_ID',
            'EXTERNAL_ID',
            'ACTIVE'
        ];
    }

    public function map($product): array
    {
        return [
            $product->dmdc_code,
            $product->name,
            $product->active_ingredient,
            $product->concentration,
            $product->registration_number,
            $product->unit,
            $product->price,
            $product->manufacturer,
            $product->country_of_origin,
            $product->bidder,
            $product->hospital_drug_code,
            $product->active_ingredient_code,
            $product->usage_route_code,
            $product->usage_route,
            $product->packaging_spec,
            $product->drug_type,
            $product->bid_type,
            $product->bid_group,
            $product->decision_number,
            $product->insurance_name,
            $product->approval_order,
            $product->byt_order,
            $product->bid_price,
            $product->bid_package,
            $product->bid_decision_issuer,
            $product->winning_bid_date,
            $product->issuance_year,
            $product->bid_info_130,
            $product->is_priority ? '1' : '0',
            $product->hospital_id,
            $product->external_id,
            $product->active ? '1' : '0',
        ];
    }
}
