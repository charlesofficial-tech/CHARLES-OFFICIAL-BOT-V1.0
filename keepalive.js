const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req,res)=> res.send('<h1>CHARLES OFFICIAL BOT ONLINE ✅</h1><p>Check Render Logs for Pairing Code</p>'));
const server = app.listen(PORT, ()=> console.log('🌐 KeepAlive on port '+PORT));
server.on('error', (e)=> console.log('⚠️ KeepAlive error (ignore):', e.message));
