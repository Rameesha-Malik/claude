<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Client: "add basic record of student not compulsory optional" --
     * Test Center / FSc marks % / Matric marks % / graduation GPA, on top
     * of the biodata fields already added earlier this session (father
     * name/CNIC/education/address -- mobile/photo/target course already
     * existed as phone/avatar_path/target_exam_name). All nullable, same
     * as the rest of this biodata set.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('test_center')->nullable()->after('address');
            $table->unsignedTinyInteger('matric_marks_percentage')->nullable()->after('test_center');
            $table->unsignedTinyInteger('fsc_marks_percentage')->nullable()->after('matric_marks_percentage');
            $table->decimal('graduation_gpa', 3, 2)->nullable()->after('fsc_marks_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['test_center', 'matric_marks_percentage', 'fsc_marks_percentage', 'graduation_gpa']);
        });
    }
};
