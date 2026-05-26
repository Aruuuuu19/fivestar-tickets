require('dotenv').config();

const db = require('./database');
const path = require('path');
const discordTranscripts = require('discord-html-transcripts');

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
});

const ROLES = {
  OWNER: '1500271736480989317',
  GAME_MASTER: '1500271740289552524',
  MODERACION: '1500271754847715439',

  ENTREVISTADOR: '1500271760166359131',
  ENCARGADO_ENTREVISTADOR: '1500271789694124214',

  SOPORTE: '1500271759340077166',
  ENCARGADO_SOPORTE: '1500271755732844544',

  SAPD: '1500271765128220763',
  ENCARGADO_SAPD: '1500271764431962142',

  SAED: '1500279787317362828',
  ENCARGADO_SAED: '1500271768114302976',

  SOPORTE_ILEGALES: '1500271767179100241',
  MODERADOR_ILEGALES: '1500271766021607596',

  SOPORTE_COMERCIOS: '1500271770148540556',
  ENCARGADO_COMERCIOS: '1500271769276387529',

  ENCARGADO_CC: '1500271757528141854',

  ENCARGADO_PLAYMAKER: '1500271758417203291',

  PLAYMAKER: '1500271774271803393'
};

const STAFF_COMMAND_ROLES = [
  ROLES.MODERACION,
  ROLES.GAME_MASTER,
  ROLES.OWNER
];

function hasStaffCommandPerms(member) {
  return STAFF_COMMAND_ROLES.some(roleId =>
    member.roles.cache.has(roleId)
  );
}

