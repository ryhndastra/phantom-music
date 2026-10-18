const spotifyUrlInfo = require('spotify-url-info')(fetch);

// Checks if a string is a Spotify URL
function isSpotifyUrl(url) {
  return /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+/i.test(url);
}

// Checks if a string is an Apple Music URL
function isAppleMusicUrl(url) {
  return /^(https?:\/\/)?music\.apple\.com\/[a-z]{2}\/(album|playlist|song)\/[^/]+/i.test(url);
}

// Resolves Spotify URL to track metadata
async function resolveSpotify(url) {
  try {
    if (url.includes('/playlist/') || url.includes('/album/')) {
      const tracks = await spotifyUrlInfo.getTracks(url);
      return {
        type: 'playlist',
        tracks: tracks.map((t) => ({
          title: t.name,
          artist: Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(' ') : (t.artist || ''),
          searchQuery: `${t.name} ${Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(' ') : ''}`.trim(),
        })),
      };
    } else {
      const details = await spotifyUrlInfo.getDetails(url);
      const title = details?.preview?.title || details?.title || '';
      const artist = details?.preview?.artist || details?.artists?.[0]?.name || '';
      return {
        type: 'track',
        title,
        artist,
        searchQuery: `${title} ${artist}`.trim(),
      };
    }
  } catch (err) {
    console.error('Gagal mengambil metadata Spotify:', err);
    return null;
  }
}

// Resolves Apple Music URL to track metadata
async function resolveAppleMusic(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const html = await res.text();
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);

    if (titleMatch && titleMatch[1]) {
      // Example title: "Blinding Lights by The Weeknd on Apple Music"
      let cleanTitle = titleMatch[1].replace(/ on Apple\s*Music/i, '').trim();
      const parts = cleanTitle.split(' by ');
      const title = parts[0]?.trim() || '';
      const artist = parts[1]?.trim() || '';

      return {
        type: 'track',
        title,
        artist,
        searchQuery: `${title} ${artist}`.trim(),
      };
    }
    return null;
  } catch (err) {
    console.error('Gagal mengambil metadata Apple Music:', err);
    return null;
  }
}

module.exports = {
  isSpotifyUrl,
  isAppleMusicUrl,
  resolveSpotify,
  resolveAppleMusic,
};

