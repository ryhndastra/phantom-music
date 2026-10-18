const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');

function createNowPlayingEmbed(track, queue) {
  const currentDuration = queue.node.getTimestamp()?.current?.label || '0:00';
  const totalDuration = track.duration || 'Live';
  const requestedBy = track.requestedBy ? track.requestedBy.toString() : 'Unknown';

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setAuthor({ name: 'Now Playing' })
    .setTitle(track.title)
    .setURL(track.url)
    .setDescription(
      `**Author:** ${track.author}\n` +
      `**Duration:** \`${currentDuration} / ${totalDuration}\`\n` +
      `**Requested by:** ${requestedBy}`
    )
    .setThumbnail(track.thumbnail || null)
    .setFooter({
      text: `Volume: ${queue.node.volume}% • Loop: ${getLoopModeName(queue.repeatMode)} • Queue: ${queue.tracks.size} tracks`,
    });
}

function createControlButtons(isPaused = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_playpause')
      .setLabel(isPaused ? 'Resume' : 'Pause')
      .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_skip')
      .setLabel('Skip')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_loop')
      .setLabel('Loop')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_queue')
      .setLabel('Queue')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_stop')
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger)
  );
}

function createLeaveEmbed() {
  return new EmbedBuilder()
    .setColor(config.colors.danger)
    .setDescription(
      `**Thank you for using Phantom Music!**\n\n` +
      `Use \`${config.prefix}play\` or \`/play\` anytime to start listening again!\n\n` +
      `*Your suggestions and opinions are always considered!*`
    );
}

function getLoopModeName(mode) {
  switch (mode) {
    case 1:
      return 'Track';
    case 2:
      return 'Queue';
    case 3:
      return 'Autoplay';
    default:
      return 'Off';
  }
}

module.exports = {
  createNowPlayingEmbed,
  createControlButtons,
  createLeaveEmbed,
  getLoopModeName,
};
