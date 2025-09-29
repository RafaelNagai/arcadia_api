import { Skill } from "./Skill";

export interface Physical {
  value: number;
  skills: {
    fortitude: Skill;
    willpower: Skill;
    athletics: Skill;
    combat: Skill;
    defense: Skill;
    movement: Skill;
  };
}
