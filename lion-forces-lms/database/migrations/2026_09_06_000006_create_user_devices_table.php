<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Restrict students to primary device only" / "Max device login" (Settings
 * > Security reference screenshot). One row per device a student has
 * logged in from, so the login flow can count/recognize devices and an
 * admin can reset a student stuck on a dead/lost device.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_token');
            $table->string('user_agent')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'device_token']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
