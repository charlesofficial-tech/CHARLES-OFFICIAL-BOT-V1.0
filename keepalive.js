// Keep Render alive - Render needs a port
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req,res)=> res.send('<h1>CHARLES OFFICIAL BOT IS ONLINE ✅</h1><p>Check Render Logs for Pairing Code</p>'));
app.get('/pair', (req,res)=> res.send('<h1>Check Render Logs for Pairing Code</h1>'));
app.listen(PORT, ()=> console.log('🌐 KeepAlive on port '+PORT));
module.exports = app;
