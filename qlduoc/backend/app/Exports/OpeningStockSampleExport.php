<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OpeningStockSampleExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        return [
            [
                'ma_thuoc' => 'THUOC001',
                'ten_thuoc' => 'Paracetamol 500mg', // Optional, for reference
                'so_lo' => 'BATCH001',
                'han_dung' => '2026-12-31',
                'so_luong' => 100,
                'don_gia' => 5000,
            ],
            [
                'ma_thuoc' => 'THUOC002',
                'ten_thuoc' => 'Vitamin C',
                'so_lo' => 'BATCH002',
                'han_dung' => '2025-06-30',
                'so_luong' => 50,
                'don_gia' => 2000,
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'ma_thuoc',
            'ten_thuoc',
            'so_lo',
            'han_dung',
            'so_luong',
            'don_gia',
        ];
    }
}
