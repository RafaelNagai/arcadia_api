const { verifySocketToken } = require('./middlewares/auth');
const Character = require('./models/Character');
const User = require('./models/User');

module.exports = (io) => {
    io.use(verifySocketToken); // Use um middleware para autenticar a conexão

    io.on('connection', (socket) => {
        console.log(`Um usuário se conectou: ${socket.id}`);

        // Evento para o usuário entrar em uma sala de personagem
        socket.on('joinCharacter', async (characterId) => {
            try {
                const userId = socket.userId; // Obtido do middleware
                
                // 1. Encontre a ficha de personagem E verifique a permissão em uma única consulta
                const character = await Character.findOne({
                    _id: characterId,
                    $or: [
                        { owner: userId },
                        { 'shared.userId': userId } // Verifica se o ID está no array de compartilhados
                    ]
                });

                // 2. Se a ficha for encontrada, o usuário tem permissão.
                if (character) {
                    socket.join(characterId);
                    console.log(`Usuário ${userId} entrou na sala da ficha ${characterId}`);
                    // Opcional: emita os dados da ficha para o cliente que acabou de se juntar
                    socket.emit('characterData', character);
                } else {
                    // Se a ficha não for encontrada ou o usuário não tiver permissão
                    socket.emit('error', 'Acesso não autorizado à ficha ou ficha não encontrada.');
                }
            } catch (error) {
                console.error('Erro ao tentar entrar na sala:', error);
                socket.emit('error', 'Erro interno do servidor.');
            }
        });

        // Evento para o usuário atualizar a ficha
        socket.on('updateCharacter', async (data) => {
            try {
                const { characterId, updateData } = data;
                const userId = socket.userId;

                // Lógica de validação:
                // 1. Verifique se o usuário é o dono ou mestre
                // 2. Valide os dados da atualização
                
                // Exemplo simplificado:
                const character = await Character.findById(characterId);
                if (!character || character.owner.toString() !== userId) {
                    return socket.emit('error', 'Acesso não autorizado ou ficha não encontrada.');
                }

                // Atualize a ficha no banco de dados
                const newCharacter = await Character.findByIdAndUpdate(characterId, { $set: updateData }, { new: true });

                // Emita a atualização para todos na sala
                io.to(characterId).emit('characterUpdated', newCharacter);

            } catch (error) {
                console.error('Erro ao atualizar a ficha:', error);
                socket.emit('error', 'Erro interno do servidor.');
            }
        });

        socket.on('disconnect', () => {
            console.log('Um usuário se desconectou.');
        });
    });
};