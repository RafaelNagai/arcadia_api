import { Schema } from "mongoose";
import { SkillSchema } from "./SkillSchema";

export const IntelectuoSchema = new Schema(
  {
    value: { type: Number, default: 0, min: 0 },
    skills: {
      perception: SkillSchema,
      intuition: SkillSchema,
      investigation: SkillSchema,
      survival: SkillSchema,
      arcane: SkillSchema,
      knowledge: SkillSchema,
    },
  },
  { _id: false }
);
