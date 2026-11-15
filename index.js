const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();
app.get('/', (req,res)=> res.send('CHARLES OFFICIAL ONLINE'));
app.listen(process.env.PORT || 3000, ()=> console.log('Port open'));

async function start(){
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('BOT CONNECTED!');
    if(u.connection==='close'){ console.log('Reconnecting...'); setTimeout(()=> start(), 5000); }
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0];
    if(!m.message || m.key.fromMe) return;
    const from = m.key.remoteJid;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    console.log('Got:', text);

    if(text.trim() === '.menu'){
      await sock.sendMessage(from, { text: `*CHARLES OFFICIAL BOT V1.0* 🔥\n\n╭─ MENU ─╮\n│ .menu - Show menu\n│ .ping - Check speed\n│ .owner - Owner info\n│ .alive - Bot alive?\n╰──────────╯\n\nMade by CHARLES OFFICIAL` }, { quoted: m });
    }
    if(text.trim() === '.ping'){
      await sock.sendMessage(from, { text: 'Pong! 🏓 Bot dey active - ' + new Date().toLocaleTimeString() }, { quoted: m });
    }
    if(text.trim() === '.alive'){
      await sock.sendMessage(from, { text: 'CHARLES OFFICIAL BOT dey ALIVE ✅' }, { quoted: m });
    }
    if(text.trim() === '.owner'){
      await sock.sendMessage(from, { text: 'Owner: CHARLES OFFICIAL\nNumber: +2348152544750' }, { quoted: m });
    }
  });
}
start();
