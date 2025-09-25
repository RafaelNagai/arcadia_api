// routes/characterRoutes.js

const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const Rules = require('../models/Rules'); // Assumindo que o modelo de regras está neste caminho
const authMiddleware = require('../middlewares/auth');

// Importe suas constantes para usar em validações e cálculos
const { RACES } = require('../models/Race');
const { ORIGINS } = require('../models/Origin');
const { ATTRIBUTES } = require('../models/Attribute');
const { RELIGIONS } = require('../models/Religion');
const { ARCANE_TYPES } = require('../models/Arcane');

// Função utilitária para calcular os atributos finais
const calculateAttributes = (baseAttributes, raceBonuses, originBonuses) => {
    const finalAttributes = {};
    for (const attr of Object.keys(baseAttributes)) {
        finalAttributes[attr] = {
            value: baseAttributes[attr].value + (raceBonuses[attr] || 0) + (originBonuses[attr] || 0),
            skills: baseAttributes[attr].skills
        };
    }
    return finalAttributes;
};

// Rota para criar um novo personagem
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, race, origin, profession, religion } = req.body;

        // 1. Validar se a raça e a origem são válidas
        if (!Object.values(RACES).includes(race)) {
            return res.status(400).json({ code: 1101, message: 'Invalid Race.' });
        }
        if (!Object.values(ORIGINS).includes(origin)) {
            return res.status(400).json({ code: 1102, message: 'Invalid Origin.' });
        }
        if (!Object.values(RELIGIONS).includes(religion)) {
            return res.status(400).json({ code: 1103, message: 'Invalid Origin.' });
        }

        // 2. Obter a versão atual dos bonus de raça e origem
        const currentRules = await Rules.findOne({ version: '1.0' }); // Busque a versão mais recente
        if (!currentRules) {
            return res.status(500).json({ code: 1104, message: 'No Bonus found' });
        }

        const raceBonuses = currentRules.raceBonuses.get(race);
        const originBonuses = currentRules.originBonuses.get(origin);

        // 3. Definir atributos e habilidades base (Exemplo, você pode carregar de outro lugar)
        const baseAttributes = {
            [ATTRIBUTES.PHYSICAL]: { value: 0, skills: { fortitude: 0, willpower: 0, athletics: 0, combat: 0, defense: 0, movement: 0}},
            [ATTRIBUTES.DEXTERITY]: { value: 0, skills: { stealth: 0, piloting: 0, aim: 0, acrobatics: 0, crime: 0, dodge: 0}},
            [ATTRIBUTES.INTELECTUO]: { value: 0, skills: { perception: 0, intuition: 0, investigation: 0, survival: 0, arcane: 0, knowledge: 0}},
            [ATTRIBUTES.INFLUENCE]: { value: 0, skills: { diplomacy: 0, deception: 0, intimidation: 0, persuasion: 0, performance: 0, presence: 0}},
        };

        // 4. Calcular atributos finais com bônus
        const finalAttributes = calculateAttributes(baseAttributes, raceBonuses, originBonuses);

        // 4.1 Randomizar a afinidade e antitese do personagem
        const arcaneTypes = Object.values(ARCANE_TYPES);
        const affinity = arcaneTypes[Math.floor(Math.random() * arcaneTypes.length)];
        const antitese = arcaneTypes[Math.floor(Math.random() * arcaneTypes.length)];
        
        // 5. Criar e salvar o personagem
        const newCharacter = new Character({
            owner: req.user.id,
            version: currentRules.version,
            name,
            race,
            origin,
            profession,
            religion,
            arcane: {
                affinity,
                antitese,
            },
            attributes: finalAttributes,
        });

        await newCharacter.save();

        res.status(201).json({ message: 'Success created character', character: newCharacter });

    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 1100, message: 'Failed create character', error: error.message });
    }
});

module.exports = router;