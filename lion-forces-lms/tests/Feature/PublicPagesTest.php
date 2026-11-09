<?php

// Guest-facing smoke test: every page a visitor (not logged in) can reach
// should load without error. Catches a broken view, a missing route
// binding, or a controller that crashes on an empty database -- the kind
// of thing that otherwise only surfaces when a real visitor hits it.

test('home page loads', function () {
    $this->get('/')->assertOk();
});

test('courses listing page loads', function () {
    $this->get('/courses')->assertOk();
});

test('login page loads', function () {
    $this->get('/login')->assertOk();
});

test('register page loads', function () {
    $this->get('/register')->assertOk();
});
