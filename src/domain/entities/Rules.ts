import { ATTRIBUTES } from "./attributes/AttributeTypes";

export interface AttributeBonus {
  [ATTRIBUTES.PHYSICAL]?: number;
  [ATTRIBUTES.DEXTERITY]?: number;
  [ATTRIBUTES.INTELECTUO]?: number;
  [ATTRIBUTES.INFLUENCE]?: number;
  [ATTRIBUTES.HP_MAX]?: number;
  [ATTRIBUTES.SANITY_MAX]?: number;
}

export interface Rules {
  version: string;
  raceBonuses: Map<string, AttributeBonus>;   // chave: nome da raça
  originBonuses: Map<string, AttributeBonus>; // chave: nome da origem
}
