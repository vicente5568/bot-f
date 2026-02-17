require('dotenv').config({ path: './config.env' });

const {
    Client,
    GatewayIntentBits,
    ChannelType,
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

client.once('ready', () => {
    console.log(`✅ Bot listo como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // 🔒 Solo funciona en el canal configurado
    if (message.channel.id !== process.env.CANAL_CREAR_ID) return;

    // Debe tener imagen
    if (message.attachments.size === 0) {
        return message.reply("⚠ Debes adjuntar una imagen.");
    }

    const partes = message.content.trim().split(/\s+/);

    if (partes.length < 3) {
        return message.reply("⚠ Formato incorrecto. Usa: Nombre Modelo Tema");
    }

    const nombre = partes[0].toLowerCase();
    const modelo = partes[1];
    const tema = partes[2];

    if (isNaN(modelo) || isNaN(tema)) {
        return message.reply("⚠ Modelo y tema deben ser números.");
    }

    try {
        // 📁 Crear canal
        const nuevoCanal = await message.guild.channels.create({
            name: nombre,
            type: ChannelType.GuildText,
            parent: process.env.CATEGORIA_ID || null
        });

        // 🔘 Botón cerrar
        const boton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("cerrar_canal")
                .setLabel("🔒 Cerrar Canal")
                .setStyle(ButtonStyle.Danger)
        );

        // 📷 Enviar imagen
        await nuevoCanal.send({
            content: `📷 Imagen de **${nombre}**`,
            files: [message.attachments.first().url]
        });

        // 📌 Datos separados
        await nuevoCanal.send(`🧩 **Modelo:** ${modelo}`);
        await nuevoCanal.send(`🔤 **Tema de letra:** ${tema}`);

        // 🔒 Botón
        await nuevoCanal.send({
            content: "Presiona el botón para cerrar el canal.",
            components: [boton]
        });

        await message.reply(`✅ Canal creado: ${nuevoCanal}`);

    } catch (error) {
        console.error("Error al crear canal:", error);
    }
});

// 🔘 Evento botón
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "cerrar_canal") {
        await interaction.reply({ content: "🔒 Cerrando canal...", ephemeral: true });

        setTimeout(() => {
            interaction.channel.delete().catch(console.error);
        }, 1500);
    }
});
 const CANAL_ID = "1473151288316264621";

client.login(process.env.TOKEN);


