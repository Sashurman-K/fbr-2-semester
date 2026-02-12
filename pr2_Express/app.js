const express = require('express');
const app = express();
const port = 3000;
let products = [
    {
        id: 1, name: 'Гречка'
        , cost: 150
    },
    {
        id: 2, name: 'Макароны'
        , cost: 300
    },
    {
        id: 3, name: 'Колбаса'
        , cost: 500
    },
]
app.use(express.json());
app.get('/'
    , (req, res) => {
        res.send('Главная страница');
    });
app.post('/products'
    , (req, res) => {
        const { name, cost } = req.body;
        const newProduct = {
            id: Date.now(),
            name,
            cost
        };
        users.push(newProduct);
        res.status(201).json(newProduct);
    });
app.get('/products'
    , (req, res) => {
        res.send(JSON.stringify(products));
    });
app.get('/products/:id'
    , (req, res) => {
        let product = users.find(u => u.id == req.params.id);
        res.send(JSON.stringify(product));
    });
app.patch('/products/:id'
    , (req, res) => {
        const product = products.find(u => u.id == req.params.id);
        const { name, cost } = req.body;
        if (name !== undefined) product.name = name;
        if (cost !== undefined) product.cost = cost;
        res.json(product);
    });
app.delete('/products/:id'
    , (req, res) => {
        products = products.filter(u => u.id != req.params.id);
        res.send('Ok');
    });
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});