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

// 🔥 PON TUS IDS AQUÍ
const CANAL_PEDIDOS = "1473151288316264621";
const CANAL_MODELOS = "1473171713624768577";
const CANAL_TEMAS = "1473172839405195355";
const CATEGORIA_ID = "1473173468693397514";

// Memoria temporal
const modelos = {};
const temas = {};

client.once('clientReady', () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 📁 GUARDAR MODELOS
  if (message.channel.id === CANAL_MODELOS) {
    const numero = message.content.trim();
    const imagen = message.attachments.first();
    if (!imagen) return;

    modelos[numero] = imagen.url;
    message.reply(`✅ Modelo ${numero} guardado.`);
  }

  // 📁 GUARDAR TEMAS
  if (message.channel.id === CANAL_TEMAS) {
    const numero = message.content.trim();
    const imagen = message.attachments.first();
    if (!imagen) return;

    temas[numero] = imagen.url;
    message.reply(`✅ Tema ${numero} guardado.`);
  }

  // 📦 CREAR PEDIDO
  if (message.channel.id === CANAL_PEDIDOS) {
    const partes = message.content.trim().split(" ");
    if (partes.length < 3) return;

    const modeloNum = partes[partes.length - 2];
    const temaNum = partes[partes.length - 1];
    const nombre = partes.slice(0, partes.length - 2).join(" ").toLowerCase();

    if (!modelos[modeloNum]) {
      return message.reply("❌ Ese modelo no existe.");
    }

    if (!temas[temaNum]) {
      return message.reply("❌ Ese tema no existe.");
    }

    try {
      const nuevoCanal = await message.guild.channels.create({
        name: nombre,
        type: ChannelType.GuildText,
        parent: CATEGORIA_ID, // 🔥 SE CREA EN LA CATEGORÍA
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          }
        ]
      });

      const boton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('cerrar_canal')
          .setLabel('Cerrar Canal')
          .setStyle(ButtonStyle.Danger)
      );

      // 📌 MODELO
      await nuevoCanal.send(`📌 **Modelo seleccionado: ${modeloNum}**`);
      await nuevoCanal.send({
        files: [modelos[modeloNum]]
      });

      // 📝 TEMA
      await nuevoCanal.send(`📝 **Tema seleccionado: ${temaNum}**`);
      await nuevoCanal.send({
        files: [temas[temaNum]]
      });

      await nuevoCanal.send({
        content: "🔒 Presiona el botón para cerrar este canal.",
        components: [boton]
      });

    } catch (error) {
      console.log(error);
      message.reply("❌ Error al crear el canal.");
    }
  }
});

// 🔴 BOTÓN CERRAR
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'cerrar_canal') {
    await interaction.channel.delete();
  }
});

client.login(process.env.TOKEN);
