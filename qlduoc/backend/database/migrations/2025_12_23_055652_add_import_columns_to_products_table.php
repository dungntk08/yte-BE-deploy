<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('manufacturer')->nullable(); // HANG_SX
            $table->string('country_of_origin')->nullable(); // NUOC_SX
            $table->string('bidder')->nullable(); // NHA_THAU
            $table->string('hospital_drug_code')->nullable(); // MA_THUOC_BV
            $table->string('bid_type')->nullable(); // LOAI_THAU
            $table->string('bid_group')->nullable(); // NHOM_THAU
            $table->string('decision_number')->nullable(); // QUYET_DINH
            $table->string('usage_route_code')->nullable(); // MA_DUONG_DUNG
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
