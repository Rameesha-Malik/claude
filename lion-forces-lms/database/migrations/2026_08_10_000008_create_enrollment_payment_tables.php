<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('course_packages')->nullOnDelete();
            $table->enum('status', ['pending', 'active', 'suspended', 'expired'])->default('pending');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        // Manual payment verification: bank transfer / Easypaisa / JazzCash
        // now, with a gateway field ready for future online integration
        // without a schema change.
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('method', ['bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other'])->default('bank_transfer');
            $table->enum('status', ['pending', 'verified', 'rejected', 'refunded'])->default('pending');
            $table->string('reference_number')->nullable();
            $table->string('proof_file_path')->nullable(); // uploaded receipt screenshot
            $table->text('notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('enrollments');
    }
};
