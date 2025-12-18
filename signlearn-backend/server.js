require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_12345';
const saltRounds = 10;
// Настройка подключения к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
pool.connect()
    .then(client => {
        console.log('--- DATABASE CONNECTION SUCCESSFUL! ---');
        client.release(); // Освобождаем клиент после успешной проверки
    })
    .catch(err => {
        // !!! ЭТОТ БЛОК ВЫВЕДЕТ ТОЧНУЮ ОШИБКУ !!!
        console.error('!!! DATABASE CONNECTION ERROR !!!\n', err.stack);
        // Принудительное завершение процесса при критической ошибке
        process.exit(1); 
    });
// Настройка Middleware
app.use(cors());
app.use(express.json());

// ... (после app.use(express.json());)

// Middleware для проверки JWT-токена
const authenticateToken = (req, res, next) => {
    // 1. Получаем токен из заголовка 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ожидаем формат: Bearer ТОКЕН

    if (token == null) {
        // Нет токена - пользователь не аутентифицирован
        return res.status(401).json({ error: 'Access denied. Token is missing.' });
    }

    // 2. Верификация токена
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Недействительный токен (истек, изменен)
            return res.status(403).json({ error: 'Token is invalid or expired.' });
        }
        // 3. Токен действителен, сохраняем данные пользователя в запросе
        req.user = user; 
        next(); // Переходим к следующему обработчику маршрута
    });
};

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // 1. Хеширование пароля
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 2. Сохранение пользователя в БД
        const result = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );

        const user = result.rows[0];

        // 3. Генерация токена JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, username: user.username },
            token: token
        });

    } catch (err) {
        // Проверка на ошибку уникальности (пользователь уже существует)
        if (err.code === '23505') { 
            return res.status(409).json({ error: 'Username already exists.' });
        }
        console.error('Registration error:', err.message);
        res.status(500).json({ error: 'Server registration failed.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // 1. Поиск пользователя
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 2. Сравнение пароля
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // 3. Генерация токена JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            user: { id: user.id, username: user.username },
            token: token
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server login failed.' });
    }
});

app.post('/api/scores', authenticateToken, async (req, res) => {
    try {
        // user_id берется из ТОКЕНА
        const user_id = req.user.id; 
        // А здесь мы ждем только quiz_type и score
        const { quiz_type, score } = req.body; 

        if (!quiz_type || score === undefined) {
            // Теперь проверяем только quiz_type и score
            return res.status(400).json({ error: 'Missing required fields: quiz_type or score.' });
        }

        // SQL-запрос для вставки данных (Вставляем user_id)
        const result = await pool.query(
            'INSERT INTO scores (user_id, quiz_type, score) VALUES ($1, $2, $3) RETURNING *',
            [user_id, quiz_type, score]
        );

        res.status(201).json({ 
            message: 'Score saved successfully', 
            data: result.rows[0] 
        });

    } catch (err) {
        console.error('Error saving score:', err.message);
        res.status(500).json({ error: 'Failed to save score on server.', details: err.message });
    }
});


// API-маршрут для получения всех результатов
app.get('/api/scores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scores ORDER BY date_submitted DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching scores:', err.message);
        res.status(500).json({ error: 'Failed to fetch scores.' });
    }
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database connected: ${process.env.DB_DATABASE}`);
});