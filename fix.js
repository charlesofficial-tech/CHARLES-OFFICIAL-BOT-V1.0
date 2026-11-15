const fs = require('fs');
let t = fs.readFileSync('index.js','utf8');
// Revert bad debug line if any
t = t.replace(/sock\.ev\.on\('connection\.update', async \(update\) => \{ console\.log\('CONNECTION:'.*?\n    sock\.ev\.on\('connection\.update2'/s, "sock.ev.on('connection.update'");
// Ensure pairing triggers on connecting
t = t.replace("if (!sock.authState.creds.registered && !pairingRequested && connection === 'open')", "if (!sock.authState.creds.registered && !pairingRequested && connection === 'connecting')");
t = t.replace("if (!sock.authState.creds.registered && !pairingRequested && connection === 'open')", "if (!sock.authState.creds.registered && !pairingRequested && connection === 'connecting')");
// Add log for every connection change
if (!t.includes("console.log('STATUS:'")) {
  t = t.replace("sock.ev.on('connection.update', async (update) => {", "sock.ev.on('connection.update', async (update) => { console.log('STATUS:', update.connection);");
}
fs.writeFileSync('index.js', t);
console.log("FIXED");
