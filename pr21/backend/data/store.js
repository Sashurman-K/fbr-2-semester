const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

const ROLES = {
    GUEST: 'guest',
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

const users = [];
const products = [];
let refreshTokens = new Set();

const testProducts = [
    {
        id: nanoid(10),
        title: "Смартфон Galaxy S23",
        category: "Электроника",
        description: "Флагманский смартфон с отличной камерой и мощным процессором.",
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
        description: "Профессиональный ноутбук для работы и творчества.",
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
        description: "Беспроводные наушники с активным шумоподавлением.",
        price: 29999.99,
        image: null,
        createdBy: "admin",
        createdById: null,
        createdAt: new Date().toISOString()
    }
];

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
        testProducts.forEach(p => {
            p.createdById = admin.id;
            products.push(p);
        });
        console.log('✅ Создан тестовый администратор: admin / admin123');
    } else {
        products.push(...testProducts);
    }
}

module.exports = { users, products, refreshTokens, ROLES, createTestAdmin };