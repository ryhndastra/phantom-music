const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { isSpotifyUrl, isAppleMusicUrl, resolveSpotify, resolveAppleMusic } = require('../utils/resolver');

module.exports = {
  name: 'play',
  aliases: ['p'],
  description: 'Memutar lagu/playlist dari Spotify, Apple Music, atau YouTube',
  options: [
    {
      name: 'query',
      description: 'Judul lagu atau link (Spotify / Apple Music / YouTube)',
      type: 3,
      required: true,
    },
  ],
  async execute({ message, interaction, args, player }) {
    const member = message ? message.member : interaction.member;
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.danger)
            .setDescription('You must be in a voice channel first.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    const query = (message ? args.join(' ') : interaction.options.getString('query'))?.trim();
    if (!query) {
      const reply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription('Please provide a song title or link.'),
        ],
      };
      return message ? message.reply(reply) : interaction.reply(reply);
    }

    let loadingMsg = null;
    if (message) {
      loadingMsg = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.primary)
            .setDescription(`Searching: **${query}**...`),
        ],
      }).catch(() => null);
    } else {
      await interaction.deferReply();
    }

    const nodeOptions = {
      metadata: {
        channel: message ? message.channel : interaction.channel,
        voiceChannel: voiceChannel,
      },
      volume: config.defaultVolume,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 30000,
      leaveOnEnd: false,
      bufferingTimeout: 3000,
      selfDeaf: true,
      disableBiquad: true,
      disableEqualizer: true,
      disableFilterer: true,
      disableResampler: true,
    };

    try {
      // Spotify URL
      if (isSpotifyUrl(query)) {
        const spotifyData = await resolveSpotify(query);
        if (!spotifyData) {
          const reply = {
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.danger)
                .setDescription('Failed to load Spotify link.'),
            ],
          };
          if (loadingMsg) return loadingMsg.edit(reply);
          return interaction.editReply(reply);
        }

        // Spotify Playlist / Album
        if (spotifyData.type === 'playlist') {
          const tracks = spotifyData.tracks;
          if (!tracks || tracks.length === 0) {
            const reply = {
              embeds: [
                new EmbedBuilder()
                  .setColor(config.colors.danger)
                  .setDescription('Spotify playlist is empty or inaccessible.'),
              ],
            };
            if (loadingMsg) return loadingMsg.edit(reply);
            return interaction.editReply(reply);
          }

          const firstTrackQuery = tracks[0].searchQuery;
          const firstResult = await player.search(firstTrackQuery, { requestedBy: member.user });

          if (!firstResult || !firstResult.hasTracks()) {
            const reply = {
              embeds: [
                new EmbedBuilder()
                  .setColor(config.colors.danger)
                  .setDescription('Could not find the initial track of this playlist.'),
              ],
            };
            if (loadingMsg) return loadingMsg.edit(reply);
            return interaction.editReply(reply);
          }

          const { queue } = await player.play(voiceChannel, firstResult, { nodeOptions });

          const initialReply = {
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.primary)
                .setDescription(
                  `Loading Spotify playlist (${tracks.length} tracks)...\n` +
                  `Playing: **${tracks[0].title}**`
                ),
            ],
          };

          if (loadingMsg) await loadingMsg.edit(initialReply);
          else await interaction.editReply(initialReply);

          // Queue remaining tracks in background
          (async () => {
            for (let i = 1; i < tracks.length; i++) {
              if (queue.deleted) break;
              try {
                const searchRes = await player.search(tracks[i].searchQuery, { requestedBy: member.user });
                if (searchRes && searchRes.hasTracks()) {
                  queue.addTrack(searchRes.tracks[0]);
                }
              } catch (_) {}
            }
          })();

          return;
        }

        // Spotify Single Track
        const searchResult = await player.search(spotifyData.searchQuery, { requestedBy: member.user });
        if (!searchResult || !searchResult.hasTracks()) {
          const reply = {
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.danger)
                .setDescription(`Could not find audio for: **${spotifyData.title}**`),
            ],
          };
          if (loadingMsg) return loadingMsg.edit(reply);
          return interaction.editReply(reply);
        }

        await player.play(voiceChannel, searchResult, { nodeOptions });

        // Clean up loading message so only the Now Playing card is shown
        if (loadingMsg) {
          loadingMsg.delete().catch(() => {});
        } else {
          interaction.deleteReply().catch(() => {});
        }
        return;
      }

      // Apple Music URL
      if (isAppleMusicUrl(query)) {
        const appleData = await resolveAppleMusic(query);
        if (!appleData) {
          const reply = {
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.danger)
                .setDescription('Failed to load Apple Music link.'),
            ],
          };
          if (loadingMsg) return loadingMsg.edit(reply);
          return interaction.editReply(reply);
        }

        const searchResult = await player.search(appleData.searchQuery, { requestedBy: member.user });
        if (!searchResult || !searchResult.hasTracks()) {
          const reply = {
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.danger)
                .setDescription(`Could not find audio for: **${appleData.title}**`),
            ],
          };
          if (loadingMsg) return loadingMsg.edit(reply);
          return interaction.editReply(reply);
        }

        await player.play(voiceChannel, searchResult, { nodeOptions });

        if (loadingMsg) {
          loadingMsg.delete().catch(() => {});
        } else {
          interaction.deleteReply().catch(() => {});
        }
        return;
      }

      // Search text or YouTube URL
      const searchResult = await player.search(query, {
        requestedBy: member.user,
      });

      if (!searchResult || !searchResult.hasTracks()) {
        const reply = {
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.danger)
              .setDescription(`No tracks found for: \`${query}\``),
          ],
        };
        if (loadingMsg) return loadingMsg.edit(reply);
        return interaction.editReply(reply);
      }

      await player.play(voiceChannel, searchResult, { nodeOptions });

      if (loadingMsg) {
        loadingMsg.delete().catch(() => {});
      } else {
        interaction.deleteReply().catch(() => {});
      }
    } catch (error) {
      console.error('Error playing track:', error);
      const errorReply = {
        embeds: [
          new EmbedBuilder()
            .setColor(config.colors.danger)
            .setDescription(`Failed to play track: \`${error.message || error}\``),
        ],
      };
      if (loadingMsg) return loadingMsg.edit(errorReply).catch(() => {});
      return interaction.editReply(errorReply).catch(() => {});
    }
  },
};
