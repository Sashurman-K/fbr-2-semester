const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST /api/users — создание пользователя
router.post('/users', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    const user = new User({ first_name, last_name, age });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/users — список всех пользователей
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — конкретный пользователь
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id — обновление пользователя
router.patch('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { first_name, last_name, age, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/users/:id — удаление пользователя
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;