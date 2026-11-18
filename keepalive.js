const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req,res)=> res.send('<h1>CHARLES OFFICIAL BOT ONLINE ✅</h1><p>Check Render Logs for Pairing Code</p>'));
app.get('/pair', (req,res)=> res.send('<h1>Check Render Logs For Pairing Code</h1>'));
const server = app.listen(PORT, ()=> console.log('🌐 KeepAlive on port '+PORT));
server.on('error', (e)=>{
  console.log('⚠️ KeepAlive port error (ignore):', e.message);
  // No crash - bot continue
});
