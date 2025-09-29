import { Server, Socket } from 'socket.io';
import { CharacterModel } from '../infrastructure/database/mongoose/CharacterSchema';
import { verifySocketToken } from '../infrastructure/middlewares/AuthMiddleware';

export default (io: Server) => {
    io.use(verifySocketToken);

    io.on('connection', (socket: Socket & { userId?: string }) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('joinCharacter', async (characterId: string) => {
            try {
                const userId = socket.userId!;
                const character = await CharacterModel.findOne({
                    _id: characterId,
                    $or: [{ owner: userId }, { 'shared.userId': userId }],
                });
                console.log(character);

                if (!character) return socket.emit('error', 'Unauthorized or character not found.');

                socket.join(characterId);
                socket.emit('characterData', character);
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Internal server error.');
            }
        });

        socket.on('updateCharacter', async (data: any) => {
            try {
                const { characterId, updateData } = data;
                const userId = socket.userId!;

                const character = await CharacterModel.findById(characterId);
                if (!character || character.owner.toString() !== userId)
                    return socket.emit('error', 'Unauthorized or character not found.');

                const updatedCharacter = await CharacterModel.findByIdAndUpdate(characterId, { $set: updateData }, { new: true });
                io.to(characterId).emit('characterUpdated', updatedCharacter);
            } catch (err) {
                console.error(err);
                socket.emit('error', 'Internal server error.');
            }
        });

        socket.on('disconnect', () => console.log('User disconnected.'));
    });
};
