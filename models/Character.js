const mongoose = require('mongoose');
const { RELIGIONS } = require('./Religion');
const { RACES } = require('./Race');
const { ORIGINS } = require('./Origin');
const { PhysicalSchema, DexteritySchema, IntelectuoSchema, InfluenceSchema, ATTRIBUTES } = require('./Attribute');

const CharacterSchema = new mongoose.Schema({
    owner: { // Campo que fará a referência
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Nome do modelo ao qual se refere
        required: true,
    },
    version: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    race: {
        type: String,
        enum: Object.values(RACES), 
        required: true,
    },
    origin: {
        type: String,
        enum: Object.values(ORIGINS),
        required: true,
    },
    religion: {
        type: String,
        enum: Object.values(RELIGIONS),
        required: true,
    },
    profession: {
        type: String,
        required: true,
        trim: true,
    },
    effortPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    attributes: {
        [ATTRIBUTES.PHYSICAL]: PhysicalSchema,
        [ATTRIBUTES.DEXTERITY]: DexteritySchema,
        [ATTRIBUTES.INTELECTUO]: IntelectuoSchema,
        [ATTRIBUTES.INFLUENCE]: InfluenceSchema,
    },
});

module.exports = mongoose.model('Character', CharacterSchema);