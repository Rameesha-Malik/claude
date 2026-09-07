<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Offline-payment purchase record for a single priced note -- mirrors
     * the `payments` table (bank transfer/Easypaisa/JazzCash + proof
     * upload, admin verifies) exactly, just against a note instead of an
     * enrollment. This is what "Purchase Requests" on the Guaranteed
     * Notes admin page reviews.
     */
    public function up(): void
    {
        Schema::create('note_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('note_id')->constrained('notes_bank')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('method');
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('reference_number')->nullable();
            $table->string('proof_file_path')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_purchases');
    }
};
