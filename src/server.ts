import 'dotenv/config';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import session from 'express-session';
import characterRoutes from './infrastructure/routes/CharacterRoute';
import setupSocketEvents from './sockets/CharacterSocket';
import passport from 'passport';
import authRoutes from './infrastructure/routes/AuthRoute';
import cors from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB:', err));

// Defina as opções do CORS. Use a variável de ambiente para a URL do frontend.
const whitelist = [process.env.FRONTEND_URL]; // Inclua a URL de produção aqui

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Para requisições sem origem (como Postman), ou se a origem for do localhost, permita.
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } 
    // Para produção, verifique se a URL de origem está na sua lista de permissões.
    else if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  }
};

// Use o middleware CORS com as opções definidas
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());

// Middleware de sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
  })
);

// Inicialize o Passport
app.use(passport.initialize());
app.use(passport.session()); // se estiver usando sessão

// Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);

// Cria o servidor HTTP
const server = http.createServer(app);

// Configura o Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000', // Ajuste conforme o frontend
    methods: ['GET', 'POST'],
  },
});

// Configura eventos do Socket.IO
setupSocketEvents(io);

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
