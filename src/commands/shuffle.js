const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'shuffle',
  aliases: ['sh', 'shuff', 'random'],
  description: 'Mengacak urutan lagu di dalam antrean',
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

    if (queue.tracks.size < 2) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('Need at least 2 upcoming tracks in the queue to shuffle.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    queue.tracks.shuffle();

    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.primary)
          .setDescription(`Shuffled **${queue.tracks.size} tracks** in the queue.`),
      ],
    };

    return message ? message.reply(reply) : interaction.reply(reply);
  },
};

