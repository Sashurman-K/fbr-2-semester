const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// Секретные ключи для JWT
const JWT_SECRET = 'LKWEQWDFKSBVSGUIHFRFURGVBGYREVBJZXV';
const REFRESH_SECRET = 'REFRESH_SECRET_KEY_CHANGE_IN_PRODUCTION_123456789';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Настройка для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Только изображения!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB лимит
    fileFilter: fileFilter
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Роли пользователей
const ROLES = {
    GUEST: 'guest',
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

// Хранилища
const users = [];
const products = [];
let refreshTokens = new Set();

// Тестовые товары с изображениями
const testProducts = [
    {
        id: nanoid(10),
        title: "Смартфон Galaxy S23",
        category: "Электроника",
        description: "Флагманский смартфон с отличной камерой и мощным процессором. 6.1-дюймовый Dynamic AMOLED 2X дисплей, 50 МП камера, батарея 3900 мАч.",
        price: 79999.99,
        image: null,
        createdBy: "admin",
        createdById: null,
        createdAt: new Date().toISOString()
    },
    {
        id: nanoid(10),
        title: "Ноутбук MacBook Pro",
        category: "Компьютеры",
        description: "Профессиональный ноутбук для работы и творчества. 14-дюймовый Liquid Retina XDR дисплей, чип M3 Pro, 18GB ОЗУ, 512GB SSD.",
        price: 149999.99,
        image: null,
        createdBy: "admin",
        createdById: null,
        createdAt: new Date().toISOString()
    },
    {
        id: nanoid(10),
        title: "Наушники Sony WH-1000XM5",
        category: "Аксессуары",
        description: "Беспроводные наушники с активным шумоподавлением. До 30 часов работы, быстрая зарядка, отличное качество звука.",
        price: 29999.99,
        image: null,
        createdBy: "admin",
        createdById: null,
        createdAt: new Date().toISOString()
    }
];

// Создание тестового администратора
async function createTestAdmin() {
    const adminExists = users.find(u => u.username === 'admin');
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = {
            id: nanoid(10),
            username: 'admin',
            first_name: 'Администратор',
            last_name: 'Системы',
            hashedPassword,
            role: ROLES.ADMIN,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        users.push(admin);

        // Обновляем товары, добавляя createdById для админа
        testProducts.forEach(p => {
            p.createdById = admin.id;
            products.push(p);
        });

        console.log('✅ Создан тестовый администратор: admin / admin123');
    } else {
        products.push(...testProducts);
    }
}

// Swagger конфигурация
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth & Products API with Images',
            version: '3.0.0',
            description: 'API с поддержкой JWT токенов, RBAC и загрузкой изображений'
        },
        servers: [
            { url: `http://localhost:${port}`, description: 'Локальный сервер' }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'seller', 'admin'] },
                        isActive: { type: 'boolean' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        category: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        image: { type: 'string', nullable: true },
                        imageUrl: { type: 'string', nullable: true },
                        createdBy: { type: 'string' },
                        createdById: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' }
                    }
                },
                ProductCreate: {
                    type: 'object',
                    required: ['title', 'category', 'description', 'price'],
                    properties: {
                        title: { type: 'string' },
                        category: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Функции для генерации токенов
function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

function findUserById(id) {
    return users.find(user => user.id === id);
}

// Middleware для проверки аутентификации
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const fullUser = findUserById(payload.sub);

        if (!fullUser || !fullUser.isActive) {
            return res.status(401).json({ error: 'Пользователь не найден или заблокирован' });
        }

        req.user = payload;
        req.userData = fullUser;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Срок действия токена истек' });
        }
        return res.status(401).json({ error: 'Неверный токен' });
    }
}

// Middleware для проверки ролей
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостаточно прав для выполнения операции' });
        }

        next();
    };
}

// ============ АУТЕНТИФИКАЦИЯ ============

app.post('/api/auth/register', async (req, res) => {
    const { username, first_name, last_name, password, role = ROLES.USER } = req.body;

    if (!username || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (findUserByUsername(username)) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    let finalRole = ROLES.USER;
    if (role === ROLES.SELLER) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = jwt.verify(token, JWT_SECRET);
                if (payload.role === ROLES.ADMIN) {
                    finalRole = ROLES.SELLER;
                }
            } catch (e) {}
        }
    }

    try {
        const hashedPassword = await hashPassword(password);
        const newUser = {
            id: nanoid(10),
            username,
            first_name,
            last_name,
            hashedPassword,
            role: finalRole,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        const { hashedPassword: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username и пароль обязательны' });
    }

    const user = findUserByUsername(username);

    if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Неверный username или пароль' });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: 'Неверный username или пароль' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    const { hashedPassword: _, ...userWithoutPassword } = user;
    res.json({ accessToken, refreshToken, user: userWithoutPassword });
});

