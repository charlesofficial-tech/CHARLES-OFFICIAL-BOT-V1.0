const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
async function start(){
  const { version } = await fetchLatestBaileysVersion();
  console.log('Using Baileys version:', version);
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sock.ev.on('creds.update', saveCreds);
  let codeSent = false;
  sock.ev.on('connection.update', async (u)=>{
    console.log('Connection:', u.connection);
    if(u.connection==='open') console.log('BOT CONNECTED!');
    if(u.connection==='close'){ console.log('Reconnecting in 5 secs...'); setTimeout(()=> start(), 5000); }
    // Request code ONLY ONCE, after socket don connect small
    if(!sock.authState.creds.registered && !codeSent && u.connection !== 'close'){
      codeSent = true;
      await new Promise(r => setTimeout(r, 8000));
      try{
        const code = await sock.requestPairingCode('2348152544750');
        console.log('=== RENDER PAIRING CODE: ' + code + ' ===');
      }catch(e){ console.log('Pairing error:', e.message); codeSent = false; }
    }
  });
  sock.ev.on('messages.upsert', async (m)=>{ console.log('New message'); });
}
start();
