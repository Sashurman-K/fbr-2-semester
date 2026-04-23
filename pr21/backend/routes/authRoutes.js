const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Пользователь уже существует
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Аутентификация]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     tags: [Аутентификация]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */
router.get('/me', authMiddleware, getMe);

module.exports = router;