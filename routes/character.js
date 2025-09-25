// routes/characterRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Character = require('../models/Character');
const Rules = require('../models/Rules'); // Assumindo que o modelo de regras está neste caminho
const User = require('../models/User'); // Assumindo que o modelo de usuário está neste caminho

// Importe suas constantes para usar em validações e cálculos
const { RACES } = require('../models/Race');
const { ORIGINS } = require('../models/Origin');

// Função utilitária para calcular os atributos finais
const calculateAttributes = (baseAttributes, raceBonuses, originBonuses) => {
    const finalAttributes = {};

    for (const attr of Object.keys(baseAttributes)) {
        finalAttributes[attr] = {
            value: baseAttributes[attr].value + (raceBonuses[attr] || 0) + (originBonuses[attr] || 0),
            skills: {}
        };

        finalAttributes[attr].skills = baseAttributes[attr].skills;
    }
    return finalAttributes;
};

// Middleware de autenticação - Exemplo
const authMiddleware = (req, res, next) => {
    // 1. Get the token from the request header
    // The header is typically "Bearer TOKEN"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // Split the header to get the token part
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach the decoded user payload to the request object
        req.user = decoded; // The payload you signed in signin is { id, username }
        next();
    } catch (error) {
        // Handle invalid token (e.g., expired, malformed)
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

// Rota para criar um novo personagem
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, race, origin, profession } = req.body;

        // 1. Validar se a raça e a origem são válidas
        if (!Object.values(RACES).includes(race) || !Object.values(ORIGINS).includes(origin)) {
            return res.status(400).json({ message: 'Raça ou origem inválida.' });
        }

        // 2. Obter a versão atual das regras
        const currentRules = await Rules.findOne({ version: '1.0' }); // Busque a versão mais recente
        if (!currentRules) {
            return res.status(500).json({ message: 'Regras de jogo não encontradas.' });
        }

        const raceBonuses = currentRules.raceBonuses.get(race);
        const originBonuses = currentRules.originBonuses.get(origin);

        // 3. Definir atributos e habilidades base (Exemplo, você pode carregar de outro lugar)
        const baseAttributes = {
            physical: { value: 0, skills: { fortitude: 0, willpower: 0, athletics: 0, combat: 0, defense: 0, movement: 0}},
            dexterity: { value: 0, skills: { stealth: 0, piloting: 0, aim: 0, acrobatics: 0, crime: 0, dodge: 0}},
            intelectuo: { value: 0, skills: { perception: 0, intuition: 0, investigation: 0, survival: 0, arcane: 0, knowledge: 0}},
            influence: { value: 0, skills: { diplomacy: 0, deception: 0, intimidation: 0, persuasion: 0, performance: 0, presence: 0}},
        };

        // 4. Calcular atributos finais com bônus
        const finalAttributes = calculateAttributes(baseAttributes, raceBonuses, originBonuses);
        
        // 5. Criar e salvar o personagem
        const newCharacter = new Character({
            owner: req.user.id,
            version: currentRules.version,
            name,
            race,
            origin,
            profession,
            attributes: finalAttributes,
        });

        await newCharacter.save();

        res.status(201).json({ message: 'Personagem criado com sucesso!', character: newCharacter });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar o personagem.', error: error.message });
    }
});

module.exports = router;