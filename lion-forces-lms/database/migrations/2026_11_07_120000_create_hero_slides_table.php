<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-editable content for the homepage hero slider (Army/Navy/Air
 * Force). `branch_key` is the stable identifier the frontend matches
 * against its own crest asset and bundled fallback photo; `branch` is
 * the admin-editable display label shown on the slide.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('branch_key')->unique();
            $table->string('branch');
            $table->string('title');
            $table->string('motto')->nullable();
            $table->string('motto_translation')->nullable();
            $table->text('description');
            $table->string('cta_href');
            $table->string('image_path')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
