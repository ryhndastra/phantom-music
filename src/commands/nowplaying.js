const { EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createControlButtons } = require('../utils/ui');
const config = require('../config');

module.exports = {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'Melihat info lagu yang sedang diputar saat ini',
  async execute({ message, interaction, player }) {
    const guildId = message ? message.guild.id : interaction.guild.id;
    const queue = player.nodes.get(guildId);

    if (!queue || !queue.isPlaying()) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('⚠️ Tidak ada lagu yang sedang diputar.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    const currentTrack = queue.currentTrack;
    const embed = createNowPlayingEmbed(currentTrack, queue);
    const buttons = createControlButtons(queue.node.isPaused());

    const reply = { embeds: [embed], components: [buttons] };
    return message ? message.reply(reply) : interaction.reply(reply);
  },
};
