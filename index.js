const express = require('express');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.send('CHARLES-OFFICIAL BOT IS ALIVE ✅'));

let sockGlobal = null;
let lastPairCode = '';

// ===== PAIR API - SIMPLE LIKE FIRST TIME =====
app.get('/pair', async (req, res) => {
  const num = (req.query.num || process.env.PAIRING_NUMBER || '').replace(/[^0-9]/g, '');
  if (!num) return res.json({ error: 'Put ?num=2348152544750' });
  if (!sockGlobal) return res.json({ error: 'Bot never start yet, wait 10 sec' });
  try {
    const code = await sockGlobal.requestPairingCode(num);
    lastPairCode = code;
    return res.json({ code });
  } catch (e) {
    return res.json({ error: e.message });
  }
});
app.get('/code', (req, res) => res.json({ code: lastPairCode }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server on port ' + PORT));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['CHARLES-OFFICIAL', 'Chrome', '1.0']
  });
  sockGlobal = sock;
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log('✅ CONNECTED - CHARLES-OFFICIAL DON PAIR!');
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log('Connection closed, reason:', reason);
      if (reason !== DisconnectReason.loggedOut) {
        console.log('Reconnecting...');
        setTimeout(startBot, 3000);
      } else {
        console.log('LOGGED OUT - Go /pair to pair again');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const chatId = m.key.remoteJid;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || '';

      // ===== MENU - PIC UP, COMMANDS FOLLOW TOGETHER =====
      if (text.trim() === '.menu' || text.trim() === '.help') {
        const caption = `👑 *CHARLES-OFFICIAL BOT* 👑\n━━━━━━━━━━━━━━━━\n\n👑 *OWNER*\n.mode public / private\n.group on / off\n.owner\n\n📢 *CHANNEL - SERVER VOTE / REACT*\n.creact <link> ❤️ 10\n.cvote <link> Asake 20\n.react <link> 🔥\n.vote <link> Asake\n\n👥 *GROUP*\n.kick @user\n.tagall\n.promote / .demote\n.mute / .unmute\n.link\n\n⬇️ *DOWNLOAD*\n.play <song>\n.video <name>\n.tiktok <link>\n.ig <link>\n\n🎭 *FUN*\n.sticker\n.vv\n.ai <question>\n.ping / .alive\n━━━━━━━━━━━━━━━━\n*Powered by CHARLES-OFFICIAL* ✅`;
        if (fs.existsSync('./menu.jpg')) {
          await sock.sendMessage(chatId, { image: fs.readFileSync('./menu.jpg'), caption });
        } else {
          await sock.sendMessage(chatId, { text: caption });
        }
        return;
      }

      if (text.trim() === '.ping') {
        await sock.sendMessage(chatId, { text: 'Pong! ✅ CHARLES-OFFICIAL dey alive!' });
        return;
      }
      if (text.trim() === '.alive') {
        await sock.sendMessage(chatId, { text: '👑 CHARLES-OFFICIAL BOT IS ALIVE ✅' });
        return;
      }
      // REACT - reply message
      if (text.startsWith('.react')) {
        const emoji = text.split(' ')[1] || '❤️';
        await sock.sendMessage(chatId, { react: { text: emoji, key: m.key } });
        return;
      }
      // VOTE - simple group vote
      if (text.startsWith('.vote')) {
        await sock.sendMessage(chatId, { text: '📊 Vote received! Use .menu to see server vote commands.' });
        return;
      }
    } catch (e) { console.log('Message error:', e.message); }
  });
}

startBot();
