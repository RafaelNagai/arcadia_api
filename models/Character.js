const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    owner: { // Campo que fará a referência
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Nome do modelo ao qual se refere
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
});

module.exports = mongoose.model('Character', CharacterSchema);