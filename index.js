const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Charles Official','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('BOT CONNECTED - CHARLES OFFICIAL ONLINE!');
    if(u.connection==='close'){ console.log('Reconnecting...'); start(); }
  });
  // PAIRING CODE FOR RENDER LOGS - LIKE BEFORE
  if(!sock.authState.creds.registered){
    await new Promise(r => setTimeout(r, 5000));
    try{
      const code = await sock.requestPairingCode('2348152544750');
      console.log('=== RENDER PAIRING CODE: ' + code + ' ===');
      console.log('Go WhatsApp > Linked Devices > Link with phone number > Type this code');
    }catch(e){ console.log('Pairing error:', e.message); }
  }
  sock.ev.on('messages.upsert', async (m)=>{ console.log('New message'); });
}
start();
