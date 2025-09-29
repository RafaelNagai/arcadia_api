import mongoose, { Schema, Document } from "mongoose";
import { ATTRIBUTES } from "../../../domain/entities/attributes/AttributeTypes";

export interface IRulesDocument extends Document {
  version: string;
  raceBonuses: Map<string, {
    [ATTRIBUTES.PHYSICAL]?: number;
    [ATTRIBUTES.DEXTERITY]?: number;
    [ATTRIBUTES.INTELECTUO]?: number;
    [ATTRIBUTES.INFLUENCE]?: number;
    [ATTRIBUTES.HP_MAX]?: number;
    [ATTRIBUTES.SANITY_MAX]?: number;
  }>;
  originBonuses: Map<string, {
    [ATTRIBUTES.PHYSICAL]?: number;
    [ATTRIBUTES.DEXTERITY]?: number;
    [ATTRIBUTES.INTELECTUO]?: number;
    [ATTRIBUTES.INFLUENCE]?: number;
    [ATTRIBUTES.HP_MAX]?: number;
    [ATTRIBUTES.SANITY_MAX]?: number;
  }>;
}

const AttributeBonusSchema = {
  [ATTRIBUTES.PHYSICAL]: Number,
  [ATTRIBUTES.DEXTERITY]: Number,
  [ATTRIBUTES.INTELECTUO]: Number,
  [ATTRIBUTES.INFLUENCE]: Number,
  [ATTRIBUTES.HP_MAX]: Number,
  [ATTRIBUTES.SANITY_MAX]: Number,
};

const RulesSchema: Schema<IRulesDocument> = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  raceBonuses: {
    type: Map,
    of: AttributeBonusSchema,
  },
  originBonuses: {
    type: Map,
    of: AttributeBonusSchema,
  },
});

export const RulesModel = mongoose.model<IRulesDocument>("Rules", RulesSchema);
