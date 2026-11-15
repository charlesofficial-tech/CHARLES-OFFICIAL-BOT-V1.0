const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();
app.get('/', (req,res)=> res.send('CHARLES OFFICIAL ONLINE'));
app.listen(process.env.PORT || 3000, ()=> console.log('Port open'));

let tried = false;
async function start(){
  if(tried) return;
  tried = true;
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    if(u.connection==='open'){ console.log('BOT CONNECTED!'); tried = false; }
    if(u.connection==='close'){ console.log('Closed, will retry once in 10 secs'); tried = false; setTimeout(()=> start(), 10000); }
  });
  if(!sock.authState.creds.registered){
    await new Promise(r => setTimeout(r, 8000));
    try{
      const code = await sock.requestPairingCode('2348152544750');
      console.log('=== RENDER PAIRING CODE: ' + code + ' ===');
      console.log('TYPE AM NOW - NA ONLY THIS ONE CODE, NO MORE NEW CODE!');
    }catch(e){ console.log('Pairing error:', e.message); tried = false; }
  }
  sock.ev.on('messages.upsert', async (m)=>{ console.log('New message'); });
}
start();
