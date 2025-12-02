document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const setupArea = document.getElementById('setup-area');
    const questionCountInput = document.getElementById('question-count');
    const startButton = document.getElementById('start-quiz-button');
    const quizArea = document.getElementById('quiz-area');
    const resultsArea = document.getElementById('results-area');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    
    const imgElement = document.getElementById('question-image');
    const optionsContainer = document.getElementById('options-container');
    const resultMessage = document.getElementById('result-message');
    const nextButton = document.getElementById('next-button');
    const questionInfo = document.getElementById('question-info');
    const scoreInfo = document.getElementById('score-info');

    // Переменные состояния квиза
    let totalQuestions = 0;
    let currentQuestionIndex = 0; // Теперь это индекс в shuffledQuestions
    let score = 0;
    let shuffledQuestions = []; // Новый массив для уникальных вопросов

    // --- Управление состоянием ---

    // 1. Вспомогательная функция для случайного перемешивания
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeQuiz() {
        // Установка лимитов для количества вопросов (по умолчанию 10)
        const maxQuestions = aslAlphabet.length;
        questionCountInput.max = maxQuestions; 
        questionCountInput.placeholder = `Max ${maxQuestions}`;
        
        // Показываем только область настройки
        setupArea.style.display = 'block';
        quizArea.style.display = 'none';
        resultsArea.style.display = 'none';
    }

    function startQuiz() {
        // Устанавливаем минимальное количество вопросов
        const minQuestions = 5; 
        const maxQuestions = aslAlphabet.length;
        const count = parseInt(questionCountInput.value);

        // Проверка
        if (isNaN(count) || count < minQuestions || count > maxQuestions) {
            alert(`Please enter a number between ${minQuestions} and ${maxQuestions}.`);
            return;
        }

        totalQuestions = count;
        score = 0;
        currentQuestionIndex = 0;
        
        // ГЕНЕРАЦИЯ УНИКАЛЬНОГО НАБОРА ВОПРОСОВ
        // 1. Перемешиваем весь алфавит
        shuffledQuestions = shuffleArray([...aslAlphabet]); 
        // 2. Обрезаем до нужного количества вопросов
        shuffledQuestions = shuffledQuestions.slice(0, totalQuestions);

        // Переключаем интерфейс
        setupArea.style.display = 'none';
        quizArea.style.display = 'block';
        resultsArea.style.display = 'none';
        
        nextQuestion(); // Начинаем с первого вопроса
    }
    
    function finishQuiz() {
        quizArea.style.display = 'none';
        resultsArea.style.display = 'block';
        const percentage = Math.round((score / totalQuestions) * 100);
        finalScoreDisplay.textContent = `${score} out of ${totalQuestions} (${percentage}%)`;
    }

    // --- Логика вопросов ---

    function nextQuestion() {
        // Проверяем, достигнут ли лимит вопросов
        if (currentQuestionIndex >= totalQuestions) {
            finishQuiz();
            return;
        }

        // Текущий вопрос берется из уникального, перемешанного массива
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        currentQuestionIndex++;
        
        // Обновляем информацию о вопросе и счете
        questionInfo.textContent = `Question ${currentQuestionIndex} out of ${totalQuestions}`;
        scoreInfo.textContent = `Score: ${score}`;
        
        // Выбираем 3 случайных неправильных ответа
        let incorrectAnswers = aslAlphabet.filter(item => item.letter !== currentQuestion.letter);
        shuffleArray(incorrectAnswers);
        
        // Создаем массив из 4 вариантов (1 правильный + 3 неправильных)
        // Гарантируем, что используем только 4 варианта, даже если aslAlphabet < 4
        const options = [currentQuestion.letter, incorrectAnswers[0].letter, incorrectAnswers[1].letter, incorrectAnswers[2].letter].slice(0, 4);
        shuffleArray(options); // Перемешиваем варианты

        // Отображаем вопрос
        imgElement.src = currentQuestion.image;
        resultMessage.textContent = '';
        nextButton.style.display = 'none';
        optionsContainer.innerHTML = ''; 

        // Создаем кнопки
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary btn-lg';
            button.textContent = option;
            // Привязываем проверку ответа к кнопке
            button.onclick = () => checkAnswer(button, option, currentQuestion.letter);
            optionsContainer.appendChild(button);
        });
    }

    // 2. Функция для проверки ответа
    function checkAnswer(clickedButton, selectedOption, correctOption) {
        // Отключаем все кнопки после ответа
        Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);
        
        if (selectedOption === correctOption) {
            score++; // Увеличиваем счет
            scoreInfo.textContent = `Score: ${score}`; 
            resultMessage.textContent = '✅ Correct!';
            resultMessage.className = 'mt-3 fw-bold text-success';
            clickedButton.classList.add('btn-success');
        } else {
            resultMessage.textContent = `❌ Not Correct! The correct answer is: ${correctOption}`;
            resultMessage.className = 'mt-3 fw-bold text-danger';
            clickedButton.classList.add('btn-danger');
            
            // Выделяем правильный ответ
            Array.from(optionsContainer.children).forEach(btn => {
                if (btn.textContent === correctOption) {
                    btn.classList.remove('btn-outline-primary');
                    btn.classList.add('btn-success');
                }
            });
        }
        
        // Обновляем текст кнопки "Далее"
        if (currentQuestionIndex < totalQuestions) {
             nextButton.textContent = 'Next question';
        } else {
             nextButton.textContent = 'Finish the test and see the result';
        }
        
        nextButton.style.display = 'block'; 
    }
    
    // --- Обработчики событий ---
    
    startButton.addEventListener('click', startQuiz);
    nextButton.addEventListener('click', nextQuestion);
    restartButton.addEventListener('click', initializeQuiz);

    // Инициализация при загрузке
    initializeQuiz();
});