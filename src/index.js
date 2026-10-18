const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeExtractor } = require('discord-player-youtubei');

const config = require('./config');
const registerPlayerEvents = require('./playerEvents');
const { handleButtonInteraction } = require('./utils/buttons');

// Init Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Init Command & Alias
client.commands = new Collection();
client.aliases = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.name) {
    client.commands.set(command.name, command);
    if (command.aliases && Array.isArray(command.aliases)) {
      command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
    }
  }
}

const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

async function initExtractors() {
  try {
    await player.extractors.register(YoutubeExtractor, {});
    console.log('✅ YouTube Audio Extractor berhasil dimuat sebagai engine utama (HD Audio & Original Release)!');
  } catch (err) {
    console.error('❌ Gagal memuat ekstrakor audio:', err);
  }
}

registerPlayerEvents(player);

client.once('clientReady', async () => {
  console.log(`\n=========================================`);
  console.log(`🤖 Logged in as: ${client.user.tag}`);
  console.log(`🔧 Prefix Command: "${config.prefix}" (bisa diubah di .env)`);
  console.log(`🌐 Server aktif di ${client.guilds.cache.size} server.`);
  console.log(`=========================================\n`);

  client.user.setActivity({
    name: `${config.prefix}help | /play`,
    type: ActivityType.Listening,
  });

  const slashCommandsData = [];
  client.commands.forEach((cmd) => {
    slashCommandsData.push({
      name: cmd.name,
      description: cmd.description || 'Tidak ada deskripsi',
      options: cmd.options || [],
    });
  });

  try {
    await client.application.commands.set(slashCommandsData);
    console.log(`✅ Berhasil mendaftarkan ${slashCommandsData.length} Slash Commands (/play, dll)!`);
  } catch (err) {
    console.error('⚠️ Gagal mendaftarkan Slash Commands:', err);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
  if (!command) return;

  try {
    await command.execute({ client, message, args, player });
  } catch (error) {
    console.error(`Error executing prefix command "${commandName}":`, error);
    message.reply('⚠️ Terjadi error saat menjalankan command tersebut.').catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    return handleButtonInteraction(interaction, player);
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute({ client, interaction, player });
    } catch (error) {
      console.error(`Error executing slash command "${interaction.commandName}":`, error);
      const reply = { content: '⚠️ Terjadi error saat menjalankan command tersebut.', ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  }
});

async function start() {
  if (!config.token) {
    console.error('❌ DISCORD_TOKEN belum diisi di file .env!');
    process.exit(1);
  }

  await initExtractors();
  await client.login(config.token);
}

start().catch((err) => {
  console.error('❌ Error fatal saat menjalankan bot:', err);
  process.exit(1);
});
