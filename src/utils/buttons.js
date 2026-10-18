const { QueueRepeatMode } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const { createControlButtons, getLoopModeName, createLeaveEmbed } = require('./ui');
const config = require('../config');

async function handleButtonInteraction(interaction, player) {
  if (!interaction.isButton()) return;

  const guildId = interaction.guildId;
  const queue = player.nodes.get(guildId);
  const member = interaction.member;

  // Verify voice channel
  if (!member.voice.channel) {
    return interaction.reply({
      content: 'You must be in the same voice channel to use buttons.',
      ephemeral: true,
    });
  }

  if (queue && member.voice.channelId !== queue.channel.id) {
    return interaction.reply({
      content: 'You must be in the same voice channel as the bot.',
      ephemeral: true,
    });
  }

  if (!queue || !queue.isPlaying()) {
    return interaction.reply({
      content: 'No tracks are currently playing.',
      ephemeral: true,
    });
  }

  const customId = interaction.customId;

  try {
    switch (customId) {
      case 'btn_playpause': {
        const isPaused = queue.node.isPaused();
        if (isPaused) {
          queue.node.resume();
        } else {
          queue.node.pause();
        }

        const updatedButtons = createControlButtons(!isPaused);
        await interaction.update({ components: [updatedButtons] });
        break;
      }

      case 'btn_skip': {
        const currentTrack = queue.currentTrack;
        queue.node.skip();
        await interaction.reply({
          content: `Skipped by **${interaction.user.username}**: **${currentTrack.title}**`,
        });
        break;
      }

      case 'btn_loop': {
        let nextMode;
        if (queue.repeatMode === QueueRepeatMode.OFF) nextMode = QueueRepeatMode.TRACK;
        else if (queue.repeatMode === QueueRepeatMode.TRACK) nextMode = QueueRepeatMode.QUEUE;
        else nextMode = QueueRepeatMode.OFF;

        queue.setRepeatMode(nextMode);
        await interaction.reply({
          content: `Loop mode set to: **${getLoopModeName(nextMode)}**`,
          ephemeral: true,
        });
        break;
      }

      case 'btn_queue': {
        const tracks = queue.tracks.toArray();
        const currentTrack = queue.currentTrack;
        const trackList = tracks
          .slice(0, 5)
          .map((t, idx) => `**${idx + 1}.** [${t.title}](${t.url}) • \`${t.duration}\``)
          .join('\n');

        const remaining = tracks.length > 5 ? `\n*...and ${tracks.length - 5} more tracks.*` : '';

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.primary)
              .setTitle('Queue Overview')
              .setDescription(
                `**Now Playing:**\n${currentTrack ? `[${currentTrack.title}](${currentTrack.url}) • \`${currentTrack.duration}\`` : '*Nothing*'}\n\n` +
                `**Upcoming:**\n${trackList || '*Queue is empty.*'}${remaining}`
              )
              .setFooter({ text: `Total: ${tracks.length + (currentTrack ? 1 : 0)} tracks` }),
          ],
          ephemeral: true,
        });
        break;
      }

      case 'btn_stop': {
        queue.delete();
        const leaveEmbed = createLeaveEmbed();
        await interaction.reply({
          embeds: [leaveEmbed],
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Error handling button interaction:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred while handling this action.', ephemeral: true });
    }
  }
}

module.exports = { handleButtonInteraction };
