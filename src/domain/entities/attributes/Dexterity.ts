import { Skill } from "./Skill";

export interface Dexterity {
  value: number;
  skills: {
    stealth: Skill;
    piloting: Skill;
    aim: Skill;
    acrobatics: Skill;
    crime: Skill;
    dodge: Skill;
  };
}
