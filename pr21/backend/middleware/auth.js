const jwt = require('jsonwebtoken');
const { users } = require('../data/store');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const fullUser = users.find(u => u.id === payload.sub);

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

module.exports = authMiddleware;