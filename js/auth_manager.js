// =======================================================
// js/auth_manager.js
// Управляет статусом входа и выходом
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    const authControls = document.getElementById('auth-controls');

    // Функция проверки статуса и обновления UI
    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        authControls.innerHTML = ''; // Очищаем текущие элементы

        if (token && username) {
            // Пользователь залогинен
            
            // 1. Отображение имени пользователя
            const userStatus = document.createElement('span');
            userStatus.className = 'navbar-text me-3 text-white';
            userStatus.textContent = `Welcome, ${username}!`;
            authControls.appendChild(userStatus);

            // 2. Кнопка Выхода
            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn btn-outline-light';
            logoutButton.textContent = 'Logout';
            logoutButton.onclick = handleLogout;
            authControls.appendChild(logoutButton);

        } else {
            // Пользователь не залогинен
            
            // 1. Кнопка Входа
            const loginLink = document.createElement('a');
            loginLink.className = 'btn btn-outline-light me-2';
            loginLink.href = 'login.html';
            loginLink.textContent = 'Login';
            authControls.appendChild(loginLink);
            
            // 2. Кнопка Регистрации
            const registerLink = document.createElement('a');
            registerLink.className = 'btn btn-success';
            registerLink.href = 'register.html';
            registerLink.textContent = 'Register';
            authControls.appendChild(registerLink);
        }
    }

    // Функция обработки выхода из системы
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        
        // Перезагрузка страницы, чтобы обновить UI
        window.location.reload(); 
        // Или можно перенаправить на главную страницу:
        // window.location.href = 'index.html'; 
    }
    
    // Запускаем проверку при загрузке страницы
    updateAuthUI();
});