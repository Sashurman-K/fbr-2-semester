const express = require('express');
const { nanoid } = require('nanoid');
const cors = require("cors");

const app = express();
const port = 3000;

// Исходные данные с новыми полями
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

// --- API ROUTES ---

app.get("/api/comics", (req, res) => {
    res.json(comics);
});

app.get("/api/comics/:id", (req, res) => {
    const comic = findComicOr404(req.params.id, res);
    if (comic) res.json(comic);
});

// POST - Добавление новых полей в создание
app.post("/api/comics", (req, res) => {
    const { title, cost, quantity, description, img } = req.body;

    if (!title || cost === undefined) {
        return res.status(400).json({ error: "Title and cost are required" });
    }

    const newComic = {
        id: nanoid(6),
        title: title.trim(),
        cost: Number(cost),
        quantity: Number(quantity) || 0, // По умолчанию 0
        description: description ? description.trim() : "",
        img: img ? img.trim() : ""
    };

    comics.push(newComic);
    res.status(201).json(newComic);
});

// PATCH - Добавление новых полей в обновление
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
    console.log(`🚀 Бэкенд запущен на http://localhost:${port}`);
});