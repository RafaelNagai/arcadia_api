import { Request, Response } from "express";
import { AuthRequest } from "../../infrastructure/middlewares/AuthMiddleware";
import { CharacterService } from "../../application/services/CharacterService";

export class CharacterController {
  static async createCharacter(req: AuthRequest, res: Response) {
    try {
      if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });
      const character = await CharacterService.create(req.userArcadia.id, req.body);
      res.status(201).json({ message: "Success created character", character });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ code: 1100, message: error.message });
    }
  }

  static async shareCharacter(req: AuthRequest, res: Response) {
    try {
      if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });
      const { characterId } = req.params;
      const { identifier, role } = req.body;
      const updatedCharacter = await CharacterService.shareToUser(characterId, req.userArcadia.id, identifier, role);
      res.status(200).json({ message: "User added to shared list successfully.", character: updatedCharacter });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  }

  static async unshareCharacter(req: AuthRequest, res: Response) {
    try {
      if (!req.userArcadia) return res.status(401).json({ message: "Unauthorized" });
      const { characterId } = req.params;
      const { identifier } = req.body;
      const updatedCharacter = await CharacterService.unshareToUser(characterId, req.userArcadia.id, identifier);
      res.status(200).json({ message: "User removed from shared list successfully.", character: updatedCharacter });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  }
}
