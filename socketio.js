const { verifySocketToken } = require('./middlewares/auth');
const Character = require('./models/Character');

module.exports = (io) => {
    io.use(verifySocketToken); // Use um middleware para autenticar a conexão

    io.on('connection', (socket) => {
        console.log(`Um usuário se conectou: ${socket.id}`);

        // Evento para o usuário entrar em uma sala de personagem
        socket.on('joinCharacter', (characterId) => {
            // Garanta que o usuário tem permissão para entrar na sala
            const userId = socket.userId; // Obtido do middleware
            // const isAuthorized = ... (Lógica para verificar se o userId é dono ou mestre)

            // if (isAuthorized) {
                socket.join(characterId);
                console.log(`Usuário ${userId} entrou na sala da ficha ${characterId}`);
            // } else {
            //     socket.emit('error', 'Acesso não autorizado à ficha.');
            // }
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