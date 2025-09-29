import { Schema } from "mongoose";
import { SkillSchema } from "./SkillSchema";

export const DexteritySchema = new Schema(
  {
    value: { type: Number, default: 0, min: 0 },
    skills: {
      stealth: SkillSchema,
      piloting: SkillSchema,
      aim: SkillSchema,
      acrobatics: SkillSchema,
      crime: SkillSchema,
      dodge: SkillSchema,
    },
  },
  { _id: false }
);
