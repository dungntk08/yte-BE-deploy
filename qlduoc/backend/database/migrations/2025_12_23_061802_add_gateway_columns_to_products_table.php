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
            $table->string('insurance_name')->nullable(); // tenBhyt
            $table->string('approval_order')->nullable(); // sttPheDuyet
            $table->string('byt_order')->nullable(); // sttDmByt
            $table->decimal('bid_price', 15, 2)->default(0); // donGiaThau
            $table->string('bid_package')->nullable(); // goiThau
            $table->string('bid_decision_issuer')->nullable(); // donViBanHanhQdThau
            $table->date('winning_bid_date')->nullable(); // ngayTrungThau
            $table->integer('issuance_year')->nullable(); // namBanHanh
            $table->string('bid_info_130')->nullable(); // thongTinThau130
            $table->boolean('is_priority')->default(false); // uuTien
            $table->string('hospital_id')->nullable(); // benhVienId (External)
            $table->string('external_id')->nullable(); // JSON id
            $table->boolean('active')->default(true); // isActive
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
