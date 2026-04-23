const { nanoid } = require('nanoid');
const { users, ROLES } = require('../data/store');
const {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    findUserByUsername,
    addRefreshToken
} = require('../utils/helpers');
const { invalidateUsersCache } = require('../middleware/cache');

async function register(req, res) {
    const { username, first_name, last_name, password, role = ROLES.USER } = req.body;

    if (!username || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (findUserByUsername(username)) {
        return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    let finalRole = ROLES.USER;
    if (role === ROLES.SELLER && req.user?.role === ROLES.ADMIN) {
        finalRole = ROLES.SELLER;
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
        await invalidateUsersCache();

        const { hashedPassword: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
}

async function login(req, res) {
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
    addRefreshToken(refreshToken);

    const { hashedPassword: _, ...userWithoutPassword } = user;
    res.json({ accessToken, refreshToken, user: userWithoutPassword });
}

function getMe(req, res) {
    const { hashedPassword: _, ...userWithoutPassword } = req.userData;
    res.json(userWithoutPassword);
}

module.exports = { register, login, getMe };