const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { users, refreshTokens } = require('../data/store');
require('dotenv').config();

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, role: user.role },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

function findUserById(id) {
    return users.find(user => user.id === id);
}

function addRefreshToken(token) {
    refreshTokens.add(token);
}

function deleteRefreshToken(token) {
    refreshTokens.delete(token);
}

function hasRefreshToken(token) {
    return refreshTokens.has(token);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashPassword,
    verifyPassword,
    findUserByUsername,
    findUserById,
    addRefreshToken,
    deleteRefreshToken,
    hasRefreshToken
};