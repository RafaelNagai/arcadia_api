// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Rota para Sign Up (Cadastro)
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// Rota para Sign In (Login)
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Encontra o usuário pelo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Compara a senha fornecida com a senha criptografada
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Gera um token JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;