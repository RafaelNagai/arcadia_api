// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const sendEmail = require('../services/emailSender');

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

// Rota de Solicitação de Reset de Senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Procurar o usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Gerar um token de reset único e temporário
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Expira em 1 hora

    // 3. Salvar o token e o tempo de expiração no usuário
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // 4. Criar o link de reset
    const resetURL = `${req.protocol}://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // 5. Criar o template HTML do e-mail
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Redefinição de Senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Para prosseguir, clique no botão abaixo para criar uma nova senha:</p>
        <div style="margin: 20px 0;">
          <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
        </div>
        <p>O link de redefinição de senha é válido por 1 hora.</p>
        <p>Se você não solicitou a redefinição de senha, por favor, ignore este e-mail.</p>
        <p>Atenciosamente,<br>Sua equipe de suporte</p>
      </div>
    `;

    // 5. Enviar o e-mail
    await sendEmail({
      email: user.email,
      subject: 'Redefinição de Senha',
      html: htmlMessage,
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Rota de Reset de Senha
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Atribua a senha hasheada ao usuário
    user.password = newPassword;
    
    // Limpe o token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Rota para iniciar o fluxo de login do Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de callback do Google, onde o Passport lida com a resposta
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Autenticação bem-sucedida, gere e retorne o JWT
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.redirect(`http://seu-frontend.com/auth-success?token=${token}`);
    }
);

// Rotas da Apple (são similares às do Google)
router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback', 
    passport.authenticate('apple', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.redirect(`http://seu-frontend.com/auth-success?token=${token}`);
    }
);

module.exports = router;