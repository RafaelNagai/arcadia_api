import { Skill } from "./Skill";

export interface Influence {
  value: number;
  skills: {
    diplomacy: Skill;
    deception: Skill;
    intimidation: Skill;
    persuasion: Skill;
    performance: Skill;
    presence: Skill;
  };
}
