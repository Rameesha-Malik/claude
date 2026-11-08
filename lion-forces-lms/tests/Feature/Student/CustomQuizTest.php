<?php

use App\Models\CustomQuizConfig;
use App\Models\QuestionBank;
use App\Models\QuestionOption;
use App\Models\TestAttempt;
use App\Models\User;

// The core "student clicks through a quiz" flow: build a quiz from the
// question bank, take it, submit answers, and land on a real scored
// result -- driven through CustomQuizController end to end, not a
// hand-built TestAttempt standing in for it.

function createQuestionWithOptions(): QuestionBank
{
    $question = QuestionBank::create([
        'question_text' => 'Sample question '.uniqid(),
        'difficulty' => 'medium',
    ]);

    QuestionOption::create(['question_id' => $question->id, 'option_text' => 'Correct answer', 'is_correct' => true, 'order' => 1]);
    QuestionOption::create(['question_id' => $question->id, 'option_text' => 'Wrong answer', 'is_correct' => false, 'order' => 2]);

    return $question;
}

test('student can build, take, and submit a custom quiz end to end', function () {
    $student = User::factory()->create();
    $questions = collect(range(1, 3))->map(fn () => createQuestionWithOptions());

    // No subject/topic filter picked -- matches the whole bank (3 questions).
    $storeResponse = $this->actingAs($student)->post(route('student.custom-quiz.store'), [
        'question_count' => 5,
        'mode' => 'tutor',
    ]);

    $config = CustomQuizConfig::where('user_id', $student->id)->firstOrFail();
    $storeResponse->assertRedirect(route('student.custom-quiz.show', $config));

    // Only 3 questions exist, so the config is capped to what's actually there.
    expect($config->question_count)->toBe(3);

    $this->actingAs($student)->get(route('student.custom-quiz.show', $config))->assertOk();

    // Answer every question with its correct option.
    $answers = $questions->map(fn ($q) => [
        'question_id' => $q->id,
        'selected_option_id' => $q->options()->where('is_correct', true)->first()->id,
    ])->values()->all();

    $submitResponse = $this->actingAs($student)->post(route('student.custom-quiz.submit', $config), ['answers' => $answers]);

    $attempt = TestAttempt::where('user_id', $student->id)->where('attemptable_id', $config->id)->firstOrFail();
    $submitResponse->assertRedirect(route('student.attempts.show', $attempt));

    expect((float) $attempt->score)->toBe(3.0);
    expect((float) $attempt->total_marks)->toBe(3.0);
    expect((float) $attempt->percentage)->toBe(100.0);
    expect($attempt->passed)->toBeTrue();

    $this->actingAs($student)->get(route('student.attempts.show', $attempt))->assertOk();
});

test('a wrong answer is scored correctly', function () {
    $student = User::factory()->create();
    $questions = collect(range(1, 2))->map(fn () => createQuestionWithOptions());

    $this->actingAs($student)->post(route('student.custom-quiz.store'), [
        'question_count' => 2,
        'mode' => 'tutor',
    ]);
    $config = CustomQuizConfig::where('user_id', $student->id)->firstOrFail();

    // First question right, second wrong.
    $answers = [
        ['question_id' => $questions[0]->id, 'selected_option_id' => $questions[0]->options()->where('is_correct', true)->first()->id],
        ['question_id' => $questions[1]->id, 'selected_option_id' => $questions[1]->options()->where('is_correct', false)->first()->id],
    ];

    $this->actingAs($student)->post(route('student.custom-quiz.submit', $config), ['answers' => $answers]);

    $attempt = TestAttempt::where('user_id', $student->id)->where('attemptable_id', $config->id)->firstOrFail();

    expect((float) $attempt->score)->toBe(1.0);
    expect((float) $attempt->percentage)->toBe(50.0);
    expect($attempt->passed)->toBeTrue(); // submit() passes at >= 50%
});

test('a skipped question counts as neither correct nor wrong', function () {
    $student = User::factory()->create();
    $question = createQuestionWithOptions();

    $this->actingAs($student)->post(route('student.custom-quiz.store'), [
        'question_count' => 1,
        'mode' => 'tutor',
    ]);
    $config = CustomQuizConfig::where('user_id', $student->id)->firstOrFail();

    $this->actingAs($student)->post(route('student.custom-quiz.submit', $config), [
        'answers' => [['question_id' => $question->id, 'selected_option_id' => null]],
    ]);

    $attempt = TestAttempt::where('user_id', $student->id)->where('attemptable_id', $config->id)->firstOrFail();
    $answer = $attempt->answers()->first();

    expect($answer->is_correct)->toBeNull();
    expect((float) $attempt->score)->toBe(0.0);
});

test('a student with no course access is capped to the free-trial question limit', function () {
    $student = User::factory()->create();
    collect(range(1, 15))->each(fn () => createQuestionWithOptions());

    $this->actingAs($student)->post(route('student.custom-quiz.store'), [
        'question_count' => 50,
        'mode' => 'tutor',
    ]);

    $config = CustomQuizConfig::where('user_id', $student->id)->firstOrFail();

    expect($config->question_count)->toBe(10); // CustomQuizController::FREE_TRIAL_MAX_QUESTIONS
});

test('a student cannot submit to a custom quiz that belongs to someone else', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    createQuestionWithOptions();

    $this->actingAs($owner)->post(route('student.custom-quiz.store'), [
        'question_count' => 1,
        'mode' => 'tutor',
    ]);
    $config = CustomQuizConfig::where('user_id', $owner->id)->firstOrFail();

    $this->actingAs($intruder)->get(route('student.custom-quiz.show', $config))->assertForbidden();
});

test('a guest cannot build a custom quiz', function () {
    $this->post(route('student.custom-quiz.store'), ['question_count' => 5, 'mode' => 'tutor'])
        ->assertRedirect('/login');
});
