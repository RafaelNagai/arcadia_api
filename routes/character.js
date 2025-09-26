// routes/characterRoutes.js

const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const Rules = require('../models/Rules'); // Assumindo que o modelo de regras está neste caminho
const { authMiddleware } = require('../middlewares/auth');

// Importe suas constantes para usar em validações e cálculos
const { RACES } = require('../models/Race');
const { ORIGINS } = require('../models/Origin');
const { ATTRIBUTES } = require('../models/Attribute');
const { RELIGIONS } = require('../models/Religion');
const { ARCANE_TYPES } = require('../models/Arcane');
const { User, ROLES } = require('../models/User');

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

// Rota para ADICIONAR um usuário para compartilhar a ficha (usando email ou username)
router.put('/:characterId/share', authMiddleware, async (req, res) => {
    try {
        const { identifier, role } = req.body; // 'identifier' pode ser email ou username
        const { characterId } = req.params;

        if(!Object.values(ROLES).includes(role)) {
            return res.status(404).json({ message: 'Role not found.' });
        }

        // 1. Encontre a ficha de personagem
        const character = await Character.findById(characterId);
        if (!character) {
            return res.status(404).json({ message: 'Character not found.' });
        }

        // 2. Verifique se o usuário logado é o dono da ficha
        if (character.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to share this character sheet.' });
        }
        
        // 3. Encontre o usuário a ser compartilhado por email ou username
        const userToAdd = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });
        
        if (!userToAdd) {
            return res.status(404).json({ message: 'User to be shared with not found.' });
        }

        // 4. Adicione o ID do usuário à lista de compartilhados
        const updatedCharacter = await Character.findByIdAndUpdate(
            characterId,
            { $addToSet: { shared: { userId: userToAdd._id, role: role } } }, // Use o _id do usuário encontrado
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'User added to shared list successfully.',
            character: updatedCharacter
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// Rota para REMOVER um usuário da lista de compartilhados (usando email ou username)
router.put('/:characterId/unshare', authMiddleware, async (req, res) => {
    try {
        const { identifier } = req.body;
        const { characterId } = req.params;

        // 1. Encontre a ficha de personagem
        const character = await Character.findById(characterId);
        if (!character) {
            return res.status(404).json({ message: 'Character not found.' });
        }

        // 2. Verifique se o usuário logado é o dono da ficha
        if (character.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to remove users from this character sheet.' });
        }
        
        // 3. Encontre o usuário a ser removido por email ou username
        const userToRemove = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!userToRemove) {
            return res.status(404).json({ message: 'User to be removed not found.' });
        }

        // 4. Remova o ID do usuário da lista de compartilhados
        const updatedCharacter = await Character.findByIdAndUpdate(
            characterId,
            { $pull: { shared: { userId: userToRemove._id } } }, // Use o _id do usuário encontrado
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'User removed from shared list successfully.',
            character: updatedCharacter
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;