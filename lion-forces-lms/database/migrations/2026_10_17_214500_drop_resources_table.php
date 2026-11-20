<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client: remove the whole Resources feature (Admin > Resources, the
     * public /resources page, and everything behind them) -- it's gone
     * from the admin nav, routes, and controllers already; this drops
     * the table it was the only thing using.
     */
    public function up(): void
    {
        Schema::dropIfExists('resources');
    }

    public function down(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('external_link')->nullable();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }
};
