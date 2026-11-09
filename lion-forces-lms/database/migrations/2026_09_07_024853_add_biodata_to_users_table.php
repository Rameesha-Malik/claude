<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Student Profile reference (admin panel): a "Biodata" panel with
     * Father Name / CNIC / Mobile / Education / Address. Mobile already
     * exists as `phone` -- these four are the genuinely new fields.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('father_name')->nullable()->after('phone');
            $table->string('cnic')->nullable()->after('father_name');
            $table->string('education')->nullable()->after('cnic');
            $table->text('address')->nullable()->after('education');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['father_name', 'cnic', 'education', 'address']);
        });
    }
};
