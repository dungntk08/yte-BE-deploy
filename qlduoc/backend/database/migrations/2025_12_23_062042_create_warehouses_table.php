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
        Schema::create('warehouses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('account_id')->index();
            $table->string('code');
            $table->string('name');
            $table->string('type')->nullable(); // Loại kho
            $table->string('department')->nullable(); // Phòng ban
            $table->boolean('is_pharmacy')->default(true); // Kho dược (Yes/No)
            $table->boolean('active')->default(true); // Hoạt động
            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
        });

        Schema::create('warehouse_user', function (Blueprint $table) {
            $table->id();
            $table->uuid('warehouse_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['warehouse_id', 'user_id']); // Prevent duplicate assignments
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_user');
        Schema::dropIfExists('warehouses');
    }
};
