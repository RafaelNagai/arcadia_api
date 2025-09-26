// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ROLES = {
  PLAYER: 'player',
  SPECTATOR: 'spectator',
  GAMEMASTER: 'gameMaster',
};

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    googleId: String,
    appleId: String,
});

// Criptografa a senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        console.log('Hashing password:', this.password);
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Método para comparar a senha fornecida com a senha criptografada
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = {
    User: mongoose.model('User', UserSchema),
    ROLES
};