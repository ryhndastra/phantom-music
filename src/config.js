require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  prefix: process.env.PREFIX || '!',
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME || '100', 10),
  colors: {
    primary: 0x5865F2, 
    success: 0x57F287, 
    warning: 0xFEE75C, 
    danger: 0xED4245,  
    dark: 0x2B2D31,    
  }
};
