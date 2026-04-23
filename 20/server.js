const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршруты
app.use('/api', userRoutes);

// Базовый маршрут для проверки
app.get('/', (req, res) => {
  res.json({ message: 'MongoDB User API is running' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});