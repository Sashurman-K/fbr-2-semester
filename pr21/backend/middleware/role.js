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

module.exports = roleMiddleware;