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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('account_id')->index();
            $table->uuid('category_id')->nullable()->index();
            
            // Basic Info
            $table->string('code')->nullable(); // SKU
            $table->string('name'); // Tên dược
            $table->string('unit')->nullable(); // Đơn vị tính
            $table->decimal('price', 15, 2)->default(0);
            $table->integer('min_stock')->default(0);

            // Detailed Pharma Info from Image
            $table->string('material_type')->nullable(); // Loại vật tư (Thuốc/VTYT)
            $table->string('drug_type')->nullable(); // Loại thuốc
            $table->string('concentration')->nullable(); // Hàm lượng
            $table->string('active_ingredient')->nullable(); // Hoạt chất
            $table->string('active_ingredient_code')->nullable(); // Mã hoạt chất
            $table->string('registration_number')->nullable(); // Số đăng ký
            $table->string('usage_route')->nullable(); // Đường dùng
            $table->string('dosage')->nullable(); // Liều dùng
            $table->string('pharma_type')->nullable(); // Loại dược
            $table->string('pharma_group')->nullable(); // Phân nhóm dược
            $table->string('drug_group')->nullable(); // Nhóm dược
            $table->string('insurance_group')->nullable(); // Nhóm DVKT BHYT
            $table->string('dmdc_code')->nullable(); // Mã DMDC
            $table->string('byt_decision_name')->nullable(); // Tên QĐ BYT
            $table->string('packaging_spec')->nullable(); // Quy cách
            $table->string('program')->nullable(); // Chương trình
            $table->text('indication')->nullable(); // Công dụng
            $table->integer('insurance_coverage_rate')->nullable(); // Tỷ lệ BHYT
            $table->string('goods_code')->nullable(); // Mã hàng hóa
            $table->string('prescription_unit')->nullable(); // DVT đơn thuốc
            $table->string('qd130_code')->nullable(); // Mã hiệu sản phẩm QĐ130
            $table->string('funding_source')->nullable(); // Nguồn tài trợ

            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
