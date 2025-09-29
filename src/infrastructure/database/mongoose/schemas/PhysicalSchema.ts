import { Schema } from "mongoose";
import { SkillSchema } from "./SkillSchema";

export const PhysicalSchema = new Schema(
  {
    value: { type: Number, default: 0, min: 0 },
    skills: {
      fortitude: SkillSchema,
      willpower: SkillSchema,
      athletics: SkillSchema,
      combat: SkillSchema,
      defense: SkillSchema,
      movement: SkillSchema,
    },
  },
  { _id: false }
);
