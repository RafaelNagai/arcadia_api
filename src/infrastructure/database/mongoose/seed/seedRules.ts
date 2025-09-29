import 'dotenv/config';
import mongoose from 'mongoose';
import { ATTRIBUTES } from '../../../../domain/entities/attributes/AttributeTypes';
import { ORIGINS } from '../../../../domain/entities/Origins';
import { RACES } from '../../../../domain/entities/Race';
import { RulesModel } from '../RulesSchema';

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
    [ORIGINS.BRITANNIA]: {
      [ATTRIBUTES.PHYSICAL]: 0,
      [ATTRIBUTES.DEXTERITY]: 1,
      [ATTRIBUTES.INTELECTUO]: 0,
      [ATTRIBUTES.INFLUENCE]: 0,
      [ATTRIBUTES.HP_MAX]: 20,
      [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGINS.CAMELOT]: {
      [ATTRIBUTES.PHYSICAL]: 0,
      [ATTRIBUTES.DEXTERITY]: 0,
      [ATTRIBUTES.INTELECTUO]: 0,
      [ATTRIBUTES.INFLUENCE]: 1,
      [ATTRIBUTES.HP_MAX]: 20,
      [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGINS.GALAHAD]: {
      [ATTRIBUTES.PHYSICAL]: 0,
      [ATTRIBUTES.DEXTERITY]: 0,
      [ATTRIBUTES.INTELECTUO]: 1,
      [ATTRIBUTES.INFLUENCE]: 0,
      [ATTRIBUTES.HP_MAX]: 20,
      [ATTRIBUTES.SANITY_MAX]: 20
    },
    [ORIGINS.NORTH_GALAHAD]: {
      [ATTRIBUTES.PHYSICAL]: 0,
      [ATTRIBUTES.DEXTERITY]: 1,
      [ATTRIBUTES.INTELECTUO]: 0,
      [ATTRIBUTES.INFLUENCE]: 0,
      [ATTRIBUTES.HP_MAX]: 30,
      [ATTRIBUTES.SANITY_MAX]: 10
    },
    [ORIGINS.RUBRA]: {
      [ATTRIBUTES.PHYSICAL]: 1,
      [ATTRIBUTES.DEXTERITY]: 0,
      [ATTRIBUTES.INTELECTUO]: 0,
      [ATTRIBUTES.INFLUENCE]: 0,
      [ATTRIBUTES.HP_MAX]: 30,
      [ATTRIBUTES.SANITY_MAX]: 10
    },
    [ORIGINS.UNION]: {
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
    const MONGO_URI = process.env.MONGO_URI!;
    await mongoose.connect(MONGO_URI, { 
      serverSelectionTimeoutMS: 5000
    });
    console.log('Conectado ao MongoDB!');

    await RulesModel.deleteMany({});
    console.log('Coleção de regras limpa.');

    const newRules = new RulesModel(initialRules);
    await newRules.save();
    console.log('Regras iniciais salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB.');
  }
};

runSeed();
