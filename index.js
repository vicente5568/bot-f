require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 PON AQUÍ EL ID DEL CANAL DONDE SE ENVIARÁ EL MENSAJE
const CANAL_ID = "1473151288316264621";

client.once('clientReady', () => {
  console.log(`Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CANAL_ID) return;

  // Espera formato: Nombre (con foto adjunta) 12 23
  const partes = message.content.trim().split(" ");

  if (partes.length < 3) return;

  const modelo = partes[partes.length - 2];
  const tema = partes[partes.length - 1];
  const nombre = partes.slice(0, partes.length - 2).join(" ").toLowerCase();

  if (!message.attachments.first()) {
    return message.reply("Debes enviar una imagen.");
  }

  try {
    const nuevoCanal = await message.guild.channels.create({
      name: nombre,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: message.guild.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        }
      ]
    });

    // Crear botón cerrar
    const boton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('cerrar_canal')
        .setLabel('Cerrar Canal')
        .setStyle(ButtonStyle.Danger)
    );

    await nuevoCanal.send({
      content: `📷 Imagen:`,
      files: [message.attachments.first().url]
    });

    await nuevoCanal.send(`Modelo: ${modelo}`);
    await nuevoCanal.send(`Tema de letra: ${tema}`);

    await nuevoCanal.send({
      content: "Presiona el botón para cerrar este canal.",
      components: [boton]
    });

  } catch (error) {
    console.log(error);
  }
});

// Botón cerrar
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'cerrar_canal') {
    await interaction.channel.delete();
  }
});

client.login(process.env.TOKEN);