function getTicketConfig(category, ticketUser) {
  if (category === 'character') {
    return {
      categoryId: process.env.CHARACTER_CATEGORY_ID,
      ticketName: 'ficha-personaje',
      ticketTitle: 'Ficha Personaje',
      mentionRoleIds: [
        ROLES.ENTREVISTADOR,
        ROLES.ENCARGADO_ENTREVISTADOR
      ],
      allowedRoleIds: [
        ROLES.ENTREVISTADOR,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Para realizar la ficha de personaje deberás descargarte el PDF adjuntado, rellenarla leyendo y siguiendo todas las pautas.

Una vez realizada la ficha y guardada con los cambios, deberás adjuntarla y un <@&${ROLES.ENTREVISTADOR}> la revisará.

Mantente a la espera hasta que un compañero pueda darte un resultado.
`
    };
  }

  if (category === 'support') {
    return {
      categoryId: process.env.SUPPORT_CATEGORY_ID,
      ticketName: 'bugs-soporte',
      ticketTitle: 'Bugs / Soporte',
      mentionRoleIds: [
        ROLES.SOPORTE,
        ROLES.ENCARGADO_SOPORTE
      ],
      allowedRoleIds: [
        ROLES.SOPORTE,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SOPORTE}> te atenderá pronto.

Para agilizar el proceso, explícanos en qué podemos ayudarte, adjuntando todo tipo de pruebas gráficas y descripción del error o problema.

Mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'refund') {
    return {
      categoryId: process.env.REFUND_CATEGORY_ID,
      ticketName: 'devolución',
      ticketTitle: 'Devolución',
      mentionRoleIds: [
        ROLES.SOPORTE,
        ROLES.MODERACION
      ],
      allowedRoleIds: [
        ROLES.SOPORTE,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SOPORTE}> te atenderá pronto.

Explícanos qué ha ocurrido, qué ítems necesitas que se te devuelvan y adjunta todo tipo de pruebas gráficas para poder ayudarte.

Mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'ck') {
    return {
      categoryId: process.env.CK_CATEGORY_ID,
      ticketName: 'ck',
      ticketTitle: 'CK',
      mentionRoleIds: [
        ROLES.SOPORTE,
        ROLES.MODERACION
      ],
      allowedRoleIds: [
        ROLES.SOPORTE,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SOPORTE}> te atenderá pronto.

Rellena la plantilla adjuntada a continuación para seguir con el proceso de CK.

Una vez realizado el mismo, deberás abrir un ticket de ficha de personaje, adjuntando la nueva.

Mantente a la espera hasta que un compañero pueda atenderte.

**Nombre (IC):**
**CID:**
**Motivo del CK (IC):**
**Motivo del CK (OOC):**
**URL Steam:**
**Foto de la cuenta bancaria:**
`
    };
  }

  if (category === 'admin') {
    return {
      categoryId: process.env.ADMIN_CATEGORY_ID,
      ticketName: 'administración',
      ticketTitle: 'Administración',
      mentionRoleIds: [
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      allowedRoleIds: [
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.OWNER}> <@&${ROLES.GAME_MASTER}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'sapd') {
    return {
      categoryId: process.env.SAPD_CATEGORY_ID,
      ticketName: 'sapd',
      ticketTitle: 'SAPD',
      mentionRoleIds: [
        ROLES.SAPD,
        ROLES.ENCARGADO_SAPD
      ],
      allowedRoleIds: [
        ROLES.SAPD,
        ROLES.ENCARGADO_SAPD,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SAPD}> o <@&${ROLES.ENCARGADO_SAPD}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };

    }

  if (category === 'saed') {
    return {
      categoryId: process.env.SAED_CATEGORY_ID,
      ticketName: 'saed',
      ticketTitle: 'SAED',
      mentionRoleIds: [
        ROLES.SAED,
        ROLES.ENCARGADO_SAED
      ],
      allowedRoleIds: [
        ROLES.SAED,
        ROLES.ENCARGADO_SAED,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SAED}> o <@&${ROLES.ENCARGADO_SAED}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'gangs') {
    return {
      categoryId: process.env.GANGS_CATEGORY_ID,
      ticketName: 'bandas',
      ticketTitle: 'Bandas',
      mentionRoleIds: [
        ROLES.SOPORTE_ILEGALES,
        ROLES.MODERADOR_ILEGALES
      ],
      allowedRoleIds: [
        ROLES.SOPORTE_ILEGALES,
        ROLES.MODERADOR_ILEGALES,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SOPORTE_ILEGALES}> o <@&${ROLES.MODERADOR_ILEGALES}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'shops') {
    return {
      categoryId: process.env.SHOPS_CATEGORY_ID,
      ticketName: 'comercios',
      ticketTitle: 'Comercios',
      mentionRoleIds: [
        ROLES.SOPORTE_COMERCIOS,
        ROLES.ENCARGADO_COMERCIOS
      ],
      allowedRoleIds: [
        ROLES.SOPORTE_COMERCIOS,
        ROLES.ENCARGADO_COMERCIOS,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.SOPORTE_COMERCIOS}> o <@&${ROLES.ENCARGADO_COMERCIOS}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'creator') {
    return {
      categoryId: process.env.CREATOR_CATEGORY_ID,
      ticketName: 'creadores de Contenido',
      ticketTitle: 'Creadores de Contenido',
      mentionRoleIds: [
        ROLES.ENCARGADO_CC
      ],
      allowedRoleIds: [
        ROLES.ENCARGADO_CC,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.ENCARGADO_CC}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'playmaker') {
    return {
      categoryId: process.env.PLAYMAKER_CATEGORY_ID,
      ticketName: 'playmaker',
      ticketTitle: 'PlayMaker',
      mentionRoleIds: [
        ROLES.ENCARGADO_PLAYMAKER
      ],
      allowedRoleIds: [
        ROLES.ENCARGADO_PLAYMAKER,
        ROLES.PLAYMAKER,
        ROLES.MODERACION,
        ROLES.OWNER,
        ROLES.GAME_MASTER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.ENCARGADO_PLAYMAKER}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

  if (category === 'vip') {
    return {
      categoryId: process.env.VIP_CATEGORY_ID,
      ticketName: 'vip',
      ticketTitle: 'VIP',
      mentionRoleIds: [
        ROLES.GAME_MASTER,
        ROLES.OWNER
      ],
      allowedRoleIds: [
        ROLES.GAME_MASTER,
        ROLES.OWNER
      ],
      welcomeMessage: `
¡Hola ${ticketUser}!

Un <@&${ROLES.GAME_MASTER}> o <@&${ROLES.OWNER}> te atenderá pronto.

Cuéntanos en qué podemos ayudarte y mantente a la espera hasta que un compañero pueda atenderte.
`
    };
  }

    return null;

}

async function createTicket(interaction, category, ticketUser) {
  const config = getTicketConfig(category, ticketUser);

  if (
    !config ||
    !config.categoryId ||
    !config.ticketName ||
    !config.ticketTitle
  ) {
    return interaction.reply({
      content: '❌ Esta categoría no está bien configurada.',
      ephemeral: true
    });
  }

  db.all(
    `SELECT * FROM tickets
     WHERE userId = ?
     AND status = 'open'`,
    [ticketUser.id],

    async (err, rows) => {
      if (rows.length >= 10) {
        return interaction.reply({
          content: '❌ Este usuario ya tiene 10 tickets abiertos.',
          ephemeral: true
        });
      }

      const uniqueAllowedRoleIds =
      [...new Set(config.allowedRoleIds)];

      const uniqueMentionRoleIds =
      [...new Set(config.mentionRoleIds)];

      const channel =
      await interaction.guild.channels.create({

        name:
        `${config.ticketName}-${ticketUser.username}`,

        type:
        ChannelType.GuildText,

        parent:
        config.categoryId,

        permissionOverwrites: [

          {
            id: interaction.guild.id,
            deny: [
              PermissionsBitField.Flags.ViewChannel
            ]
          },

          {
            id: ticketUser.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },

          ...uniqueAllowedRoleIds.map(roleId => ({
            id: roleId,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          }))

        ]

      });

      db.run(
        `INSERT INTO tickets
         (userId, channelId, status)
         VALUES (?, ?, ?)`,
        [
          ticketUser.id,
          channel.id,
          'open'
        ]
      );

      const embed =
      new EmbedBuilder()

        .setTitle(
          `🎫 Ticket ${config.ticketTitle}`
        )

        .setDescription(
          config.welcomeMessage
        )

        .setColor('Red');

      const closeButton =
      new ButtonBuilder()

        .setCustomId('close_ticket')

        .setLabel('Cerrar Ticket')

        .setStyle(ButtonStyle.Danger)

        .setEmoji('🔒');

      const closeRow =
      new ActionRowBuilder()

        .addComponents(closeButton);

      const ticketFiles = [];

      if (category === 'character') {
        ticketFiles.push(
          path.join(
            __dirname,
            'files',
            'FICHA_PERSONAJE_FIVESTAR.pdf'
          )
        );
      }

      await channel.send({

        content:
        `${ticketUser} ${uniqueMentionRoleIds.map(roleId => `<@&${roleId}>`).join(' ')}`,

        embeds: [embed],

        components: [closeRow],

        files: ticketFiles

      });

      await interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
      });
    }
  );
}

client.once('clientReady', () => {
  console.log(`Logged as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // =====================================
  // AÑADIR USUARIO A TICKET
  // =====================================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === 'addusuario'
  ) {

    if (!hasStaffCommandPerms(interaction.member)) {
      return interaction.reply({
        content: '❌ No tienes permisos para usar este comando.',
        ephemeral: true
      });
    }

    const user =
    interaction.options.getUser('usuario');

    await interaction.channel.permissionOverwrites.edit(
      user.id,
      {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }
    );

    return interaction.reply({
      content: `✅ ${user} añadido al ticket.`,
      ephemeral: false
    });

  }

  // =====================================
  // ABRIR TICKET A OTRO USUARIO
  // =====================================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === 'abrirticket'
  ) {

    if (!hasStaffCommandPerms(interaction.member)) {
      return interaction.reply({
        content: '❌ No tienes permisos para usar este comando.',
        ephemeral: true
      });
    }

    const ticketUser =
    interaction.options.getUser('usuario');

    const category =
    interaction.options.getString('categoria');

    return createTicket(
      interaction,
      category,
      ticketUser
    );

  }

  // =====================================
  // PANEL
  // =====================================

  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === 'panel'
  ) {

    const OWNER_ROLE_ID =
    '1500271736480989317';

    if (
      !interaction.member.roles.cache.has(OWNER_ROLE_ID)
    ) {
      return interaction.reply({
        content: '❌ No tienes permisos para usar este comando.',
        ephemeral: true
      });
    }

    const embed =
    new EmbedBuilder()

      .setTitle('🎫 Tickets | FiveStar')

      .setDescription(`
Selecciona el ticket correspondiente:

📄 - **Fichas Personaje**
Apartado para enviar tu ficha de personaje para acceder al servidor.

🛠️ - **Bugs / Soporte**
Canal destinado a resolver dudas técnicas, incidencias generales o reportar errores y fallos detectados dentro del servidor.

💰 - **Devoluciones**
Sección para solicitar la recuperación o devolución de objetos perdidos debido a fallos o bugs del sistema.

☠️ - **CK**
Apartado para iniciar el proceso de CK de tu personaje.

🔰 - **Administración**
Apartado para hablar directamente con administración.

👮 - **SAPD**
Apartado para resolver dudas, solicitudes o información relacionada con el SAPD.

🏥 - **SAED**
Apartado para resolver dudas, solicitudes o información relacionada con el SAED.

🔪 - **Bandas**
Espacio para resolver dudas, solicitudes o información relacionada con el sistema de bandas del servidor.

🏪 - **Comercios**
Sección para recibir información sobre postulaciones, requisitos o cualquier duda relacionada con los comercios.

🎥 - **Creadores de Contenido**
Apartado para resolver dudas, solicitudes o información relacionada con los Creadores de Contenido.

🎮 - **PlayMaker**
Apartado para solicitar el rol de PlayMaker o resolver dudas sobre requisitos y funciones.

💎 - **VIP**
Sección destinada a consultas, solicitudes o información sobre el rango VIP del servidor y sus beneficios.

**Si tienes alguna duda o necesitas asistencia por parte del staff, abre un ticket en este canal y te atenderemos lo antes posible.**
`)

      .setColor('Red');

    const select =
    new StringSelectMenuBuilder()

      .setCustomId('ticket_category')

      .setPlaceholder(
        'Selecciona categoría'
      )

      .addOptions([

        {
          label: 'Fichas Personaje',
          description: 'Enviar ficha personaje',
          value: 'character',
          emoji: '📄'
        },

        {
          label: 'Bugs / Soporte',
          description: 'Errores y ayuda',
          value: 'support',
          emoji: '🛠️'
        },

        {
          label: 'Devoluciones',
          description: 'Solicitar devolución',
          value: 'refund',
          emoji: '💰'
        },

        {
          label: 'CK',
          description: 'Proceso CK',
          value: 'ck',
          emoji: '☠️'
        },

        {
          label: 'Administración',
          description: 'Ayuda administrativa',
          value: 'admin',
          emoji: '🔰'
        },

        {
          label: 'SAPD',
          description: 'Información SAPD',
          value: 'sapd',
          emoji: '👮'
        },

        {
          label: 'SAED',
          description: 'Información SAED',
          value: 'saed',
          emoji: '🏥'
        },

        {
          label: 'Bandas',
          description: 'Información Bandas',
          value: 'gangs',
          emoji: '🔪'
        },

        {
          label: 'Comercios',
          description: 'Información Comercios',
          value: 'shops',
          emoji: '🏪'
        },

        {
          label: 'Creadores de Contenido',
          description: 'Información Creadores de Contenido',
          value: 'creator',
          emoji: '🎥'
        },

        {
          label: 'Playmaker',
          description: 'Información Playmaker',
          value: 'playmaker',
          emoji: '🎮'
        },

        {
          label: 'VIP',
          description: 'Información sobre el VIP',
          value: 'vip',
          emoji: '💎'
        }

      ]);

    const panelRow =
    new ActionRowBuilder()

      .addComponents(select);

    await interaction.channel.send({
      embeds: [embed],
      components: [panelRow]
    });

    return interaction.reply({
      content: '✅ Panel enviado.',
      ephemeral: true
    });

  }

  // =====================================
  // SELECTOR NORMAL
  // =====================================

  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === 'ticket_category'
  ) {

    const category =
    interaction.values[0];

    return createTicket(
      interaction,
      category,
      interaction.user
    );

  }

  // =====================================
  // CERRAR TICKET
  // =====================================

  if (
    interaction.isButton() &&
    interaction.customId === 'close_ticket'
  ) {

    db.get(
      `SELECT * FROM tickets
       WHERE channelId = ?
       AND status = 'open'`,
      [interaction.channel.id],

      async (err, ticket) => {

        if (!ticket) {
          return interaction.reply({
            content: '❌ Este canal no está registrado como ticket abierto.',
            ephemeral: true
          });
        }

        const attachment =
        await discordTranscripts.createTranscript(
          interaction.channel,
          {
            limit: -1,
            returnType: 'attachment',
            filename:
            `ticket-${interaction.channel.name}.html`
          }
        );

        const logChannel =
        interaction.guild.channels.cache.get(
          process.env.LOG_CHANNEL_ID
        );

        if (logChannel) {
          await logChannel.send({
            content:
            `📁 Transcript ${interaction.channel.name}`,
            files: [attachment]
          });
        }

        try {
          const ticketUser =
          await client.users.fetch(ticket.userId);

          await ticketUser.send({
            content:
            `Tu ticket **${interaction.channel.name}** ha sido cerrado. Aquí tienes el transcript:`,
            files: [attachment]
          });

        } catch (error) {
          console.error(
            'No se pudo enviar el transcript al usuario:',
            error
          );
        }

        db.run(
          `UPDATE tickets
           SET status = 'closed'
           WHERE channelId = ?`,
          [interaction.channel.id]
        );

        await interaction.reply(
          '🔒 Cerrando ticket...'
        );

                setTimeout(async () => {
          await interaction.channel.delete();
        }, 5000);

      }

    );

  }

});

client.login(process.env.TOKEN);
