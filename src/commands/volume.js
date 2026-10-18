const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'volume',
  aliases: ['v', 'vol'],
  description: 'Mengatur volume musik (0 - 100%)',
  options: [
    {
      name: 'amount',
      description: 'Volume percentage (0 - 100)',
      type: 4,
      required: true,
      min_value: 0,
      max_value: 100,
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

    const volumeInput = message ? parseInt(args[0], 10) : interaction.options.getInteger('amount');

    if (isNaN(volumeInput) || volumeInput < 0 || volumeInput > 100) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`Please provide a valid volume between \`0\` and \`100\`. (Current: **${queue.node.volume}%**)`),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    queue.node.setVolume(volumeInput);

    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.primary)
          .setDescription(`Volume set to **${volumeInput}%**`),
      ],
    };
    return message ? message.reply(reply) : interaction.reply(reply);
  },
};
