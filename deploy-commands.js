require('dotenv').config();

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const commands = [

  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Enviar panel tickets'),

  new SlashCommandBuilder()
    .setName('abrirticket')
    .setDescription('Abrir un ticket a otro usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario al que abrir el ticket')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('categoria')
        .setDescription('Categoría del ticket')
        .setRequired(true)
        .addChoices(
          { name: 'Ficha Personaje', value: 'character' },
          { name: 'Bugs / Soporte', value: 'support' },
          { name: 'Devoluciones', value: 'refund' },
          { name: 'CK', value: 'ck' },
          { name: 'Administración', value: 'admin' },
          { name: 'SAPD', value: 'sapd' },
          { name: 'Bandas', value: 'gangs' },
          { name: 'Comercios', value: 'shops' },
          { name: 'Creadores', value: 'creator' },
          { name: 'PlayMaker', value: 'playmaker' },
          { name: 'VIP', value: 'vip' }
        )
    ),

  new SlashCommandBuilder()
    .setName('addusuario')
    .setDescription('Añadir un usuario a este ticket')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario a añadir')
        .setRequired(true)
    )

].map(command => command.toJSON());

const rest = new REST({ version: '10' })
  .setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registrando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Commands ready');
  } catch (error) {
    console.error(error);
  }
})();