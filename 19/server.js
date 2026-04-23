const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/users');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', userRoutes);

// Синхронизация модели с БД
sequelize.sync({ alter: true })
  .then(() => {
    console.log('PostgreSQL connected and synced');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });