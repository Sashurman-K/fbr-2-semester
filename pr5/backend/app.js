const express = require('express');
const { nanoid } = require('nanoid');
const cors = require("cors");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

let comics = [
    {
        id: nanoid(6),
        title: 'Железный человек',
        cost: 500,
        quantity: 10,
        description: 'История Тони Старка',
        img: 'https://cdn.marvel.com/u/prod/marvel/i/mg/1/50/637257a5577f7/clean.jpg'
    },
    {
        id: nanoid(6),
        title: 'Майор Гром',
        cost: 600,
        quantity: 5,
        description: 'Питерский детектив против Чумного Доктора',
        img: 'https://bubblefiles.storage.yandexcloud.net/a0a3cc4a-0619-4550-b508-bded84011f5a/conversions/13f89c232b5c25d1d28bf60e2cb70a78-original.webp'
    },
    {
        id: nanoid(6),
        title: 'Пацаны',
        cost: 850,
        quantity: 3,
        description: 'Кто присматривает за супергероями?',
        img: 'https://content.img-gorod.ru/pim/products/images/ef/3d/0190aa39-505f-73b8-a079-ff9e98fcef3d.jpg'
    },
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API управления комиксами',
            version: '1.0.0',
            description: 'Простое API для управления магазином комиксов',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    });
    next();
});

function findComicOr404(id, res) {
    const found = comics.find(c => c.id === id);
    if (!found) {
        res.status(404).json({ error: "Comic not found" });
        return null;
    }
    return found;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Comic:
 *       type: object
 *       required:
 *         - title
 *         - cost
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID
 *         title:
 *           type: string
 *           description: Название
 *         cost:
 *           type: number
 *           description: Цена
 *         quantity:
 *           type: integer
 *           description: Количество
 *         description:
 *           type: string
 *           description: Описание
 *         img:
 *           type: string
 *           description: Ссылка на изображение
 *       example:
 *         id: "abc123"
 *         title: "Человек-паук"
 *         cost: 450
 *         quantity: 5
 *         description: "Классика Marvel"
 *         img: "http://example.com/img.jpg"
 */

/**
 * @swagger
 * /api/comics:
 *   get:
 *     summary: Список всех комиксов
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Успех
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comic'
 */
app.get("/api/comics", (req, res) => {
    res.json(comics);
});

/**
 * @swagger
 * /api/comics/{id}:
 *   get:
 *     summary: Получить комикс по ID
 *     tags: [Comics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comic'
 *       404:
 *         description: Не найден
 */
app.get("/api/comics/:id", (req, res) => {
    const comic = findComicOr404(req.params.id, res);
    if (comic) res.json(comic);
});

/**
 * @swagger
 * /api/comics:
 *   post:
 *     summary: Создать новый комикс
 *     tags: [Comics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - cost
 *             properties:
 *               title:
 *                 type: string
 *               cost:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               img:
 *                 type: string
 *     responses:
 *       201:
 *         description: Создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comic'
 *       400:
 *         description: Ошибка валидации
 */
app.post("/api/comics", (req, res) => {
    const { title, cost, quantity, description, img } = req.body;
    if (!title || cost === undefined) {
        return res.status(400).json({ error: "Title and cost are required" });
    }
    const newComic = {
        id: nanoid(6),
        title: title.trim(),
        cost: Number(cost),
        quantity: Number(quantity) || 0,
        description: description ? description.trim() : "",
        img: img ? img.trim() : ""
    };
    comics.push(newComic);
    res.status(201).json(newComic);
});

/**
 * @swagger
 * /api/comics/{id}:
 *   patch:
 *     summary: Изменить данные комикса
 *     tags: [Comics]
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               cost:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               img:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлено
 *       404:
 *         description: Не найден
 */
app.patch("/api/comics/:id", (req, res) => {
    const comic = findComicOr404(req.params.id, res);
    if (!comic) return;
    const { title, cost, quantity, description, img } = req.body;
    if (title !== undefined) comic.title = title.trim();
    if (cost !== undefined) comic.cost = Number(cost);
    if (quantity !== undefined) comic.quantity = Number(quantity);
    if (description !== undefined) comic.description = description.trim();
    if (img !== undefined) comic.img = img.trim();
    res.json(comic);
});

/**
 * @swagger
 * /api/comics/{id}:
 *   delete:
 *     summary: Удалить комикс
 *     tags: [Comics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Удалено успешно
 *       404:
 *         description: Не найден
 */
app.delete("/api/comics/:id", (req, res) => {
    const id = req.params.id;
    const exists = comics.some((c) => c.id === id);
    if (!exists) return res.status(404).json({ error: "Comic not found" });
    comics = comics.filter((c) => c.id !== id);
    res.status(204).send();
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
    console.log(`🚀 Сервер: http://localhost:${port}`);
    console.log(`📖 Swagger: http://localhost:${port}/api-docs`);
});