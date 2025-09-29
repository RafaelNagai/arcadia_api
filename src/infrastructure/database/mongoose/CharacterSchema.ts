import mongoose, { Schema, Document, Types } from "mongoose";
import { RACES } from "../../../domain/entities/Race";
import { RELIGIONS } from "../../../domain/entities/Religion";
import { ARCANE_TYPES } from "../../../domain/entities/Arcane";
import { ATTRIBUTES } from "../../../domain/entities/attributes/AttributeTypes";
import { ORIGINS } from "../../../domain/entities/Origins";
import { DexteritySchema } from "./schemas/DexteritySchema";
import { InfluenceSchema } from "./schemas/InfluenceSchema";
import { IntelectuoSchema } from "./schemas/IntelectuoSchema";
import { PhysicalSchema } from "./schemas/PhysicalSchema";
import { ISharedUser, SharedUserSchema } from "./SharedUserSchema";


export interface ICharacterDocument extends Document {
  owner: Types.ObjectId;
  shared: ISharedUser[];
  version: string;
  name: string;
  race: RACES;
  origin: ORIGINS;
  religion: RELIGIONS;
  arcane: {
    affinity: ARCANE_TYPES;
    antitese: ARCANE_TYPES;
    exposition: number;
  };
  profession: string;
  effortPoints: number;
  attributes: {
    [ATTRIBUTES.PHYSICAL]: typeof PhysicalSchema;
    [ATTRIBUTES.DEXTERITY]: typeof DexteritySchema;
    [ATTRIBUTES.INTELECTUO]: typeof IntelectuoSchema;
    [ATTRIBUTES.INFLUENCE]: typeof InfluenceSchema;
  };
}

const CharacterSchema = new Schema<ICharacterDocument>({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shared: [SharedUserSchema],
  version: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  race: { type: String, enum: Object.values(RACES), required: true },
  origin: { type: String, enum: Object.values(ORIGINS), required: true },
  religion: { type: String, enum: Object.values(RELIGIONS), required: true },
  arcane: {
    affinity: { type: String, enum: Object.values(ARCANE_TYPES), required: true },
    antitese: { type: String, enum: Object.values(ARCANE_TYPES), required: true },
    exposition: { type: Number, default: 0, min: 0 },
  },
  profession: { type: String, required: true, trim: true },
  effortPoints: { type: Number, default: 0, min: 0 },
  attributes: {
    [ATTRIBUTES.PHYSICAL]: PhysicalSchema,
    [ATTRIBUTES.DEXTERITY]: DexteritySchema,
    [ATTRIBUTES.INTELECTUO]: IntelectuoSchema,
    [ATTRIBUTES.INFLUENCE]: InfluenceSchema,
  },
});

export const CharacterModel = mongoose.model<ICharacterDocument>("Character", CharacterSchema);
