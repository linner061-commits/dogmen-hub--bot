const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let qrCode = null;
let isReady = false;

// Initialize WhatsApp client
function initWhatsApp() {
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "whatsapp-bot"
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    console.log('QR Received');
    qrCode = await qrcode.toDataURL(qr);
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isReady = true;
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Authenticated!');
  });

  client.on('auth_failure', () => {
    console.log('WhatsApp Auth Failed');
    isReady = false;
  });

  client.on('disconnected', () => {
    console.log('WhatsApp Disconnected');
    isReady = false;
    // Reinitialize after disconnect
    setTimeout(() => {
      initWhatsApp();
      client.initialize();
    }, 5000);
  });

  // Handle incoming messages
  client.on('message', async (message) => {
    if (message.body.startsWith('.')) {
      const command = message.body.split(' ')[0].toLowerCase();
      const query = message.body.slice(command.length).trim();

      let response = '';

      switch(command) {
        case '.movie':
          if (!query) {
            response = '🎬 Usage: .movie <query>\nExample: .movie avengers';
          } else {
            response = `🎬 Movie Search: "${query}"\n🔗 https://www.themoviedb.org/search?query=${encodeURIComponent(query)}`;
          }
          break;

        case '.yt':
          if (!query) {
            response = '📺 Usage: .yt <query>\nExample: .yt funny cats';
          } else {
            response = `📺 YouTube Search: "${query}"\n🔗 https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          }
          break;

        case '.gg':
          if (!query) {
            response = '🔍 Usage: .gg <query>\nExample: .gg weather today';
          } else {
            response = `🔍 Google Search: "${query}"\n🔗 https://www.google.com/search?q=${encodeURIComponent(query)}`;
          }
          break;

        case '.tt':
          if (!query) {
            response = '📱 Usage: .tt <query>\nExample: .tt dance tutorial';
          } else {
            response = `📱 TikTok Search: "${query}"\n🔗 https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
          }
          break;

        case '.ping':
          response = `🏓 Bot is active!\n\n📢 WhatsApp Channel:\nhttps://whatsapp.com/channel/0029Vb71mgIElaglZCU0je0x\n\nType .menu for all commands`;
          break;

        case '.menu':
          response = `🤖 BOT MENU 🤖\n\n🎬 .movie <query> - Search movies\n📺 .yt <query> - Search YouTube\n🔍 .gg <query> - Search Google\n📱 .tt <query> - Search TikTok\n🏓 .ping - Bot status\n📖 .menu - Show this menu`;
          break;

        default:
          response = '❌ Unknown command. Type .menu for available commands.';
      }

      await message.reply(response);
    }
  });

  client.initialize();
}

// Initialize on first load
if (!client) {
  initWhatsApp();
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    if (req.query.action === 'qr') {
      if (qrCode) {
        res.status(200).json({ 
          success: true, 
          qrCode: qrCode,
          status: 'Scan QR code with WhatsApp'
        });
      } else {
        res.status(200).json({ 
          success: false, 
          status: 'Generating QR code...' 
        });
      }
      return;
    }

    if (req.query.action === 'status') {
      res.status(200).json({ 
        ready: isReady,
        status: isReady ? 'Connected to WhatsApp' : 'Not connected'
      });
      return;
    }

    // Send test message
    if (req.query.action === 'test' && req.query.number && req.query.message) {
      if (!isReady) {
        res.status(400).json({ error: 'WhatsApp not connected' });
        return;
      }

      try {
        const chatId = `${req.query.number}@c.us`;
        await client.sendMessage(chatId, req.query.message);
        res.status(200).json({ success: true, message: 'Message sent' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      return;
    }
  }

  res.status(200).json({ 
    message: 'WhatsApp Bot API',
    endpoints: {
      '/api/whatsapp?action=qr': 'Get QR code',
      '/api/whatsapp?action=status': 'Check connection status',
      '/api/whatsapp?action=test&number=123&message=hello': 'Send test message'
    }
  });
};
