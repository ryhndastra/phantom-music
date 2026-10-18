const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'help',
  aliases: ['h', 'menu'],
  description: 'Menampilkan daftar perintah dan panduan bot',
  async execute({ message, interaction }) {
    const p = config.prefix;

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('Commands Guide — Phantom Music')
      .setDescription(
        `Modern, lightweight music bot supporting **Spotify, Apple Music, and YouTube**.\n` +
        `Use prefix **\`${p}\`** or slash commands **\`/\`**!`
      )
      .addFields(
        {
          name: 'Playback Commands',
          value:
            `\`${p}play <query/url>\` or \`${p}p\` - Play song or playlist\n` +
            `\`${p}pause\` / \`${p}resume\` - Pause or resume playback\n` +
            `\`${p}skip\` or \`${p}s\` - Skip current track\n` +
            `\`${p}stop\` or \`${p}dc\` - Stop playback and leave voice\n` +
            `\`${p}nowplaying\` or \`${p}np\` - View current playing track`
        },
        {
          name: 'Queue & Settings',
          value:
            `\`${p}queue\` or \`${p}q\` - View upcoming songs in queue\n` +
            `\`${p}shuffle\` or \`${p}sh\` - Shuffle the upcoming queue order\n` +
            `\`${p}remove <number>\` or \`${p}rm <number>\` - Remove a specific song from queue\n` +
            `\`${p}loop [track/queue/off]\` or \`${p}l\` - Change repeat mode\n` +
            `\`${p}volume <0-100>\` or \`${p}v\` - Set playback volume\n` +
            `\`${p}help\` or \`${p}h\` - Display this help menu`
        }
      )
      .setFooter({ text: 'Phantom Music' });

    return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
