document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const messageDiv = document.getElementById('login-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Предотвращаем стандартную отправку формы

        const username = usernameInput.value;
        const password = passwordInput.value;

        // Очистка предыдущих сообщений
        messageDiv.textContent = 'Logging in...';
        messageDiv.className = 'mt-3 text-center text-info';

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Вход успешен
                messageDiv.textContent = 'Login successful! Redirecting...';
                messageDiv.className = 'mt-3 text-center text-success';
                
                // *** КЛЮЧЕВОЙ МОМЕНТ: СОХРАНЕНИЕ ТОКЕНА И ДАННЫХ В localStorage ***
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userId', data.user.id);
                
                // Перенаправление на главную страницу
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 1500);

            } else {
                // Ошибка входа (неверное имя пользователя/пароль)
                messageDiv.textContent = `Error: ${data.error || 'Invalid credentials.'}`;
                messageDiv.className = 'mt-3 text-center text-danger';
            }
        } catch (error) {
            console.error('Network or server error:', error);
            messageDiv.textContent = 'A network error occurred. Is the backend running?';
            messageDiv.className = 'mt-3 text-center text-danger';
        }
    });
});