const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();
app.get('/', (req,res)=> res.send('CHARLES OFFICIAL V1.1 ONLINE'));
app.listen(process.env.PORT || 3000, ()=> console.log('Port open V1.1'));
async function start(){
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      try{
        const code = await sock.requestPairingCode('2348152544750');
        console.log('=== V1.1 PAIRING CODE: '+code+' ===');
      }catch(e){ console.log('Pairing error', e.message); }
    }, 3000);
  }
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('BOT V1.1 CONNECTED!');
    if(u.connection==='close'){ console.log('Reconnecting...'); setTimeout(()=> start(), 5000); }
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0];
    if(!m.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    const cmd = text.trim().toLowerCase();
    console.log('Got:', text);
    if(cmd === '.menu' || cmd === '.help'){
      await sock.sendMessage(from, { text: `*╭── CHARLES OFFICIAL V1.1 ──╮*\n\n*🔥 MAIN MENU*\n│ .menu - Show menu\n│ .ping - Speed test\n│ .alive - Bot alive?\n│ .owner - Owner info\n│ .info - Bot info\n│ .time - Lagos time\n\n*🎨 MEDIA*\n│ .sticker - Reply image + .sticker\n\n*Made by CHARLES OFFICIAL*\n*╰──────────────────────╯*` }, { quoted: m });
    }
    if(cmd === '.ping') await sock.sendMessage(from, { text: 'Pong! 🏓 *V1.1* - Speed: Fast ⚡' }, { quoted: m });
    if(cmd === '.alive') await sock.sendMessage(from, { text: '*CHARLES OFFICIAL V1.1* dey ALIVE ✅' }, { quoted: m });
    if(cmd === '.owner') await sock.sendMessage(from, { text: '*OWNER INFO*\nName: CHARLES OFFICIAL\nNumber: +2348152544750\nBot: V1.1' }, { quoted: m });
    if(cmd === '.info') await sock.sendMessage(from, { text: '*BOT INFO*\nName: CHARLES OFFICIAL\nVersion: V1.1\nStatus: Online ✅\nPlatform: Render' }, { quoted: m });
    if(cmd === '.time') await sock.sendMessage(from, { text: '🕐 Lagos Time: ' + new Date().toLocaleString('en-NG',{timeZone:'Africa/Lagos'}) }, { quoted: m });
    if(cmd === '.sticker'){
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      if(quoted){
        await sock.sendMessage(from, { text: 'Creating sticker... ⏳' }, { quoted: m });
        const stream = await downloadContentFromMessage(quoted, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(from, { sticker: buffer }, { quoted: m });
      } else {
        await sock.sendMessage(from, { text: 'Reply one image with *.sticker*' }, { quoted: m });
      }
    }
  });
}
start();
