const { nanoid } = require('nanoid');
const { products } = require('../data/store');
const path = require('path');
const fs = require('fs');
const { invalidateProductsCache, saveToCache } = require('../middleware/cache');

const port = process.env.PORT || 3000;

async function createProduct(req, res) {
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
    await invalidateProductsCache();

    res.status(201).json(newProduct);
}

async function getAllProducts(req, res) {
    const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.image ? `http://localhost:${port}/uploads/${p.image}` : null
    }));
    if (req.cacheKey) {
        await saveToCache(req.cacheKey, productsWithUrls, req.cacheTTL);
    }
    res.json({
        source: 'server',
        data: productsWithUrls
    });
}

async function getProductById(req, res) {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const productWithUrl = {
        ...product,
        imageUrl: product.image ? `http://localhost:${port}/uploads/${product.image}` : null
    };
    if (req.cacheKey) {
        await saveToCache(req.cacheKey, productWithUrl, req.cacheTTL);
    }
    res.json({
        source: 'server',
        data: productWithUrl
    });
}

async function updateProduct(req, res) {
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

    if (req.file && products[productIndex].image) {
        const oldImagePath = path.join(__dirname, '../uploads', products[productIndex].image);
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
        updatedAt: new Date().toISOString()
    };

    await invalidateProductsCache(req.params.id);

    const productWithUrl = {
        ...products[productIndex],
        imageUrl: products[productIndex].image ? `http://localhost:${port}/uploads/${products[productIndex].image}` : null
    };
    res.json(productWithUrl);
}

async function deleteProduct(req, res) {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    if (products[productIndex].image) {
        const imagePath = path.join(__dirname, '../uploads', products[productIndex].image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    products.splice(productIndex, 1);
    await invalidateProductsCache(req.params.id);

    res.status(204).send();
}

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };