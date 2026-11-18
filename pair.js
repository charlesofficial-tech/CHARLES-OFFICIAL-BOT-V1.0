const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Charles Official','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('PAIRED SUCCESS - BOT CONNECTED!');
    if(u.connection==='close') console.log('Closed - run node pair.js again');
  });
  // Wait 5 secs for socket to connect, then ask code ONCE
  await new Promise(r => setTimeout(r, 5000));
  if(!sock.authState.creds.registered){
    try{
      const code = await sock.requestPairingCode('2348152544750');
      console.log('=== YOUR CODE: ' + code + ' ===');
      console.log('TYPE AM NOW - 60 SECS!');
    }catch(e){ console.log('Error:', e.message); }
  }
}
start();
