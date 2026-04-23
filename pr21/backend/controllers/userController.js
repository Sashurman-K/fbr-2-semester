const { users } = require('../data/store');
const { invalidateUsersCache, saveToCache } = require('../middleware/cache');

async function getAllUsers(req, res) {
    const usersWithoutPasswords = users.map(({ hashedPassword, ...rest }) => rest);
    if (req.cacheKey) {
        await saveToCache(req.cacheKey, usersWithoutPasswords, req.cacheTTL);
    }
    res.json({
        source: 'server',
        data: usersWithoutPasswords
    });
}

async function getUserById(req, res) {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const { hashedPassword, ...userWithoutPassword } = user;
    if (req.cacheKey) {
        await saveToCache(req.cacheKey, userWithoutPassword, req.cacheTTL);
    }
    res.json({
        source: 'server',
        data: userWithoutPassword
    });
}

async function updateUser(req, res) {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { first_name, last_name, role, isActive } = req.body;

    if (first_name) users[userIndex].first_name = first_name;
    if (last_name) users[userIndex].last_name = last_name;
    if (role) users[userIndex].role = role;
    if (typeof isActive === 'boolean') users[userIndex].isActive = isActive;

    users[userIndex].updatedAt = new Date().toISOString();
    await invalidateUsersCache(req.params.id);

    const { hashedPassword, ...userWithoutPassword } = users[userIndex];
    res.json(userWithoutPassword);
}

async function deleteUser(req, res) {
    const userIndex = users.findIndex(u => u.id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (users[userIndex].id === req.user.sub) {
        return res.status(403).json({ error: 'Нельзя заблокировать самого себя' });
    }

    users[userIndex].isActive = false;
    await invalidateUsersCache(req.params.id);

    res.json({ message: 'Пользователь заблокирован', user: { id: users[userIndex].id, username: users[userIndex].username } });
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };