const { EmbedBuilder } = require('discord.js');
const { createNowPlayingEmbed, createControlButtons, createLeaveEmbed } = require('./utils/ui');
const config = require('./config');

module.exports = function registerPlayerEvents(player) {
  // When a track starts playing
  player.events.on('playerStart', (queue, track) => {
    const embed = createNowPlayingEmbed(track, queue);
    const buttons = createControlButtons(false);

    queue.metadata?.channel
      ?.send({
        embeds: [embed],
        components: [buttons],
      })
      .then((msg) => {
        queue.metadata.lastNowPlayingMessage = msg;
      })
      .catch((err) => {
        console.error('Failed to send now playing message:', err);
      });
  });

  // When a single track is added to queue
  player.events.on('audioTrackAdd', (queue, track) => {
    if (queue.isPlaying()) {
      const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setDescription(`Added to queue: **[${track.title}](${track.url})** (\`${track.duration}\`)`);

      queue.metadata?.channel?.send({ embeds: [embed] }).catch(() => {});
    }
  });

  // When multiple tracks (playlist) are added
  player.events.on('audioTracksAdd', (queue, tracks) => {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setDescription(`Added **${tracks.length} tracks** to queue.`);

    queue.metadata?.channel?.send({ embeds: [embed] }).catch(() => {});
  });

  // When queue finishes
  player.events.on('emptyQueue', (queue) => {
    const leaveEmbed = createLeaveEmbed();
    queue.metadata?.channel?.send({ embeds: [leaveEmbed] }).catch(() => {});
  });

  // When voice channel is empty
  player.events.on('emptyChannel', (queue) => {
    const leaveEmbed = createLeaveEmbed();
    queue.metadata?.channel?.send({ embeds: [leaveEmbed] }).catch(() => {});
  });

  // When bot is disconnected
  player.events.on('disconnect', (queue) => {
    const leaveEmbed = createLeaveEmbed();
    queue.metadata?.channel?.send({ embeds: [leaveEmbed] }).catch(() => {});
  });

  // Error handling
  player.events.on('error', (queue, error) => {
    console.error(`[Queue Error]:`, error);
  });

  player.events.on('playerError', (queue, error) => {
    console.error(`[Player Error]:`, error);
    queue.metadata?.channel
      ?.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.danger)
            .setDescription(`Error playing audio: \`${error.message}\``),
        ],
      })
      .catch(() => {});
  });
};
