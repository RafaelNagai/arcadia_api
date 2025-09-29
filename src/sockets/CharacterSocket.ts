import { Server, Socket } from "socket.io";
import { verifySocketToken } from "../infrastructure/middlewares/AuthMiddleware";
import { CharacterSocketController } from "../interfaces/controllers/CharacterSocketController";

export default (io: Server) => {
  io.use(verifySocketToken);

  io.on("connection", (socket: Socket & { userId?: string }) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinCharacter", (characterId: string) =>
      CharacterSocketController.joinCharacter(socket, characterId)
    );

    socket.on("updateCharacter", (data) =>
      CharacterSocketController.updateCharacter(io, socket, data)
    );

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
  });
};