app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken обязателен' });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Неверный refresh token' });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        refreshTokens.delete(refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        refreshTokens.add(newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        refreshTokens.delete(refreshToken);
        return res.status(401).json({ error: 'Неверный или просроченный refresh token' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
        refreshTokens.delete(refreshToken);
    }
    res.json({ message: 'Выход выполнен успешно' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const { hashedPassword: _, ...userWithoutPassword } = req.userData;
    res.json(userWithoutPassword);
});

// ============ УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ============

app.get('/api/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const usersWithoutPasswords = users.map(({ hashedPassword, ...rest }) => rest);
    res.json(usersWithoutPasswords);
});

app.get('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const { hashedPassword, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.put('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), async (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { first_name, last_name, role, isActive } = req.body;

    if (first_name) users[userIndex].first_name = first_name;
    if (last_name) users[userIndex].last_name = last_name;
    if (role && [ROLES.USER, ROLES.SELLER, ROLES.ADMIN].includes(role)) {
        users[userIndex].role = role;
    }
    if (typeof isActive === 'boolean') {
        users[userIndex].isActive = isActive;
    }

    users[userIndex].updatedAt = new Date().toISOString();

    const { hashedPassword, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (users[userIndex].id === req.user.sub) {
        return res.status(403).json({ error: 'Нельзя заблокировать самого себя' });
    }

    users[userIndex].isActive = false;
    res.json({ message: 'Пользователь заблокирован', user: { id: users[userIndex].id, username: users[userIndex].username } });
});

// ============ УПРАВЛЕНИЕ ТОВАРАМИ (с изображениями) ============

// Создать товар с изображением
app.post('/api/products', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), upload.single('image'), (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (typeof Number(price) !== 'number' || Number(price) <= 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }

    const newProduct = {
        id: nanoid(10),
        title,
        category,
        description,
        price: Number(price),
        image: req.file ? req.file.filename : null,
        imageUrl: req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : null,
        createdBy: req.user.username,
        createdById: req.user.sub,
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Получить все товары
app.get('/api/products', authMiddleware, (req, res) => {
    const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.image ? `http://localhost:${port}/uploads/${p.image}` : null
    }));
    res.json(productsWithUrls);
});

// Получить товар по ID
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const productWithUrl = {
        ...product,
        imageUrl: product.image ? `http://localhost:${port}/uploads/${product.image}` : null
    };
    res.json(productWithUrl);
});

// Обновить товар (с возможностью обновления изображения)
app.put('/api/products/:id', authMiddleware, roleMiddleware([ROLES.SELLER, ROLES.ADMIN]), upload.single('image'), (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (typeof Number(price) !== 'number' || Number(price) <= 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }

    // Удаляем старое изображение, если загружено новое
    if (req.file && products[productIndex].image) {
        const oldImagePath = path.join(__dirname, 'uploads', products[productIndex].image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    products[productIndex] = {
        ...products[productIndex],
        title,
        category,
        description,
        price: Number(price),
        image: req.file ? req.file.filename : products[productIndex].image,
        imageUrl: req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : products[productIndex].imageUrl,
        updatedAt: new Date().toISOString()
    };

    const productWithUrl = {
        ...products[productIndex],
        imageUrl: products[productIndex].image ? `http://localhost:${port}/uploads/${products[productIndex].image}` : null
    };
    res.json(productWithUrl);
});

// Удалить товар (и его изображение)
app.delete('/api/products/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    // Удаляем изображение, если оно есть
    if (products[productIndex].image) {
        const imagePath = path.join(__dirname, 'uploads', products[productIndex].image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    products.splice(productIndex, 1);
    res.status(204).send();
});

// Запуск сервера
createTestAdmin().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Сервер запущен на http://localhost:${port}`);
        console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
        console.log(`📁 Загруженные изображения: http://localhost:${port}/uploads/`);
        console.log('\n📝 Роли и права:');
        console.log('  👤 Гость - только регистрация и вход');
        console.log('  👤 Пользователь (user) - просмотр товаров');
        console.log('  🛍️ Продавец (seller) - создание и редактирование товаров');
        console.log('  👑 Администратор (admin) - полный доступ');
        console.log('\n🔑 Тестовый администратор: admin / admin123');
    });
});