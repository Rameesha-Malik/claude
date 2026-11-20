<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Database\Seeder;

/**
 * Standalone, not part of the main db:seed chain -- run on its own via
 * `php artisan db:seed --class=QuestionBankDemoSeeder` (same pattern as
 * FreshStudentDemoSeeder). Requires CatalogSeeder to have already run
 * (needs its subjects and the "LCC Complete Preparation" course to
 * exist). 100 test questions across the 6 existing subjects, attached to
 * that one course so both Custom Quiz (subject/topic/difficulty filters)
 * and course-scoped tools (Practice Tests/Quizzes auto-question-count
 * selection, the course's own Question Bank tab) have real volume to
 * test against. Idempotent (updateOrCreate keyed by question_text), so
 * running it again just reconciles rather than duplicating.
 */
class QuestionBankDemoSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::where('slug', 'lcc-complete-prep')->first();
        if (! $course) {
            throw new \RuntimeException('Run CatalogSeeder first -- the "LCC Complete Preparation" course it creates is required.');
        }

        $subjectNames = ['English', 'Current Affairs', 'Intelligence / IQ', 'Mathematics', 'Pakistan Studies', 'General Science'];
        $subjects = Subject::whereIn('name', $subjectNames)->get()->keyBy('name');

        foreach ($subjectNames as $name) {
            if (! $subjects->has($name)) {
                throw new \RuntimeException("Run CatalogSeeder first -- subject \"{$name}\" is missing.");
            }
        }

        $topics = collect([
            'English' => ['Vocabulary', 'Grammar'],
            'Current Affairs' => ['International Affairs', 'National Affairs'],
            'Intelligence / IQ' => ['Numerical Reasoning', 'Verbal Reasoning'],
            'Mathematics' => ['Arithmetic', 'Algebra'],
            'Pakistan Studies' => ['History', 'Geography'],
            'General Science' => ['Physics & Chemistry', 'Biology'],
        ])->map(fn ($names, $subjectName) => collect($names)->map(
            fn ($topicName) => Topic::updateOrCreate(['subject_id' => $subjects[$subjectName]->id, 'name' => $topicName])
        ));

        $bank = [
            'English' => [
                ['t' => 'Synonym of "Happy"?', 'o' => ['Joyful', 'Angry', 'Tired', 'Afraid'], 'c' => 0, 'd' => 'easy', 'e' => '"Joyful" means the same as "happy".'],
                ['t' => 'Antonym of "Brave"?', 'o' => ['Strong', 'Cowardly', 'Loud', 'Fast'], 'c' => 1, 'd' => 'easy', 'e' => '"Cowardly" is the opposite of "brave".'],
                ['t' => 'Synonym of "Intelligent"?', 'o' => ['Smart', 'Slow', 'Weak', 'Shy'], 'c' => 0, 'd' => 'easy', 'e' => '"Smart" means the same as "intelligent".'],
                ['t' => 'Antonym of "Ancient"?', 'o' => ['Old', 'Modern', 'Rare', 'Broken'], 'c' => 1, 'd' => 'easy', 'e' => '"Modern" is the opposite of "ancient".'],
                ['t' => 'Choose the correctly spelled word.', 'o' => ['Neccessary', 'Necessery', 'Necessary', 'Neccesary'], 'c' => 2, 'd' => 'medium', 'e' => '"Necessary" is the correct spelling.'],
                ['t' => 'Synonym of "Begin"?', 'o' => ['Commence', 'Finish', 'Pause', 'Delay'], 'c' => 0, 'd' => 'easy', 'e' => '"Commence" means to begin.'],
                ['t' => 'Antonym of "Victory"?', 'o' => ['Triumph', 'Defeat', 'Success', 'Glory'], 'c' => 1, 'd' => 'easy', 'e' => '"Defeat" is the opposite of "victory".'],
                ['t' => 'What is the plural of "Child"?', 'o' => ['Childs', 'Childes', 'Children', 'Childer'], 'c' => 2, 'd' => 'easy', 'e' => '"Children" is the irregular plural of "child".'],
                ['t' => 'What is the past tense of "Go"?', 'o' => ['Goed', 'Gone', 'Went', 'Going'], 'c' => 2, 'd' => 'easy', 'e' => '"Went" is the simple past tense of "go".'],
                ['t' => 'Synonym of "Huge"?', 'o' => ['Enormous', 'Tiny', 'Narrow', 'Thin'], 'c' => 0, 'd' => 'easy', 'e' => '"Enormous" means very large, same as "huge".'],
                ['t' => 'Antonym of "Generous"?', 'o' => ['Kind', 'Stingy', 'Rich', 'Helpful'], 'c' => 1, 'd' => 'medium', 'e' => '"Stingy" is the opposite of "generous".'],
                ['t' => 'Which sentence is grammatically correct?', 'o' => ['She has been living here since 2010.', 'She is living here since 2010.', 'She lives here since 2010.', 'She living here since 2010.'], 'c' => 0, 'd' => 'hard', 'e' => 'Present perfect continuous ("has been living") is correct with "since" for an action continuing from the past to now.'],
                ['t' => 'Synonym of "Rapid"?', 'o' => ['Fast', 'Slow', 'Quiet', 'Heavy'], 'c' => 0, 'd' => 'easy', 'e' => '"Fast" means the same as "rapid".'],
                ['t' => 'Antonym of "Scarce"?', 'o' => ['Rare', 'Abundant', 'Limited', 'Few'], 'c' => 1, 'd' => 'medium', 'e' => '"Abundant" is the opposite of "scarce".'],
                ['t' => 'Antonym of "Import"?', 'o' => ['Export', 'Trade', 'Supply', 'Deliver'], 'c' => 0, 'd' => 'easy', 'e' => '"Export" is the opposite of "import".'],
                ['t' => 'Synonym of "Courage"?', 'o' => ['Bravery', 'Fear', 'Doubt', 'Weakness'], 'c' => 0, 'd' => 'easy', 'e' => '"Bravery" means the same as "courage".'],
                ['t' => 'A one-word substitution for "a person who loves books" is?', 'o' => ['Bibliophile', 'Philanthropist', 'Linguist', 'Author'], 'c' => 0, 'd' => 'hard', 'e' => 'A "bibliophile" is someone who loves or collects books.'],
            ],
            'Current Affairs' => [
                ['t' => 'Pakistan became independent in which year?', 'o' => ['1945', '1946', '1947', '1948'], 'c' => 2, 'd' => 'easy', 'e' => 'Pakistan gained independence on 14 August 1947.'],
                ['t' => 'What is the currency of Pakistan?', 'o' => ['Rupee', 'Dinar', 'Riyal', 'Dirham'], 'c' => 0, 'd' => 'easy', 'e' => 'The Pakistani Rupee (PKR) is the official currency.'],
                ['t' => 'What is Pakistan\'s national language?', 'o' => ['Punjabi', 'Urdu', 'Sindhi', 'Pashto'], 'c' => 1, 'd' => 'easy', 'e' => 'Urdu is the national language of Pakistan.'],
                ['t' => 'What is the capital of Pakistan?', 'o' => ['Karachi', 'Lahore', 'Islamabad', 'Peshawar'], 'c' => 2, 'd' => 'easy', 'e' => 'Islamabad has been the capital since 1963.'],
                ['t' => 'SAARC stands for?', 'o' => ['South Asian Association for Regional Cooperation', 'South Asian Alliance for Regional Commerce', 'South Asian Agreement on Regional Cooperation', 'South Asian Association for Regional Commerce'], 'c' => 0, 'd' => 'medium', 'e' => 'SAARC = South Asian Association for Regional Cooperation.'],
                ['t' => 'The headquarters of the United Nations is located in?', 'o' => ['Geneva', 'New York', 'Paris', 'London'], 'c' => 1, 'd' => 'easy', 'e' => 'UN headquarters is in New York City.'],
                ['t' => 'Which organization includes Pakistan, India, and Bangladesh as members?', 'o' => ['NATO', 'SAARC', 'ASEAN', 'OPEC'], 'c' => 1, 'd' => 'medium', 'e' => 'SAARC includes Pakistan, India, Bangladesh, and other South Asian nations.'],
                ['t' => 'What is the currency of the United States?', 'o' => ['Pound', 'Euro', 'Dollar', 'Franc'], 'c' => 2, 'd' => 'easy', 'e' => 'The US Dollar is the currency of the United States.'],
                ['t' => 'NATO stands for?', 'o' => ['North Atlantic Treaty Organization', 'National Alliance Treaty Organization', 'North American Trade Organization', 'North Atlantic Trade Organization'], 'c' => 0, 'd' => 'medium', 'e' => 'NATO = North Atlantic Treaty Organization.'],
                ['t' => 'The headquarters of the World Health Organization (WHO) is in?', 'o' => ['Geneva', 'Vienna', 'Rome', 'Brussels'], 'c' => 0, 'd' => 'medium', 'e' => 'WHO headquarters is in Geneva, Switzerland.'],
                ['t' => 'CPEC stands for?', 'o' => ['China-Pakistan Economic Corridor', 'China-Pakistan Export Council', 'China-Pakistan Energy Cooperation', 'China-Pakistan Exchange Corridor'], 'c' => 0, 'd' => 'medium', 'e' => 'CPEC = China-Pakistan Economic Corridor.'],
                ['t' => 'What is Pakistan\'s national flower?', 'o' => ['Rose', 'Jasmine', 'Tulip', 'Lily'], 'c' => 1, 'd' => 'medium', 'e' => 'Jasmine is Pakistan\'s national flower.'],
                ['t' => 'What is Pakistan\'s national sport?', 'o' => ['Cricket', 'Football', 'Hockey', 'Squash'], 'c' => 2, 'd' => 'medium', 'e' => 'Hockey is the national sport of Pakistan.'],
                ['t' => 'What is Pakistan\'s national animal?', 'o' => ['Markhor', 'Lion', 'Leopard', 'Deer'], 'c' => 0, 'd' => 'medium', 'e' => 'The Markhor is Pakistan\'s national animal.'],
                ['t' => 'What is the largest continent by area?', 'o' => ['Africa', 'Asia', 'Europe', 'North America'], 'c' => 1, 'd' => 'easy', 'e' => 'Asia is the largest continent by land area.'],
                ['t' => 'What is the longest river in the world?', 'o' => ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], 'c' => 1, 'd' => 'easy', 'e' => 'The Nile is generally considered the longest river in the world.'],
                ['t' => 'Which organization is primarily responsible for maintaining international peace and security?', 'o' => ['WHO', 'United Nations', 'IMF', 'World Bank'], 'c' => 1, 'd' => 'easy', 'e' => 'The United Nations was founded to maintain international peace and security.'],
            ],
            'Intelligence / IQ' => [
                ['t' => 'Find the next number: 2, 4, 6, 8, ?', 'o' => ['9', '10', '11', '12'], 'c' => 1, 'd' => 'easy', 'e' => 'The pattern adds 2 each time: ...8, 10.'],
                ['t' => 'Find the next number: 3, 6, 12, 24, ?', 'o' => ['36', '42', '48', '30'], 'c' => 2, 'd' => 'medium', 'e' => 'Each number doubles: 24 × 2 = 48.'],
                ['t' => 'Find the odd one out: Apple, Banana, Carrot, Mango', 'o' => ['Apple', 'Banana', 'Carrot', 'Mango'], 'c' => 2, 'd' => 'easy', 'e' => 'Carrot is a vegetable; the others are fruits.'],
                ['t' => 'Find the odd one out: Dog, Cat, Lion, Table', 'o' => ['Dog', 'Cat', 'Lion', 'Table'], 'c' => 3, 'd' => 'easy', 'e' => 'Table is not an animal.'],
                ['t' => 'Complete the series: A, C, E, G, ?', 'o' => ['H', 'I', 'J', 'F'], 'c' => 1, 'd' => 'medium', 'e' => 'The pattern skips one letter each time: A, C, E, G, I.'],
                ['t' => 'Complete the series: Z, X, V, T, ?', 'o' => ['S', 'R', 'Q', 'U'], 'c' => 1, 'd' => 'medium', 'e' => 'The pattern skips one letter going backward: Z, X, V, T, R.'],
                ['t' => 'A is taller than B. B is taller than C. Who is the shortest?', 'o' => ['A', 'B', 'C', 'Cannot be determined'], 'c' => 2, 'd' => 'easy', 'e' => 'Since A > B > C in height, C is the shortest.'],
                ['t' => 'If 5 workers build a wall in 10 days, how many days will 10 workers take at the same rate?', 'o' => ['20 days', '10 days', '5 days', '2 days'], 'c' => 2, 'd' => 'medium', 'e' => 'Double the workers, half the time: 10 ÷ 2 = 5 days.'],
                ['t' => 'Find the missing number: 1, 4, 9, 16, ?', 'o' => ['20', '22', '24', '25'], 'c' => 3, 'd' => 'medium', 'e' => 'These are perfect squares: 1², 2², 3², 4², 5² = 25.'],
                ['t' => 'Find the next letter: B, D, F, H, ?', 'o' => ['I', 'J', 'K', 'L'], 'c' => 1, 'd' => 'easy', 'e' => 'The pattern skips one letter each time: B, D, F, H, J.'],
                ['t' => 'Pointing to a photo, a man says "She is the daughter of my mother\'s only son." How is she related to him?', 'o' => ['His sister', 'His daughter', 'His niece', 'His cousin'], 'c' => 1, 'd' => 'hard', 'e' => '"My mother\'s only son" is the man himself, so the girl is his daughter.'],
                ['t' => 'Which number does not belong: 2, 3, 5, 9, 11', 'o' => ['2', '3', '9', '11'], 'c' => 2, 'd' => 'medium', 'e' => 'All the others are prime numbers; 9 is not prime (3 × 3).'],
                ['t' => 'Complete the analogy: Hand is to Glove as Foot is to ?', 'o' => ['Shoe', 'Sock', 'Leg', 'Toe'], 'c' => 0, 'd' => 'easy', 'e' => 'A glove covers a hand, just as a shoe covers a foot.'],
                ['t' => 'Complete the analogy: Doctor is to Hospital as Teacher is to ?', 'o' => ['Book', 'School', 'Student', 'Class'], 'c' => 1, 'd' => 'easy', 'e' => 'A doctor works in a hospital, just as a teacher works in a school.'],
                ['t' => 'If North becomes East, East becomes South, what does South become?', 'o' => ['West', 'North', 'East', 'South'], 'c' => 0, 'd' => 'hard', 'e' => 'Each direction rotates 90° clockwise: North→East, East→South, South→West.'],
                ['t' => 'Find the next number: 1, 1, 2, 3, 5, 8, ?', 'o' => ['11', '12', '13', '14'], 'c' => 2, 'd' => 'medium', 'e' => 'This is the Fibonacci sequence: each number is the sum of the two before it (5 + 8 = 13).'],
                ['t' => 'Find the odd one out: Circle, Square, Triangle, Red', 'o' => ['Circle', 'Square', 'Triangle', 'Red'], 'c' => 3, 'd' => 'easy', 'e' => '"Red" is a color, not a shape.'],
            ],
            'Mathematics' => [
                ['t' => '15 + 27 = ?', 'o' => ['41', '42', '43', '52'], 'c' => 1, 'd' => 'easy', 'e' => '15 + 27 = 42.'],
                ['t' => '9 × 8 = ?', 'o' => ['64', '72', '81', '56'], 'c' => 1, 'd' => 'easy', 'e' => '9 × 8 = 72.'],
                ['t' => '144 ÷ 12 = ?', 'o' => ['10', '11', '12', '14'], 'c' => 2, 'd' => 'easy', 'e' => '144 ÷ 12 = 12.'],
                ['t' => '7² = ?', 'o' => ['14', '42', '49', '56'], 'c' => 2, 'd' => 'easy', 'e' => '7 × 7 = 49.'],
                ['t' => '√81 = ?', 'o' => ['7', '8', '9', '10'], 'c' => 2, 'd' => 'easy', 'e' => '9 × 9 = 81, so √81 = 9.'],
                ['t' => '25% of 200 = ?', 'o' => ['25', '40', '50', '60'], 'c' => 2, 'd' => 'medium', 'e' => '25% of 200 = 0.25 × 200 = 50.'],
                ['t' => '3/4 as a decimal is?', 'o' => ['0.25', '0.5', '0.75', '0.8'], 'c' => 2, 'd' => 'easy', 'e' => '3 ÷ 4 = 0.75.'],
                ['t' => 'If x + 5 = 12, what is x?', 'o' => ['5', '6', '7', '8'], 'c' => 2, 'd' => 'easy', 'e' => 'x = 12 - 5 = 7.'],
                ['t' => '100 - 37 = ?', 'o' => ['53', '63', '73', '67'], 'c' => 1, 'd' => 'easy', 'e' => '100 - 37 = 63.'],
                ['t' => '6 × 7 - 10 = ?', 'o' => ['22', '32', '42', '52'], 'c' => 1, 'd' => 'medium', 'e' => '6 × 7 = 42, then 42 - 10 = 32.'],
                ['t' => 'What is the LCM of 4 and 6?', 'o' => ['8', '10', '12', '24'], 'c' => 2, 'd' => 'medium', 'e' => 'The smallest number divisible by both 4 and 6 is 12.'],
                ['t' => 'What is the HCF of 18 and 24?', 'o' => ['2', '4', '6', '9'], 'c' => 2, 'd' => 'medium', 'e' => 'The largest number dividing both 18 and 24 evenly is 6.'],
                ['t' => '2³ = ?', 'o' => ['4', '6', '8', '9'], 'c' => 2, 'd' => 'easy', 'e' => '2 × 2 × 2 = 8.'],
                ['t' => '15% of 80 = ?', 'o' => ['8', '10', '12', '15'], 'c' => 2, 'd' => 'medium', 'e' => '15% of 80 = 0.15 × 80 = 12.'],
                ['t' => 'A train travels 60 km in 1 hour. How far does it travel in 3 hours at the same speed?', 'o' => ['120 km', '150 km', '180 km', '200 km'], 'c' => 2, 'd' => 'medium', 'e' => '60 km/h × 3 hours = 180 km.'],
                ['t' => 'What is the average of 4, 8, and 12?', 'o' => ['6', '7', '8', '9'], 'c' => 2, 'd' => 'easy', 'e' => '(4 + 8 + 12) ÷ 3 = 24 ÷ 3 = 8.'],
                ['t' => 'What is 5! (5 factorial)?', 'o' => ['60', '100', '120', '150'], 'c' => 2, 'd' => 'hard', 'e' => '5! = 5 × 4 × 3 × 2 × 1 = 120.'],
            ],
            'Pakistan Studies' => [
                ['t' => 'Pakistan\'s Independence Day is celebrated on?', 'o' => ['23 March', '14 August', '6 September', '9 November'], 'c' => 1, 'd' => 'easy', 'e' => 'Pakistan became independent on 14 August 1947.'],
                ['t' => 'Who is known as the founder of Pakistan?', 'o' => ['Allama Iqbal', 'Liaquat Ali Khan', 'Muhammad Ali Jinnah', 'Ayub Khan'], 'c' => 2, 'd' => 'easy', 'e' => 'Muhammad Ali Jinnah is known as the founder (Quaid-e-Azam) of Pakistan.'],
                ['t' => 'How many provinces does Pakistan have?', 'o' => ['3', '4', '5', '6'], 'c' => 1, 'd' => 'easy', 'e' => 'Pakistan has 4 provinces: Punjab, Sindh, Khyber Pakhtunkhwa, and Balochistan.'],
                ['t' => 'The Lahore Resolution was passed in which year?', 'o' => ['1935', '1940', '1945', '1947'], 'c' => 1, 'd' => 'medium', 'e' => 'The Lahore Resolution was passed on 23 March 1940.'],
                ['t' => 'Which is the longest river in Pakistan?', 'o' => ['Jhelum River', 'Chenab River', 'Indus River', 'Ravi River'], 'c' => 2, 'd' => 'easy', 'e' => 'The Indus River is the longest river in Pakistan.'],
                ['t' => 'What is the national language of Pakistan?', 'o' => ['English', 'Urdu', 'Punjabi', 'Sindhi'], 'c' => 1, 'd' => 'easy', 'e' => 'Urdu is Pakistan\'s national language.'],
                ['t' => 'Who wrote Pakistan\'s national anthem?', 'o' => ['Allama Iqbal', 'Hafeez Jalandhari', 'Faiz Ahmed Faiz', 'Ahmed Faraz'], 'c' => 1, 'd' => 'medium', 'e' => 'Hafeez Jalandhari wrote Pakistan\'s national anthem.'],
                ['t' => 'Which mountain range is located in northern Pakistan?', 'o' => ['Himalayas only', 'Karakoram', 'Andes', 'Alps'], 'c' => 1, 'd' => 'medium', 'e' => 'The Karakoram range is located in northern Pakistan, home to K2.'],
                ['t' => 'K2, the second-highest peak in the world, is located in?', 'o' => ['Nepal', 'India', 'Pakistan', 'China'], 'c' => 2, 'd' => 'easy', 'e' => 'K2 is located in the Karakoram range in Pakistan.'],
                ['t' => 'Pakistan Resolution Day is observed on?', 'o' => ['14 August', '23 March', '6 September', '25 December'], 'c' => 1, 'd' => 'easy', 'e' => 'Pakistan Resolution Day (Lahore Resolution) is observed on 23 March.'],
                ['t' => 'Who was the first Governor-General of Pakistan?', 'o' => ['Liaquat Ali Khan', 'Ayub Khan', 'Muhammad Ali Jinnah', 'Ghulam Muhammad'], 'c' => 2, 'd' => 'easy', 'e' => 'Muhammad Ali Jinnah served as Pakistan\'s first Governor-General.'],
                ['t' => 'Which city is known as the "City of Gardens" in Pakistan?', 'o' => ['Karachi', 'Lahore', 'Multan', 'Peshawar'], 'c' => 1, 'd' => 'medium', 'e' => 'Lahore is known as the "City of Gardens".'],
                ['t' => 'The green color in Pakistan\'s flag represents?', 'o' => ['Peace', 'Muslim majority', 'Agriculture', 'The sea'], 'c' => 1, 'd' => 'medium', 'e' => 'The green field represents the Muslim majority of Pakistan.'],
                ['t' => 'The crescent and star on Pakistan\'s flag symbolize?', 'o' => ['War and peace', 'Progress and light', 'Unity and faith', 'Freedom and justice'], 'c' => 1, 'd' => 'medium', 'e' => 'The crescent and star symbolize progress and light.'],
                ['t' => 'Gwadar Port is located in which province?', 'o' => ['Sindh', 'Punjab', 'Balochistan', 'Khyber Pakhtunkhwa'], 'c' => 2, 'd' => 'medium', 'e' => 'Gwadar Port is located in Balochistan.'],
                ['t' => 'What is the national tree of Pakistan?', 'o' => ['Deodar', 'Oak', 'Pine', 'Mango'], 'c' => 0, 'd' => 'hard', 'e' => 'The Deodar is Pakistan\'s national tree.'],
            ],
            'General Science' => [
                ['t' => 'What is the chemical symbol for water?', 'o' => ['HO', 'H2O', 'O2H', 'H2O2'], 'c' => 1, 'd' => 'easy', 'e' => 'Water is made of two hydrogen atoms and one oxygen atom: H2O.'],
                ['t' => 'What is the chemical symbol for gold?', 'o' => ['Gd', 'Go', 'Au', 'Ag'], 'c' => 2, 'd' => 'medium', 'e' => 'Gold\'s chemical symbol is Au, from the Latin "aurum".'],
                ['t' => 'What is known as the "powerhouse of the cell"?', 'o' => ['Nucleus', 'Ribosome', 'Mitochondria', 'Cytoplasm'], 'c' => 2, 'd' => 'easy', 'e' => 'Mitochondria produce energy (ATP) for the cell.'],
                ['t' => 'The speed of light is approximately?', 'o' => ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1,000,000 km/s'], 'c' => 1, 'd' => 'medium', 'e' => 'Light travels at approximately 300,000 km per second.'],
                ['t' => 'Which gas is most abundant in Earth\'s atmosphere?', 'o' => ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], 'c' => 2, 'd' => 'medium', 'e' => 'Nitrogen makes up about 78% of Earth\'s atmosphere.'],
                ['t' => 'Humans have how many pairs of chromosomes?', 'o' => ['21', '22', '23', '24'], 'c' => 2, 'd' => 'medium', 'e' => 'Humans have 23 pairs of chromosomes (46 total).'],
                ['t' => 'What is the boiling point of water at sea level?', 'o' => ['90°C', '95°C', '100°C', '110°C'], 'c' => 2, 'd' => 'easy', 'e' => 'Water boils at 100°C (212°F) at sea level.'],
                ['t' => 'What force pulls objects toward the Earth?', 'o' => ['Magnetism', 'Gravity', 'Friction', 'Tension'], 'c' => 1, 'd' => 'easy', 'e' => 'Gravity is the force that pulls objects toward Earth.'],
                ['t' => 'Photosynthesis occurs mainly in which part of a plant?', 'o' => ['Roots', 'Stem', 'Leaves', 'Flowers'], 'c' => 2, 'd' => 'easy', 'e' => 'Photosynthesis mainly occurs in the leaves, using chlorophyll.'],
                ['t' => 'What is the chemical symbol for sodium?', 'o' => ['So', 'Sd', 'Na', 'S'], 'c' => 2, 'd' => 'medium', 'e' => 'Sodium\'s chemical symbol is Na, from the Latin "natrium".'],
                ['t' => 'What is the largest organ in the human body?', 'o' => ['Liver', 'Heart', 'Skin', 'Lungs'], 'c' => 2, 'd' => 'medium', 'e' => 'The skin is the largest organ in the human body.'],
                ['t' => 'Which planet is closest to the sun?', 'o' => ['Venus', 'Earth', 'Mars', 'Mercury'], 'c' => 3, 'd' => 'easy', 'e' => 'Mercury is the planet closest to the sun.'],
                ['t' => 'What is the unit of electric current?', 'o' => ['Volt', 'Watt', 'Ampere', 'Ohm'], 'c' => 2, 'd' => 'medium', 'e' => 'Electric current is measured in Amperes (Amps).'],
                ['t' => 'DNA stands for?', 'o' => ['Deoxyribonucleic Acid', 'Dioxyribonucleic Acid', 'Deoxyribose Nucleic Agent', 'Diribonucleic Acid'], 'c' => 0, 'd' => 'medium', 'e' => 'DNA stands for Deoxyribonucleic Acid.'],
                ['t' => 'Which gas do plants absorb from the air for photosynthesis?', 'o' => ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], 'c' => 2, 'd' => 'easy', 'e' => 'Plants absorb carbon dioxide (CO2) for photosynthesis.'],
                ['t' => 'Sound travels fastest through?', 'o' => ['Air', 'Water', 'Solids', 'Vacuum'], 'c' => 2, 'd' => 'hard', 'e' => 'Sound travels fastest through solids because particles are closest together.'],
            ],
        ];

        $topicIndex = 0;
        foreach ($bank as $subjectName => $questions) {
            $subjectTopics = $topics[$subjectName];

            foreach ($questions as $q) {
                $question = QuestionBank::updateOrCreate(['question_text' => $q['t']], [
                    'subject_id' => $subjects[$subjectName]->id,
                    'topic_id' => $subjectTopics[$topicIndex % $subjectTopics->count()]->id,
                    'course_id' => $course->id,
                    'explanation' => $q['e'],
                    'difficulty' => $q['d'],
                ]);
                $question->options()->delete();
                $question->options()->createMany(
                    collect($q['o'])->values()->map(fn ($text, $i) => [
                        'option_text' => $text,
                        'is_correct' => $i === $q['c'],
                        'order' => $i + 1,
                    ])->all()
                );
                $topicIndex++;
            }
        }

        $this->command?->info('Seeded '.collect($bank)->flatten(1)->count().' test questions across '.count($bank).' subjects.');
    }
}
