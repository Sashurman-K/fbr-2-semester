const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth & Products API with Redis Cache',
            version: '3.0.0',
            description: `
API с поддержкой JWT токенов, RBAC, загрузкой изображений и Redis кэшированием.

## Возможности API:
- 🔐 Регистрация и аутентификация пользователей
- 🎫 JWT токены (Access + Refresh)
- 👥 Управление пользователями (только Admin)
- 📦 Управление товарами с загрузкой изображений
- 🗄️ Redis кэширование (GET запросы)

## Роли и права:
| Роль | Права |
|------|-------|
| **user** | Просмотр товаров |
| **seller** | Просмотр, создание, редактирование товаров |
| **admin** | Полный доступ |

## Кэширование Redis:
| Маршрут | Время кэша |
|---------|------------|
| GET /api/users | 1 минута |
| GET /api/users/:id | 1 минута |
| GET /api/products | 10 минут |
| GET /api/products/:id | 10 минут |

## Тестовый аккаунт:
- **Логин:** admin
- **Пароль:** admin123
            `,
            contact: {
                name: "API Support",
                email: "support@example.com"
            }
        },
        servers: [
            { url: `http://localhost:${port}`, description: 'Локальный сервер' }
        ],
        components: {
            schemas: {
                RegisterRequest: {
                    type: 'object',
                    required: ['username', 'first_name', 'last_name', 'password'],
                    properties: {
                        username: { type: 'string', example: 'john_doe' },
                        first_name: { type: 'string', example: 'John' },
                        last_name: { type: 'string', example: 'Doe' },
                        password: { type: 'string', example: 'password123' },
                        role: { type: 'string', enum: ['user', 'seller'], example: 'user' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'admin' },
                        password: { type: 'string', example: 'admin123' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/UserResponse' }
                    }
                },
                RefreshRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string' }
                    }
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'seller', 'admin'] },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                UserUpdateRequest: {
                    type: 'object',
                    properties: {
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'seller', 'admin'] },
                        isActive: { type: 'boolean' }
                    }
                },
                ProductResponse: {
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
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                ProductCreateRequest: {
                    type: 'object',
                    required: ['title', 'category', 'description', 'price'],
                    properties: {
                        title: { type: 'string', example: 'Новый товар' },
                        category: { type: 'string', example: 'Электроника' },
                        description: { type: 'string', example: 'Описание товара' },
                        price: { type: 'number', example: 999.99 }
                    }
                },
                CacheResponse: {
                    type: 'object',
                    properties: {
                        source: { type: 'string', enum: ['cache', 'server'] },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Введите токен в формате: Bearer <your_token>'
                }
            },
            requestBodies: {
                ProductWithImage: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['title', 'category', 'description', 'price'],
                                properties: {
                                    title: { type: 'string' },
                                    category: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    image: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Файл изображения (jpg, png, gif, webp)'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Аутентификация', description: 'Регистрация, вход, обновление токенов' },
            { name: 'Пользователи', description: 'Управление пользователями (только Admin)' },
            { name: 'Товары', description: 'CRUD операции с товарами' }
        ]
    },
    apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(swaggerOptions);