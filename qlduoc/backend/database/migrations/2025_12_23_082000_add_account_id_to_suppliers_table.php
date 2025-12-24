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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->foreignUuid('account_id')->nullable()->after('id')->constrained('accounts')->cascadeOnDelete();
            
            // Drop the global unique index on code
            $table->dropUnique(['code']);
            
            // Allow duplicates for now or manage via logic. 
            // We can add a complex unique index later if needed.
            // $table->unique(['account_id', 'code']); // This works for non-null account_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn('account_id');
            $table->unique('code');
        });
    }
};
