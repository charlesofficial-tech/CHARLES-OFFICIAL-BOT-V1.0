const fs = require('fs');
let t = fs.readFileSync('index.js','utf8');
t = t.replace('CHARLES OFFICIAL V4', 'CHARLES OFFICIAL V5');
t = t.replace('│ • .news', '│ • .news\n│ • .dice\n│ • .coinflip\n│ • .truth\n│ • .dare\n│ • .ship @user\n│ • .qr <text>\n│ • .translate <text>\n│ • .tiktok <link>');
t = t.replace('│ • .tagall <msg>', '│ • .tagall <msg>\n│ • .hidetag <msg>\n│ • .antilink on/off\n│ • .owner2');
fs.writeFileSync('index.js', t);
console.log("MENU UPDATED TO V5");
