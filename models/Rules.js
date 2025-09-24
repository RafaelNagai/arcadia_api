// models/Rules.js

const mongoose = require('mongoose');
const { ATTRIBUTES } = require('./Attribute');

const RulesSchema = new mongoose.Schema({
    version: { // Ex: '1.0', '1.1', '2.0'
        type: String,
        required: true,
        unique: true
    },
    raceBonuses: {
        type: Map, // Mapeia o nome da raça para os bônus
        of: {
            [ATTRIBUTES.PHYSICAL]: Number,
            [ATTRIBUTES.DEXTERITY]: Number,
            [ATTRIBUTES.INTELECTUO]: Number,
            [ATTRIBUTES.INFLUENCE]: Number,
            [ATTRIBUTES.HP_MAX]: Number,
            [ATTRIBUTES.SANITY_MAX]: Number
        }
    },
    originBonuses: {
        type: Map,
        of: {
            [ATTRIBUTES.PHYSICAL]: Number,
            [ATTRIBUTES.DEXTERITY]: Number,
            [ATTRIBUTES.INTELECTUO]: Number,
            [ATTRIBUTES.INFLUENCE]: Number,
            [ATTRIBUTES.HP_MAX]: Number,
            [ATTRIBUTES.SANITY_MAX]: Number
        }
    },
});

module.exports = mongoose.model('Rules', RulesSchema);