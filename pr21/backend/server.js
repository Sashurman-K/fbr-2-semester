require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = require('./config/swagger');
const { initRedis } = require('./config/redis');
const { createTestAdmin } = require('./data/store');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Documentation with Redis Cache"
}));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'API работает',
        docs: `http://localhost:${port}/api-docs`
    });
});

// Запуск сервера
async function startServer() {
    await createTestAdmin();
    await initRedis();

    app.listen(port, () => {
        console.log(`\nСервер запущен на http://localhost:${port}`);
        console.log(`Swagger UI: http://localhost:${port}/api-docs`);
        console.log(`Загруженные изображения: http://localhost:${port}/uploads/`);
        console.log(`Redis кэширование включено\n`);
        console.log('Роли и права:');
        console.log('  Пользователь (user) - просмотр товаров');
        console.log('  Продавец (seller) - создание и редактирование товаров');
        console.log('  Администратор (admin) - полный доступ\n');
        console.log('Тестовый администратор: admin / admin123\n');
    });
}

startServer();