document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const messageDiv = document.getElementById('register-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Предотвращаем стандартную отправку формы

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Очистка предыдущих сообщений
        messageDiv.textContent = 'Registering...';
        messageDiv.className = 'mt-3 text-center text-info';

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Регистрация успешна
                messageDiv.textContent = 'Registration successful! Redirecting to login...';
                messageDiv.className = 'mt-3 text-center text-success';
                
                // Сохраняем токен и имя пользователя (Опционально, можно сразу перенаправить на вход)
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userId', data.user.id);

                // Перенаправление на главную страницу или страницу входа
                setTimeout(() => {
                    window.location.href = 'index.html'; // или 'login.html'
                }, 1500);

            } else {
                // Ошибка регистрации (например, пользователь уже существует)
                messageDiv.textContent = `Error: ${data.error || 'Failed to register.'}`;
                messageDiv.className = 'mt-3 text-center text-danger';
            }
        } catch (error) {
            console.error('Network or server error:', error);
            messageDiv.textContent = 'A network error occurred. Is the backend running?';
            messageDiv.className = 'mt-3 text-center text-danger';
        }
    });
});