const { QueueRepeatMode } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const { getLoopModeName } = require('../utils/ui');
const config = require('../config');

module.exports = {
  name: 'loop',
  aliases: ['l', 'repeat'],
  description: 'Mengubah mode loop (off, track, queue, autoplay)',
  options: [
    {
      name: 'mode',
      description: 'Mode loop yang diinginkan',
      type: 3,
      required: false,
      choices: [
        { name: 'Off', value: 'off' },
        { name: 'Track (Ulangi 1 lagu)', value: 'track' },
        { name: 'Queue (Ulangi seluruh antrean)', value: 'queue' },
        { name: 'Autoplay (Otomatis cari lagu mirip saat habis)', value: 'autoplay' },
      ],
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
            .setDescription('⚠️ Tidak ada lagu yang sedang diputar.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    let modeInput = message ? args[0]?.toLowerCase() : interaction.options.getString('mode');

    // If no argument provided, cycle through modes: off -> track -> queue -> off
    let nextMode;
    if (!modeInput) {
      if (queue.repeatMode === QueueRepeatMode.OFF) nextMode = QueueRepeatMode.TRACK;
      else if (queue.repeatMode === QueueRepeatMode.TRACK) nextMode = QueueRepeatMode.QUEUE;
      else nextMode = QueueRepeatMode.OFF;
    } else {
      switch (modeInput) {
        case 'track':
        case 'song':
        case '1':
          nextMode = QueueRepeatMode.TRACK;
          break;
        case 'queue':
        case 'all':
        case '2':
          nextMode = QueueRepeatMode.QUEUE;
          break;
        case 'autoplay':
        case 'auto':
        case '3':
          nextMode = QueueRepeatMode.AUTOPLAY;
          break;
        case 'off':
        case '0':
        default:
          nextMode = QueueRepeatMode.OFF;
          break;
      }
    }

    queue.setRepeatMode(nextMode);

    const reply = {
      embeds: [
        new EmbedBuilder()
          .setColor(config.colors.primary)
          .setDescription(`🔁 Mode loop diatur ke: **${getLoopModeName(nextMode)}**`),
      ],
    };
    return message ? message.reply(reply) : interaction.reply(reply);
  },
};
