const express = require('express');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const app = express();
app.get('/', (req, res) => res.send('CHARLES-OFFICIAL BOT IS ALIVE ✅'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server on port ' + PORT));

const PAIRING_NUMBER = (process.env.PAIRING_NUMBER || '2348152544750').replace(/[^0-9]/g, '');
console.log('PAIRING NUMBER:', PAIRING_NUMBER);

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['CHARLES-OFFICIAL', 'Chrome', '1.0']
  });
  sock.ev.on('creds.update', saveCreds);

  // ===== LIKE BEFORE - SHOW CODE FOR RENDER LOGS =====
  if (!sock.authState.creds.registered) {
    console.log('⏳ Waiting 5 sec to generate pairing code...');
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PAIRING_NUMBER);
        console.log('====================================');
        console.log('🔗 PAIRING CODE FOR RENDER: ' + code);
        console.log('🔗 NUMBER: ' + PAIRING_NUMBER);
        console.log('🔗 Go WhatsApp > Linked Devices > Link with phone number');
        console.log('====================================');
      } catch (e) {
        console.log('❌ Pair code error:', e.message);
      }
    }, 5000);
  }

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
        console.log('LOGGED OUT - Check Render Logs for new code');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const chatId = m.key.remoteJid;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
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
      }
    } catch (e) { console.log('Message error:', e.message); }
  });
}
startBot();
