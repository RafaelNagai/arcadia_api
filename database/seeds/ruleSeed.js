// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Rules = require('../../models/Rules'); // Importe o seu modelo de regras
const { ATTRIBUTES } = require('../../models/Attribute');
const { RACES } = require('../../models/Race');
const { ORIGIN } = require('../../models/Origin');

const initialRules = {
  version: '1.0',
  raceBonuses: {
    [RACES.AVARO]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 2,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 0
    },
    [RACES.DWARF]: {
        [ATTRIBUTES.PHYSICAL]: 2,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 40,
        [ATTRIBUTES.SANITY_MAX]: -20
    },
    [RACES.HUMAN]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 2,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 0
    },
    [RACES.ELF]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 2,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 0
    },
    [RACES.NOCTUNE_ELF]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 2,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 0
    },
    [RACES.ORC]: {
        [ATTRIBUTES.PHYSICAL]: 2,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 30,
        [ATTRIBUTES.SANITY_MAX]: -10
    },
  },
  originBonuses: {
    [ORIGIN.BRITANNIA]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 1,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGIN.CAMELOT]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 1,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGIN.GALAHAD]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 1,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 20,
        [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGIN.NORTH_GALAHAD]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 1,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 30,
        [ATTRIBUTES.SANITY_MAX]: 10
    },
    [ORIGIN.RUBRA]: {
        [ATTRIBUTES.PHYSICAL]: 1,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 0,
        [ATTRIBUTES.HP_MAX]: 30,
        [ATTRIBUTES.SANITY_MAX]: 10
    },
    [ORIGIN.UNION]: {
        [ATTRIBUTES.PHYSICAL]: 0,
        [ATTRIBUTES.DEXTERITY]: 0,
        [ATTRIBUTES.INTELECTUO]: 0,
        [ATTRIBUTES.INFLUENCE]: 1,
        [ATTRIBUTES.HP_MAX]: 10,
        [ATTRIBUTES.SANITY_MAX]: 30
    },
  }
};

const runSeed = async () => {
  try {
    // 1. Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB!');

    // 2. Apagar todas as regras existentes para evitar duplicatas (opcional)
    await Rules.deleteMany({});
    console.log('Coleção de regras limpa.');

    // 3. Criar e salvar as regras iniciais
    const newRules = new Rules(initialRules);
    await newRules.save();
    console.log('Regras iniciais salvas com sucesso!');

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    // 4. Desconectar do banco de dados
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
};

runSeed();