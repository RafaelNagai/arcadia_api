const mongoose = require('mongoose');
const { SkillSchema } = require('./Skill');

const ATTRIBUTES = {
  PHYSICAL: 'Physical',
  DEXTERITY: 'Dexterity',
  INTELECTUO: 'Intelectuo',
  INFLUENCE: 'Influence',
  HP_MAX: 'HP Max',
  SANITY_MAX: 'Sanidade Max'
};

const PhysicalSchema = new mongoose.Schema({
    value: {
        type: Number,
        default: 0,
        min: 0
    },
    skills: {
        fortitude: SkillSchema,
        willpower: SkillSchema,
        athletics: SkillSchema,
        combat: SkillSchema,
        defense: SkillSchema,
        movement: SkillSchema,
    }
}, { _id: false });

const DexteritySchema = new mongoose.Schema({
    value: {
        type: Number,
        default: 0,
        min: 0
    },
    skills: {
        stealth: SkillSchema,
        piloting: SkillSchema,
        aim: SkillSchema,
        acrobatics: SkillSchema,
        crime: SkillSchema,
        dodge: SkillSchema,
    }
}, { _id: false });

const IntelectuoSchema = new mongoose.Schema({
    value: {
        type: Number,
        default: 0,
        min: 0
    },
    skills: {
        perception: SkillSchema,
        intuition: SkillSchema,
        investigation: SkillSchema,
        survival: SkillSchema,
        arcane: SkillSchema,
        knowledge: SkillSchema,
    }
}, { _id: false });

const InfluenceSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true,
        min: 0
    },
    skills: {
        diplomacy: SkillSchema,
        deception: SkillSchema,
        intimidation: SkillSchema,
        persuasion: SkillSchema,
        performance: SkillSchema,
        presence: SkillSchema,
    }
}, { _id: false });

module.exports = {
  ATTRIBUTES,
  PhysicalSchema,
  DexteritySchema,
  IntelectuoSchema,
  InfluenceSchema,
};