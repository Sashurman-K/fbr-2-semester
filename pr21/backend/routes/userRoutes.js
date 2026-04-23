const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { cacheMiddleware, USERS_CACHE_TTL } = require('../middleware/cache');
const { ROLES } = require('../data/store');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получение списка всех пользователей (кэш 1 минута)
 *     tags: [Пользователи]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещен (требуется роль Admin)
 */
router.get('/',
    authMiddleware,
    roleMiddleware([ROLES.ADMIN]),
    cacheMiddleware(() => 'users:all', USERS_CACHE_TTL),
    getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получение пользователя по ID (кэш 1 минута)
 *     tags: [Пользователи]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id',
    authMiddleware,
    roleMiddleware([ROLES.ADMIN]),
    cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
    getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновление пользователя
 *     tags: [Пользователи]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       404:
 *         description: Пользователь не найден
 */
router.put('/:id',
    authMiddleware,
    roleMiddleware([ROLES.ADMIN]),
    updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Блокировка пользователя
 *     tags: [Пользователи]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       403:
 *         description: Нельзя заблокировать себя
 */
router.delete('/:id',
    authMiddleware,
    roleMiddleware([ROLES.ADMIN]),
    deleteUser
);

module.exports = router;