FROM node:22-bookworm-slim

# Install ffmpeg dan build dependencies untuk audio encoder
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependensi
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Jalankan bot
CMD ["node", "src/index.js"]

