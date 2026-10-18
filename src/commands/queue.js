const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'queue',
  aliases: ['q'],
  description: 'Menampilkan daftar antrean lagu',
  async execute({ message, interaction, player }) {
    const guildId = message ? message.guild.id : interaction.guild.id;
    const queue = player.nodes.get(guildId);

    if (!queue || !queue.isPlaying()) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('Queue is empty or nothing is currently playing.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.toArray();

    const trackList = tracks
      .slice(0, 10)
      .map((t, idx) => `**${idx + 1}.** [${t.title}](${t.url}) • \`${t.duration}\``)
      .join('\n');

    const totalTracks = tracks.length;
    const remaining = totalTracks > 10 ? `\n*...and ${totalTracks - 10} more tracks.*` : '';

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('Queue')
      .setDescription(
        `**Now Playing:**\n[${currentTrack.title}](${currentTrack.url}) • \`${currentTrack.duration}\`\n\n` +
        `**Upcoming:**\n${trackList || '*Queue is empty.*'}${remaining}`
      )
      .setFooter({ text: `Total: ${totalTracks + 1} tracks • Loop: ${queue.repeatMode ? 'Active' : 'Off'}` });

    return message ? message.reply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] });
  },
};
