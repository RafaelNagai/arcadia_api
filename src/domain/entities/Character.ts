import { RACES } from "./Race";
import { RELIGIONS } from "./Religion";
import { ARCANE_TYPES } from "./Arcane";
import { SharedUser } from "./SharedUser";
import { ATTRIBUTES } from "./attributes/AttributeTypes";
import { ORIGINS } from "./Origins";
import { Physical } from "./attributes/Physical";
import { Dexterity } from "./attributes/Dexterity";
import { Influence } from "./attributes/Influence";
import { Intelectuo } from "./attributes/Intelectuo";

export interface Arcane {
  affinity: ARCANE_TYPES;
  antitese: ARCANE_TYPES;
  exposition: number;
}

export interface Character {
  owner: string;           // ID do User
  shared: SharedUser[];
  version: string;
  name: string;
  race: RACES;
  origin: ORIGINS;
  religion: RELIGIONS;
  arcane: Arcane;
  profession: string;
  effortPoints: number;
  attributes: {
    [ATTRIBUTES.PHYSICAL]: Physical;
    [ATTRIBUTES.DEXTERITY]: Dexterity;
    [ATTRIBUTES.INTELECTUO]: Intelectuo;
    [ATTRIBUTES.INFLUENCE]: Influence;
  };
}
