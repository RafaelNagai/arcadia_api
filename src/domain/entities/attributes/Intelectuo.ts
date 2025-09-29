import { Skill } from "./Skill";

export interface Intelectuo {
  value: number;
  skills: {
    perception: Skill;
    intuition: Skill;
    investigation: Skill;
    survival: Skill;
    arcane: Skill;
    knowledge: Skill;
  };
}
