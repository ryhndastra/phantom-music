const { EmbedBuilder } = require('discord.js');
const { createLeaveEmbed } = require('../utils/ui');
const config = require('../config');

module.exports = {
  name: 'stop',
  aliases: ['dc', 'leave', 'disconnect'],
  description: 'Menghentikan musik dan keluar dari voice channel',
  async execute({ message, interaction, player }) {
    const guildId = message ? message.guild.id : interaction.guild.id;
    const queue = player.nodes.get(guildId);

    if (!queue) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('Bot is not currently active in a voice channel.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    queue.delete();

    const leaveEmbed = createLeaveEmbed();
    return message ? message.reply({ embeds: [leaveEmbed] }) : interaction.reply({ embeds: [leaveEmbed] });
  },
};
