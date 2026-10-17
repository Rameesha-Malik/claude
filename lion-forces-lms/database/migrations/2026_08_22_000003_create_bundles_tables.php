<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A bundle sells access to several courses at once for one combined
     * price. Purchasing mirrors the existing single-course manual-payment
     * flow (Enrollment + Payment, admin verifies, enrollment activates) but
     * a bundle purchase fans out into one Enrollment per included course --
     * hence bundle_purchases as its own record (like Payment) rather than
     * trying to force a single Payment to reference many enrollments.
     */
    public function up(): void
    {
        Schema::create('bundles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        Schema::create('bundle_course', function (Blueprint $table) {
            $table->foreignId('bundle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->primary(['bundle_id', 'course_id']);
        });

        Schema::create('bundle_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bundle_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('method', ['bank_transfer', 'easypaisa', 'jazzcash', 'card', 'other'])->default('bank_transfer');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('reference_number')->nullable();
            $table->string('proof_file_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        // Traceability: which enrollments came from a bundle purchase, so
        // verifying/rejecting the purchase can batch-update all of them at
        // once. Nullable — every existing (single-course) enrollment is
        // unaffected.
        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('bundle_purchase_id')->nullable()->after('package_id')
                ->constrained('bundle_purchases')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bundle_purchase_id');
        });

        Schema::dropIfExists('bundle_purchases');
        Schema::dropIfExists('bundle_course');
        Schema::dropIfExists('bundles');
    }
};
