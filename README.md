# 👻 Phantom Music Bot

A modern, high-fidelity, and lightweight Discord music bot (~60-90MB RAM) supporting **Spotify, Apple Music, and YouTube**.

## ✨ Features
- **Multi-Source Audio**: Play songs, albums, and playlists seamlessly from Spotify, Apple Music, and YouTube.
- **Original Audio Fidelity**: Direct official release matching with DASP bypass for pure studio audio quality.
- **Prefix & Slash Commands**: Fully supports prefix commands with convenient shorthands (`!p`, `!s`, `!q`, `!sh`, `!rm`, `!dc`) and Discord Slash Commands (`/play`, etc.).
- **Interactive Buttons**: Sleek controller buttons (`Pause`, `Skip`, `Loop`, `Queue`, `Stop`) attached directly to the Now Playing card.
- **Queue Management**: Shuffle upcoming tracks (`!sh`) and remove specific songs by index (`!rm <number>`).
- **Minimalist Aesthetics**: Clean, non-spammy embeds with Jockie-style leave notification.
- **Resource Friendly**: Runs in a single lightweight Node.js process without requiring standalone Java/Lavalink nodes.

---

## 🚀 Setup & Installation

### 1. Create Bot Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. In the **Bot** tab:
   - Enable **Message Content Intent**, **Server Members Intent**, and **Presence Intent** under *Privileged Gateway Intents*.
   - Click **Reset Token** and copy your token.
3. In the **Installation** (or **OAuth2 -> URL Generator**) tab:
   - Select scopes: `bot` and `applications.commands`.
   - Select permissions: `Administrator` (or `Connect`, `Speak`, `Send Messages`, `Embed Links`).
   - Open the generated invite link to authorize the bot into your server.

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and insert your token:
```env
DISCORD_TOKEN=your_bot_token_here
PREFIX=!
DEFAULT_VOLUME=100
```

### 3. Run the Bot
```bash
# Production mode
npm start

# Development mode (auto-reload on changes)
npm run dev
```

---

## 📜 Commands Reference

| Prefix Command | Shorthand | Slash Command | Description |
| :--- | :--- | :--- | :--- |
| `!play <query/url>` | `!p` | `/play` | Play a song or playlist (Spotify, Apple Music, YouTube) |
| `!pause` | `!ps` | `/pause` | Pause current playback |
| `!resume` | `!r` | `/resume` | Resume paused playback |
| `!skip` | `!s` | `/skip` | Skip current track |
| `!stop` | `!dc`, `!leave` | `/stop` | Stop playback, clear queue, and leave voice channel |
| `!queue` | `!q` | `/queue` | View upcoming songs in queue |
| `!shuffle` | `!sh` | `/shuffle` | Shuffle upcoming queue order |
| `!remove <number>` | `!rm` | `/remove` | Remove a specific track from queue by its number |
| `!nowplaying` | `!np` | `/nowplaying` | Display current track info with interactive controls |
| `!loop [mode]` | `!l` | `/loop` | Set loop mode (`track`, `queue`, `autoplay`, `off`) |
| `!volume <0-100>` | `!v`, `!vol` | `/volume` | Set playback volume percentage |
| `!help` | `!h` | `/help` | Show commands guide |
