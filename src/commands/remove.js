const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'remove',
  aliases: ['rm', 'del', 'delete'],
  description: 'Menghapus lagu tertentu dari antrean berdasarkan nomor urut',
  options: [
    {
      name: 'number',
      description: 'Nomor lagu di antrean yang ingin dihapus (cek di /queue)',
      type: 4, 
      required: true,
      min_value: 1,
    },
  ],
  async execute({ message, interaction, args, player }) {
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

    const tracks = queue.tracks.toArray();
    if (!tracks || tracks.length === 0) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('There are no upcoming tracks in the queue to remove.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    const inputNum = message ? parseInt(args[0], 10) : interaction.options.getInteger('number');

    if (isNaN(inputNum) || inputNum < 1 || inputNum > tracks.length) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`Please provide a valid track number between \`1\` and \`${tracks.length}\`. Use \`${config.prefix}queue\` to check track numbers.`),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    const index = inputNum - 1;
    const trackToRemove = tracks[index];
    const removed = queue.node.remove(index);

    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.primary)
          .setDescription(`Removed: **[${trackToRemove.title}](${trackToRemove.url})** from queue.`),
      ],
    };

    return message ? message.reply(reply) : interaction.reply(reply);
  },
};

