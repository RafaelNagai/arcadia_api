import { Router } from "express";
import { authMiddleware } from "../middlewares/AuthMiddleware";
import { CharacterController } from "../../interfaces/controllers/CharacterController";

const router = Router();

router.post("/", authMiddleware, CharacterController.createCharacter);
router.put("/:characterId/share", authMiddleware, CharacterController.shareCharacter);
router.put("/:characterId/unshare", authMiddleware, CharacterController.unshareCharacter);

export default router;
