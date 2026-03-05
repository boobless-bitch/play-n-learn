// /see_setup.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM References ---
    const form = document.getElementById('quiz-setup-form');
    const numQuestionsInput = document.getElementById('num-questions');
    const timeLimitInput = document.getElementById('time-limit');
    const subjectCheckboxes = document.querySelectorAll('input[name="subject"]');
    const startButton = document.getElementById('start-quiz-button');
    const backButton = document.getElementById('back-button');

    const numQuestionsError = document.getElementById('num-questions-error');
    const timeLimitError = document.getElementById('time-limit-error');
    const subjectsError = document.getElementById('subjects-error');
    const subjectSelectionDiv = document.querySelector('.subject-selection');

    // Status message area (for validation feedback)
    const accessStatusMessageDiv = document.getElementById('access-status-message');

    // --- Constants ---
    const QUIZ_TYPE = 'see';
    const TARGET_MCQ_FILE = 'see_mcq.html';
    const CONFIG_STORAGE_KEY = 'seeQuizConfig';

    // --- Navigation ---
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    } else {
        console.warn("Back button element not found.");
    }

    // --- Form Submission Logic (Simplified - No Access Check) ---
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            clearAccessStatusMessage(); // Clear previous messages

            if (validateForm()) {
                // Collect config data
                const numQuestions = parseInt(numQuestionsInput.value, 10);
                const timeLimit = parseInt(timeLimitInput.value, 10);
                const selectedSubjects = Array.from(subjectCheckboxes)
                                            .filter(checkbox => checkbox.checked)
                                            .map(checkbox => checkbox.value);

                const quizConfig = {
                    numQuestions: numQuestions,
                    timeLimit: timeLimit,
                    selectedSubjects: selectedSubjects,
                    quizType: QUIZ_TYPE
                };

                // Save config to localStorage
                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(quizConfig));
                console.log('Quiz config saved to localStorage:', quizConfig);

                // Immediate redirect to MCQ page
                setAccessStatusMessage("Starting quiz...", false, 'success');
                
                // Small delay for UX feedback, then redirect
                setTimeout(() => {
                    window.location.href = TARGET_MCQ_FILE;
                }, 300);
            }
        });
    } else {
        console.error("Quiz setup form not found!");
        if (accessStatusMessageDiv) {
             setAccessStatusMessage("Error: Setup form is missing.", true);
        }
    }

    // --- Validation Functions ---
    function validateForm() {
        let isValid = true;
        clearErrors();

        const numQuestions = parseInt(numQuestionsInput.value, 10);
        if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 100) {
            showError(numQuestionsError, 'Please enter a number between 1 and 100.', numQuestionsInput);
            isValid = false;
        }

        const timeLimit = parseInt(timeLimitInput.value, 10);
        if (isNaN(timeLimit) || timeLimit < 1 || timeLimit > 180) {
            showError(timeLimitError, 'Please enter a time between 1 and 180 minutes.', timeLimitInput);
            isValid = false;
        }

        const selectedCount = Array.from(subjectCheckboxes).filter(checkbox => checkbox.checked).length;
        if (selectedCount === 0) {
            if (subjectSelectionDiv) {
                showError(subjectsError, 'Please select at least one subject.', subjectSelectionDiv);
            } else {
                 console.warn("Subject selection container not found for error display.");
            }
            isValid = false;
        }

        return isValid;
    }

    function showError(errorElement, message, inputElement = null) {
        if (!errorElement) return;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        if (inputElement) {
            inputElement.classList.add('input-error');
        } else if (errorElement === subjectsError && subjectSelectionDiv) {
             subjectSelectionDiv.classList.add('input-error');
        }
    }

    function clearErrors() {
        if (numQuestionsError) { numQuestionsError.textContent = ''; numQuestionsError.style.display = 'none'; }
        if (timeLimitError) { timeLimitError.textContent = ''; timeLimitError.style.display = 'none'; }
        if (subjectsError) { subjectsError.textContent = ''; subjectsError.style.display = 'none'; }
        if (numQuestionsInput) numQuestionsInput.classList.remove('input-error');
        if (timeLimitInput) timeLimitInput.classList.remove('input-error');
        if (subjectSelectionDiv) subjectSelectionDiv.classList.remove('input-error');
    }

    // --- Input Change Listeners for Real-time Error Clearing ---
    if (numQuestionsInput) numQuestionsInput.addEventListener('input', () => clearSingleError(numQuestionsInput, numQuestionsError));
    if (timeLimitInput) timeLimitInput.addEventListener('input', () => clearSingleError(timeLimitInput, timeLimitError));
    
    subjectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
             if (subjectSelectionDiv && subjectSelectionDiv.classList.contains('input-error')) {
                 const anyChecked = Array.from(subjectCheckboxes).some(cb => cb.checked);
                 if (anyChecked && subjectsError) {
                    subjectsError.textContent = '';
                    subjectsError.style.display = 'none';
                    subjectSelectionDiv.classList.remove('input-error');
                 }
             }
        });
    });

    function clearSingleError(inputEl, errorEl) {
         if (inputEl && errorEl && inputEl.classList.contains('input-error')) {
             errorEl.textContent = '';
             errorEl.style.display = 'none';
             inputEl.classList.remove('input-error');
        }
    }

    // --- Helper Functions for Status Messages ---
    function setAccessStatusMessage(message, isError = false, type = null) {
        if (!accessStatusMessageDiv) return;
        accessStatusMessageDiv.textContent = message;
        accessStatusMessageDiv.className = 'status-message'; // Reset classes
        if (isError) {
            accessStatusMessageDiv.classList.add('error');
        } else if (type === 'success') {
             accessStatusMessageDiv.classList.add('success');
        } else if (type === 'loading') {
            accessStatusMessageDiv.classList.add('loading');
        }
        accessStatusMessageDiv.style.display = 'block';
    }

    function clearAccessStatusMessage() {
         if (!accessStatusMessageDiv) return;
         accessStatusMessageDiv.textContent = '';
         accessStatusMessageDiv.className = 'status-message';
         accessStatusMessageDiv.style.display = 'none';
    }

    // --- Initial State ---
    clearErrors();
    clearAccessStatusMessage();
    if (startButton) {
        startButton.disabled = false;
        startButton.textContent = 'Start Quiz';
    }
});
