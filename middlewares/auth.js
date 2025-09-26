// middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

const verifySocketToken = (socket, next) => {
    const token = socket.handshake.headers.token;
    console.log('Token recebido no Socket.IO:', socket.handshake, token);

    if (!token) {
        return next(new Error('Autenticação falhou: token não fornecido.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id; // Anexe o ID do usuário ao socket
        next();
    } catch (error) {
        next(new Error('Autenticação falhou: token inválido.'));
    }
};

module.exports = { authMiddleware, verifySocketToken };