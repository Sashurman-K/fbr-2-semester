const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;


const JWT_SECRET = 'LKWEQWDFKSBVSGUIHFRFURGVBGYREVBJZXV';
const ACCESS_EXPIRES_IN = '15m';

app.use(express.json());

const users = [];
const products = [
    {
        id: nanoid(10),
        title: "Смартфон Galaxy S23",
        category: "Электроника",
        description: "Флагманский смартфон с отличной камерой и мощным процессором",
        price: 79999.99,
        createdBy: "test@example.com",
        createdById: "test-user-1",
        createdAt: new Date().toISOString()
    },
    {
        id: nanoid(10),
        title: "Ноутбук MacBook Pro",
        category: "Компьютеры",
        description: "Профессиональный ноутбук для работы и творчества",
        price: 149999.99,
        createdBy: "test@example.com",
        createdById: "test-user-1",
        createdAt: new Date().toISOString()
    },
    {
        id: nanoid(10),
        title: "Наушники Sony WH-1000XM5",
        category: "Аксессуары",
        description: "Беспроводные наушники с активным шумоподавлением",
        price: 29999.99,
        createdBy: "test@example.com",
        createdById: "test-user-1",
        createdAt: new Date().toISOString()
    }
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth & Products API',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'abc123' },
                        username: { type: 'string', example: 'user' },
                        first_name: { type: 'string', example: 'Иван' },
                        last_name: { type: 'string', example: 'Петров' }
                    }
                },
                UserRegistration: {
                    type: 'object',
                    required: ['username', 'first_name', 'last_name', 'password'],
                    properties: {
                        username: { type: 'string', example: 'user' },
                        first_name: { type: 'string', example: 'Иван' },
                        last_name: { type: 'string', example: 'Петров' },
                        password: { type: 'string', example: 'securePassword123' }
                    }
                },
                UserLogin: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'user' },
                        password: { type: 'string', example: 'securePassword123' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'prod123' },
                        title: { type: 'string', example: 'Смартфон' },
                        category: { type: 'string', example: 'Электроника' },
                        description: { type: 'string', example: 'Новый смартфон с отличной камерой' },
                        price: { type: 'number', example: 29999.99 },
                        createdBy: { type: 'string', example: 'user' },
                        createdAt: { type: 'string', example: '2024-01-01T12:00:00Z' },
                        updatedAt: { type: 'string', example: '2024-01-01T12:00:00Z' }
                    }
                },
                ProductCreate: {
                    type: 'object',
                    required: ['title', 'category', 'description', 'price'],
                    properties: {
                        title: { type: 'string', example: 'Смартфон' },
                        category: { type: 'string', example: 'Электроника' },
                        description: { type: 'string', example: 'Новый смартфон с отличной камерой' },
                        price: { type: 'number', example: 29999.99 }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Введите JWT токен в формате: Bearer <token>'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}


async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

function findUserByUsername(username) {
    console.log(users);
    return users.find(user => user.username === username);
}


function findUserById(id) {
    return users.find(user => user.id === id);
}


function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';


    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            error: 'Отсутствует или неверный заголовок авторизации. Используйте формат: Bearer <token>'
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);


        req.user = payload; // { sub: userId, username: userusername, iat, exp }


        const fullUser = findUserById(payload.sub);
        if (!fullUser) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }
        req.userData = fullUser;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Срок действия токена истек' });
        }
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
app.post('/api/auth/register', async (req, res) => {
    const { username, first_name, last_name, password } = req.body;

    if (!username || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }


    if (findUserByUsername(username)) {
        return res.status(400).json({ error: 'Пользователь с таким username уже существует' });
    }

    try {
        const hashedPassword = await hashPassword(password);

        const newUser = {
            id: nanoid(10),
            username,
            first_name,
            last_name,
            hashedPassword
        };

        users.push(newUser);

        const { hashedPassword: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Успешный вход, возвращает JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 */
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username и пароль обязательны' });
    }

    const user = findUserByUsername(username);

    if (!user) {
        return res.status(401).json({ error: 'Неверный username или пароль' });
    }

    const isAuthenticated = await verifyPassword(password, user.hashedPassword);

    if (isAuthenticated) {
        const accessToken = jwt.sign(
            {
                sub: user.id,
                username: user.username
            },
            JWT_SECRET,
            {
                expiresIn: ACCESS_EXPIRES_IN
            }
        );

        const { hashedPassword: _, ...userWithoutPassword } = user;

        res.status(200).json({
            accessToken,
            user: userWithoutPassword
        });
    } else {
        res.status(401).json({ error: 'Неверный username или пароль' });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о текущем пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован или неверный токен
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
    // req.userData содержит полные данные пользователя (без пароля)
    const { hashedPassword: _, ...userWithoutPassword } = req.userData;
    res.status(200).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 */
app.post('/api/products', (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }

    const newProduct = {
        id: nanoid(10),
        title,
        category,
        description,
        price,
        createdBy: req.user.username,
        createdById: req.user.sub,
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    res.status(200).json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.status(200).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       200:
 *         description: Товар обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав для обновления этого товара
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    // Проверка прав (только создатель может редактировать)
    if (products[productIndex].createdById !== req.user.sub) {
        return res.status(403).json({ error: 'Нет прав для редактирования этого товара' });
    }

    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }

    products[productIndex] = {
        ...products[productIndex],
        title,
        category,
        description,
        price,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json(products[productIndex]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав для удаления этого товара
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    // Проверка прав (только создатель может удалить)
    if (products[productIndex].createdById !== req.user.sub) {
        return res.status(403).json({ error: 'Нет прав для удаления этого товара' });
    }

    products.splice(productIndex, 1);
    res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    console.log(`📚 Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
    console.log('\n📝 Доступные маршруты:');
    console.log('  POST   /api/auth/register    - Регистрация');
    console.log('  POST   /api/auth/login       - Вход (получение JWT)');
    console.log('  GET    /api/auth/me           - Текущий пользователь (требует JWT)');
    console.log('  POST   /api/products          - Создать товар (требует JWT)');
    console.log('  GET    /api/products          - Все товары (публичный)');
    console.log('  GET    /api/products/:id      - Товар по ID (требует JWT)');
    console.log('  PUT    /api/products/:id      - Обновить товар (требует JWT)');
    console.log('  DELETE /api/products/:id      - Удалить товар (требует JWT)');
});