import { Server, Socket } from "socket.io";
import { CharacterService } from "../../application/services/CharacterService";

export class CharacterSocketController {
  static async joinCharacter(socket: Socket & { userId?: string }, characterId: string) {
    try {
      const userId = socket.userId!;
      const character = await CharacterService.getCharacterForUser(characterId, userId);

      if (!character) return socket.emit("error", "Unauthorized or character not found.");

      socket.join(characterId);
      socket.emit("characterData", character);
    } catch (err: any) {
      console.error(err);
      socket.emit("error", "Internal server error.");
    }
  }

  static async updateCharacter(
    io: Server,
    socket: Socket & { userId?: string },
    data: { characterId: string; updateData: any }
  ) {
    try {
      const userId = socket.userId!;
      const { characterId, updateData } = data;

      const updatedCharacter = await CharacterService.updateCharacter(characterId, userId, updateData);

      io.to(characterId).emit("characterUpdated", updatedCharacter);
    } catch (err: any) {
      console.error(err);
      socket.emit("error", "Internal server error.");
    }
  }
}
