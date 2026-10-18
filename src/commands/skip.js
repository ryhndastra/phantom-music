const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'skip',
  aliases: ['s'],
  description: 'Melewati lagu yang sedang diputar',
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

    const currentTrack = queue.currentTrack;
    queue.node.skip();

    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.primary)
          .setDescription(`Skipped: **[${currentTrack.title}](${currentTrack.url})**`),
      ],
    };
    return message ? message.reply(reply) : interaction.reply(reply);
  },
};
