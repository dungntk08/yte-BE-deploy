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
        Schema::create('role_rule', function (Blueprint $table) {
            $table->id(); // Pivot table usually fine with bigInt ID, or can be omitted if no model. But foreign keys must match type.
            $table->uuid('role_id');
            $table->uuid('rule_id');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('rule_id')->references('id')->on('rules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_rule');
    }
};
