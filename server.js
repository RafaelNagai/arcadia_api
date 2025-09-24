// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Middlewares
app.use(express.json()); // Habilita o uso de JSON no corpo das requisições

// Rotas de autenticação (signup e signin)
app.use('/api/auth', authRoutes);

// Exemplo de rota protegida (requer autenticação)
app.get('/api/profile', authMiddleware, (req, res) => {
    res.json({
        message: 'Welcome to your profile!',
        user: req.user
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});