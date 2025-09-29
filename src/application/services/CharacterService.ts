import { CharacterModel } from "../../infrastructure/database/mongoose/CharacterSchema";
import { ROLES, UserModel } from "../../infrastructure/database/mongoose/UserSchema";
import { RulesModel } from "../../infrastructure/database/mongoose/RulesSchema";
import { ARCANE_TYPES } from "../../domain/entities/Arcane";
import { ATTRIBUTES } from "../../domain/entities/attributes/AttributeTypes";
import { Character } from "../../domain/entities/Character";

export class CharacterService {
  static calculateAttributes(
    baseAttributes: Record<string, any>,
    raceBonuses: Record<string, number> = {},
    originBonuses: Record<string, number> = {}
  ) {
    const finalAttributes: Record<string, any> = {};
    for (const attr of Object.keys(baseAttributes)) {
      finalAttributes[attr] = {
        value: baseAttributes[attr].value + (raceBonuses[attr] || 0) + (originBonuses[attr] || 0),
        skills: baseAttributes[attr].skills,
      };
    }
    return finalAttributes;
  }

  static async create(userId: string, character: Character) {
    const { name, race, origin, profession, religion } = character;

    const currentRules = await RulesModel.findOne({ version: "1.0" });
    if (!currentRules) throw new Error("No Bonus found");

    const raceBonuses = currentRules.raceBonuses.get(race) || {};
    const originBonuses = currentRules.originBonuses.get(origin) || {};

    const baseAttributes = {
      [ATTRIBUTES.PHYSICAL]: { value: 0, skills: { fortitude: 0, willpower: 0, athletics: 0, combat: 0, defense: 0, movement: 0 } },
      [ATTRIBUTES.DEXTERITY]: { value: 0, skills: { stealth: 0, piloting: 0, aim: 0, acrobatics: 0, crime: 0, dodge: 0 } },
      [ATTRIBUTES.INTELECTUO]: { value: 0, skills: { perception: 0, intuition: 0, investigation: 0, survival: 0, arcane: 0, knowledge: 0 } },
      [ATTRIBUTES.INFLUENCE]: { value: 0, skills: { diplomacy: 0, deception: 0, intimidation: 0, persuasion: 0, performance: 0, presence: 0 } },
    };

    const finalAttributes = this.calculateAttributes(baseAttributes, raceBonuses, originBonuses);

    const arcaneValues = Object.values(ARCANE_TYPES);
    const affinity = arcaneValues[Math.floor(Math.random() * arcaneValues.length)];
    const antitese = arcaneValues[Math.floor(Math.random() * arcaneValues.length)];

    const newCharacter = new CharacterModel({
      owner: userId,
      version: currentRules.version,
      name,
      race,
      origin,
      profession,
      religion,
      arcane: { affinity, antitese },
      attributes: finalAttributes,
    });

    await newCharacter.save();
    return newCharacter;
  }

  static async shareToUser(characterId: string, ownerId: string, identifier: string, role: ROLES) {
    const character = await CharacterModel.findById(characterId);
    if (!character) throw new Error("Character not found");

    if (character.owner.toString() !== ownerId) throw new Error("Permission denied");

    const userToAdd = await UserModel.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!userToAdd) throw new Error("User not found");

    return CharacterModel.findByIdAndUpdate(
      characterId,
      { $addToSet: { shared: { userId: userToAdd._id, role } } },
      { new: true, runValidators: true }
    );
  }

  static async unshareToUser(characterId: string, ownerId: string, identifier: string) {
    const character = await CharacterModel.findById(characterId);
    if (!character) throw new Error("Character not found");

    if (character.owner.toString() !== ownerId) throw new Error("Permission denied");

    const userToRemove = await UserModel.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!userToRemove) throw new Error("User not found");

    return CharacterModel.findByIdAndUpdate(
      characterId,
      { $pull: { shared: { userId: userToRemove._id } } },
      { new: true, runValidators: true }
    );
  }

  static async getCharacterForUser(characterId: string, userId: string) {
    return CharacterModel.findOne({
      _id: characterId,
      $or: [{ owner: userId }, { "shared.userId": userId }],
    });
  }

  static async updateCharacter(characterId: string, userId: string, updateData: any) {
    const character = await CharacterModel.findById(characterId);
    if (!character || character.owner.toString() !== userId) {
      throw new Error("Unauthorized or character not found.");
    }
    return CharacterModel.findByIdAndUpdate(characterId, { $set: updateData }, { new: true });
  }
}
