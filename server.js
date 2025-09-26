// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const setupSocketEvents = require('./socketio');
const passport = require('./services/passport'); // Importa a sua configuração do Passport
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Middlewares
app.use(express.json());

// Adicione o middleware de sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Inicialize o Passport
app.use(passport.initialize());
app.use(passport.session()); // Use a sessão se for o caso

// Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  // O token de autenticação será passado aqui pelo frontend
  // auth: { token: "token_jwt_do_usuario" }
});

// Configura os eventos do Socket.IO chamando o novo módulo
setupSocketEvents(io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});