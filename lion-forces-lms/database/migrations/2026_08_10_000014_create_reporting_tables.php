<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Heavy analytics (pass rates, revenue trends, difficulty analysis)
     * computed on a schedule and cached here, per the SRS's explicit
     * "scheduled report aggregation for performance at scale" requirement
     * (§9). The Reports module reads these snapshots instead of running
     * live aggregate queries over the full attempts/payments history on
     * every page load.
     */
    public function up(): void
    {
        Schema::create('report_snapshots', function (Blueprint $table) {
            $table->id();
            $table->enum('report_type', ['student', 'course', 'test', 'payment']);
            $table->date('period_start');
            $table->date('period_end');
            $table->json('data'); // the aggregated figures for this period
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->unique(['report_type', 'period_start', 'period_end'], 'report_snapshot_period_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_snapshots');
    }
};
