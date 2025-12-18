// =======================================================
// js/words_quiz.js: Логика квиза для базовых слов
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // === DOM ЭЛЕМЕНТЫ ===
    const setupArea = document.getElementById('setup-area');
    const quizArea = document.getElementById('quiz-area');
    const resultsArea = document.getElementById('results-area');

    const questionCountInput = document.getElementById('question-count');
    const startQuizButton = document.getElementById('start-quiz-button');
    const nextButton = document.getElementById('next-button');
    const restartButton = document.getElementById('restart-button');

    const questionInfo = document.getElementById('question-info');
    const scoreInfo = document.getElementById('score-info');
    const questionImage = document.getElementById('question-image');
    const optionsContainer = document.getElementById('options-container');
    const resultMessage = document.getElementById('result-message');
    const finalScoreDisplay = document.getElementById('final-score');
    
    // Обновление максимального количества вопросов
    if (questionCountInput) {
        questionCountInput.setAttribute('max', basicWords.length);
        questionCountInput.value = Math.min(10, basicWords.length); // Устанавливаем 10 по умолчанию или макс.
    }
    
    // === ПЕРЕМЕННЫЕ СОСТОЯНИЯ ===
    let totalQuestions = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let quizData = []; // Выбранные вопросы для текущего квиза

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    // Функция для перемешивания массива (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // === ОСНОВНЫЕ ФУНКЦИИ КВИЗА ===

    function initializeQuiz() {
        // 1. Сбор данных
        const count = parseInt(questionCountInput.value);
        const maxWords = basicWords.length;

        if (isNaN(count) || count < 5 || count > maxWords) {
            alert(`Please, enter the number between 5 and ${maxWords}.`);
            return;
        }

        totalQuestions = count;
        currentQuestionIndex = 0;
        score = 0;

        // 2. Выбор уникальных вопросов
        shuffleArray(basicWords);
        quizData = basicWords.slice(0, totalQuestions);
        
        // 3. Смена UI
        setupArea.style.display = 'none';
        resultsArea.style.display = 'none';
        quizArea.style.display = 'block';

        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            finishQuiz();
            return;
        }

        const currentItem = quizData[currentQuestionIndex];
        // Важно: Ответ здесь - это свойство .word
        const correctAnswer = currentItem.word; 

        // Обновление UI
        questionInfo.textContent = `Question ${currentQuestionIndex + 1} out of ${totalQuestions}`;
        scoreInfo.textContent = `Score: ${score}`;
        // Изображение знака
        questionImage.src = currentItem.image; 
        optionsContainer.innerHTML = '';
        resultMessage.textContent = '';
        nextButton.style.display = 'none';

        // 4. Генерация вариантов ответа
        const allWords = basicWords.map(item => item.word);
        const options = [correctAnswer];
        
        // Добавляем 3 уникальных неправильных ответа
        while (options.length < 4) {
            shuffleArray(allWords);
            const decoy = allWords.find(word => !options.includes(word));
            if (decoy) options.push(decoy);
        }
        
        shuffleArray(options);

        // 5. Рендеринг кнопок
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-lg mb-2';
            button.textContent = option;
            button.dataset.answer = option;
            button.onclick = handleAnswer;
            optionsContainer.appendChild(button);
        });
    }

    function handleAnswer(event) {
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.answer;
        const correctAnswer = quizData[currentQuestionIndex].word; // Используем .word
        
        // Отключаем все кнопки после выбора
        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            // Подсвечиваем правильный/неправильный ответ
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-primary');
            } else if (btn === selectedButton) {
                btn.classList.add('btn-danger');
                btn.classList.remove('btn-outline-primary');
            }
        });

        if (selectedAnswer === correctAnswer) {
            score++;
            resultMessage.textContent = 'Correct!';
            resultMessage.classList.remove('text-danger');
            resultMessage.classList.add('text-success');
        } else {
            resultMessage.textContent = `Not correct! The correct answer is: ${correctAnswer}`;
            resultMessage.classList.remove('text-success');
            resultMessage.classList.add('text-danger');
        }

        // Обновляем счет и показываем кнопку "Далее"
        scoreInfo.textContent = `Score: ${score}`;
        nextButton.style.display = 'block';
    }

    function finishQuiz() {
        quizArea.style.display = 'none';
        resultsArea.style.display = 'block';

        const percentage = Math.round((score / totalQuestions) * 100);
        
        finalScoreDisplay.innerHTML = `${score} out of ${totalQuestions} (${percentage}%)`;

        if (percentage >= 80) {
             finalScoreDisplay.classList.add('text-success');
             finalScoreDisplay.classList.remove('text-primary', 'text-warning');
        } else if (percentage >= 50) {
             finalScoreDisplay.classList.add('text-warning');
             finalScoreDisplay.classList.remove('text-primary', 'text-success');
        } else {
             finalScoreDisplay.classList.add('text-danger');
             finalScoreDisplay.classList.remove('text-primary', 'text-success');
        }
        saveScore(score, totalQuestions);
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    startQuizButton.addEventListener('click', initializeQuiz);

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });

    restartButton.addEventListener('click', () => {
        setupArea.style.display = 'block';
        resultsArea.style.display = 'none';
        questionCountInput.value = Math.min(10, basicWords.length);
    });
    // ... (в конце файла words_quiz.js, перед });) ...

    function saveScore(score, totalQuestions) {
        // 1. Получаем токен из локального хранилища
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username'); // Для отображения сообщения

        if (!token) {
            alert('Score was not saved: Please log in to save your results.');
            // Перенаправить на вход:
            // window.location.href = 'login.html';
            return;
        }
        
        const scoreData = {
            quiz_type: 'words', 
            score: score 
        };

        // 2. Отправляем запрос с заголовком Authorization
        fetch('http://localhost:3000/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // *** Ключевой момент: Отправляем токен в заголовке ***
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(scoreData),
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                // Токен недействителен или отсутствует
                alert('Session expired. Please log in again.');
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Score saved successfully:', data);
            alert(`Score saved successfully for ${username}!`);
        })
        .catch(error => {
            console.error('Error saving score:', error);
            alert(`Failed to save score: ${error.message}`);
        });
    }

// ... (продолжение кода words_quiz.js) ...
});