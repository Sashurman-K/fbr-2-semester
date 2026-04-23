const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { cacheMiddleware, PRODUCTS_CACHE_TTL } = require('../middleware/cache');
const upload = require('../config/multer');
const { ROLES } = require('../data/store');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создание нового товара
 *     tags: [Товары]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductWithImage'
 *     responses:
 *       201:
 *         description: Товар создан
 *       403:
 *         description: Недостаточно прав
 */
router.post('/',
    authMiddleware,
    roleMiddleware([ROLES.SELLER, ROLES.ADMIN]),
    upload.single('image'),
    createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получение списка всех товаров (кэш 10 минут)
 *     tags: [Товары]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Список товаров
 */
router.get('/',
    authMiddleware,
    cacheMiddleware(() => 'products:all', PRODUCTS_CACHE_TTL),
    getAllProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получение товара по ID (кэш 10 минут)
 *     tags: [Товары]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *       404:
 *         description: Товар не найден
 */
router.get('/:id',
    authMiddleware,
    cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
    getProductById
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновление товара
 *     tags: [Товары]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       $ref: '#/components/requestBodies/ProductWithImage'
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       404:
 *         description: Товар не найден
 */
router.put('/:id',
    authMiddleware,
    roleMiddleware([ROLES.SELLER, ROLES.ADMIN]),
    upload.single('image'),
    updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаление товара
 *     tags: [Товары]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */
router.delete('/:id',
    authMiddleware,
    roleMiddleware([ROLES.ADMIN]),
    deleteProduct
);

module.exports = router;