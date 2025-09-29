import { Schema } from "mongoose";
import { SkillSchema } from "./SkillSchema";

export const InfluenceSchema = new Schema(
  {
    value: { type: Number, required: true, min: 0 },
    skills: {
      diplomacy: SkillSchema,
      deception: SkillSchema,
      intimidation: SkillSchema,
      persuasion: SkillSchema,
      performance: SkillSchema,
      presence: SkillSchema,
    },
  },
  { _id: false }
);
