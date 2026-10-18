const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'resume',
  aliases: ['r', 'unpause'],
  description: 'Melanjutkan lagu yang sedang dijeda',
  async execute({ message, interaction, player }) {
    const guildId = message ? message.guild.id : interaction.guild.id;
    const queue = player.nodes.get(guildId);

    if (!queue || !queue.isPlaying()) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('No tracks are currently playing.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    if (!queue.node.isPaused()) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('Playback is not paused.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    queue.node.resume();
    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.success)
          .setDescription('Playback resumed.'),
      ],
    };
    return message ? message.reply(reply) : interaction.reply(reply);
  },
};
