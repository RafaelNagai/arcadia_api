import { Router, Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/AuthMiddleware";
import { CharacterModel } from "../database/mongoose/CharacterSchema";
import { ARCANE_TYPES } from "../../domain/entities/Arcane";
import { ATTRIBUTES } from "../../domain/entities/attributes/AttributeTypes";
import { ORIGINS } from "../../domain/entities/Origins";
import { RACES } from "../../domain/entities/Race";
import { RELIGIONS } from "../../domain/entities/Religion";
import { ROLES, User } from "../database/mongoose/User";
import { RulesModel } from "../database/mongoose/RulesSchema";

const router = Router();

// Função utilitária para calcular atributos finais
const calculateAttributes = (
  baseAttributes: Record<string, any>,
  raceBonuses: Record<string, number> = {},
  originBonuses: Record<string, number> = {}
) => {
  const finalAttributes: Record<string, any> = {};
  for (const attr of Object.keys(baseAttributes)) {
    finalAttributes[attr] = {
      value: baseAttributes[attr].value + (raceBonuses[attr] || 0) + (originBonuses[attr] || 0),
      skills: baseAttributes[attr].skills,
    };
  }
  return finalAttributes;
};

// ======================
// CREATE CHARACTER
// ======================
router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, race, origin, profession, religion } = req.body;

    if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });

    // 1. Validações
    if (!Object.values(RACES).includes(race)) return res.status(400).json({ code: 1101, message: "Invalid Race." });
    if (!Object.values(ORIGINS).includes(origin)) return res.status(400).json({ code: 1102, message: "Invalid Origin." });
    if (!Object.values(RELIGIONS).includes(religion)) return res.status(400).json({ code: 1103, message: "Invalid Religion." });

    // 2. Buscar regras atuais
    const currentRules = await RulesModel.findOne({ version: "1.0" });
    if (!currentRules) return res.status(500).json({ code: 1104, message: "No Bonus found" });

    const raceBonuses = currentRules.raceBonuses.get(race) || {};
    const originBonuses = currentRules.originBonuses.get(origin) || {};

    // 3. Atributos base
    const baseAttributes = {
      [ATTRIBUTES.PHYSICAL]: { value: 0, skills: { fortitude: 0, willpower: 0, athletics: 0, combat: 0, defense: 0, movement: 0 } },
      [ATTRIBUTES.DEXTERITY]: { value: 0, skills: { stealth: 0, piloting: 0, aim: 0, acrobatics: 0, crime: 0, dodge: 0 } },
      [ATTRIBUTES.INTELECTUO]: { value: 0, skills: { perception: 0, intuition: 0, investigation: 0, survival: 0, arcane: 0, knowledge: 0 } },
      [ATTRIBUTES.INFLUENCE]: { value: 0, skills: { diplomacy: 0, deception: 0, intimidation: 0, persuasion: 0, performance: 0, presence: 0 } },
    };

    // 4. Calcular atributos finais
    const finalAttributes = calculateAttributes(baseAttributes, raceBonuses, originBonuses);

    // 5. Afinidade e antítese arcana aleatória
    const arcaneValues = Object.values(ARCANE_TYPES);
    const affinity = arcaneValues[Math.floor(Math.random() * arcaneValues.length)];
    const antitese = arcaneValues[Math.floor(Math.random() * arcaneValues.length)];

    // 6. Criar personagem
    const newCharacter = new CharacterModel({
      owner: req.userArcadia?.id,
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

    res.status(201).json({ message: "Success created character", character: newCharacter });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ code: 1100, message: "Failed create character", error: error.message });
  }
});

// ======================
// SHARE CHARACTER
// ======================
router.put("/:characterId/share", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { identifier, role } = req.body;
    const { characterId } = req.params;

    if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });

    if (!Object.values(ROLES).includes(role)) return res.status(404).json({ message: "Role not found." });

    const character = await CharacterModel.findById(characterId);
    if (!character) return res.status(404).json({ message: "Character not found." });

    if (character.owner.toString() !== req.userArcadia?.id) return res.status(403).json({ message: "You do not have permission to share this character sheet." });

    const userToAdd = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!userToAdd) return res.status(404).json({ message: "User to be shared with not found." });

    const updatedCharacter = await CharacterModel.findByIdAndUpdate(
      characterId,
      { $addToSet: { shared: { userId: userToAdd._id, role } } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "User added to shared list successfully.", character: updatedCharacter });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// ======================
// UNSHARE CHARACTER
// ======================
router.put("/:characterId/unshare", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { identifier } = req.body;
    const { characterId } = req.params;

    if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });

    const character = await CharacterModel.findById(characterId);
    if (!character) return res.status(404).json({ message: "Character not found." });

    if (character.owner.toString() !== req.userArcadia?.id) return res.status(403).json({ message: "You do not have permission to remove users from this character sheet." });

    const userToRemove = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!userToRemove) return res.status(404).json({ message: "User to be removed not found." });

    const updatedCharacter = await CharacterModel.findByIdAndUpdate(
      characterId,
      { $pull: { shared: { userId: userToRemove._id } } },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "User removed from shared list successfully.", character: updatedCharacter });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;
