<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use App\Models\Product;

class ProductsImport implements ToModel, WithHeadingRow, SkipsEmptyRows
{
    protected $accountId;
    protected $categoryId;

    public function __construct(string $accountId, ?string $categoryId = null)
    {
        $this->accountId = $accountId;
        $this->categoryId = $categoryId;
    }

    public function model(array $row)
    {
        $dmdcCode = $row['ma_dmdc'] ?? null;
        
        $data = [
            'account_id' => $this->accountId,
            'category_id' => $this->categoryId,
            
            'dmdc_code' => $dmdcCode ?? $row['duocid'] ?? null,
            'name' => $row['ten_thuoc'] ?? 'Unknown Product',
            'active_ingredient' => $row['hoat_chat'] ?? null,
            'concentration' => $row['ham_luong'] ?? null,
            'registration_number' => $row['so_dang_ky'] ?? $row['sodk'] ?? null,
            'unit' => $row['don_vi_tinh'] ?? null,
            'price' => isset($row['don_gia']) ? (float)$row['don_gia'] : 0,
            'manufacturer' => $row['hang_sx'] ?? $row['hangsanxuat'] ?? null,
            'country_of_origin' => $row['nuoc_sx'] ?? $row['nuocsanxuat'] ?? null,
            'bidder' => $row['nha_thau'] ?? $row['nhathau'] ?? null,
            'hospital_drug_code' => $row['ma_thuoc_bv'] ?? null,
            'active_ingredient_code' => $row['ma_hoat_chat'] ?? $row['mahoatchat'] ?? null,
            'usage_route_code' => $row['ma_duong_dung'] ?? null,
            'usage_route' => $row['duong_dung'] ?? null,
            'packaging_spec' => $row['dong_goi'] ?? null,
            'drug_type' => $row['loai_thuoc'] ?? null,
            'bid_type' => $row['loai_thau'] ?? null,
            'bid_group' => $row['nhom_thau'] ?? $row['nhomthau'] ?? null,
            'decision_number' => $row['quyet_dinh'] ?? $row['soqdthau'] ?? null, // Map soQDThau to decision_number if needed
            
            // New Columns
            'insurance_name' => $row['ten_bhyt'] ?? $row['tenbhyt'] ?? null,
            'approval_order' => $row['stt_phe_duyet'] ?? $row['sttpheduyet'] ?? null,
            'byt_order' => $row['stt_dm_byt'] ?? $row['sttdmbyt'] ?? null,
            'bid_price' => isset($row['don_gia_thau']) ? (float)$row['don_gia_thau'] : (isset($row['dongrathau']) ? (float)$row['dongrathau'] : 0),
            'bid_package' => $row['goi_thau'] ?? $row['goithau'] ?? null,
            'bid_decision_issuer' => $row['don_vi_ban_hanh_qd_thau'] ?? $row['donvibanhanhqdthau'] ?? null,
            'winning_bid_date' => $this->transformDate($row['ngay_trung_thau'] ?? $row['ngaytrungthau'] ?? null),
            'issuance_year' => $row['nam_ban_hanh'] ?? $row['nambanhanh'] ?? null,
            'bid_info_130' => $row['thong_tin_thau_130'] ?? $row['thongtinthau130'] ?? null,
            'is_priority' => filter_var($row['uu_tien'] ?? $row['uutien'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'hospital_id' => $row['benh_vien_id'] ?? $row['benhvienid'] ?? null,
            'external_id' => $row['external_id'] ?? $row['id'] ?? null,
            'active' => isset($row['active']) ? filter_var($row['active'], FILTER_VALIDATE_BOOLEAN) : (isset($row['isactive']) ? filter_var($row['isactive'], FILTER_VALIDATE_BOOLEAN) : true),
        ];

        // Upsert Logic
        // Prefer dmdc_code (duocId)
        $upsertKey = $data['dmdc_code'];
        if ($upsertKey) {
            $existing = Product::where('account_id', $this->accountId)
                               ->where('dmdc_code', $upsertKey)
                               ->first();
            if ($existing) {
                $existing->update($data);
                return $existing;
            }
        }

        // Optional: fallback duplicate check by registration number if needed
        // For now, strict DMDC check as requested.
        
        return new Product($data);
    }

    private function transformDate($value)
    {
        if (!$value) return null;
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}
