const fs = require('fs');
let t = fs.readFileSync('index.js','utf8');
// Make owner an array - add YOUR personal number here
t = t.replace('const OWNER_NUMBER = "2348152544750";', 'const OWNER_NUMBERS = ["2348152544750", "2348152544750", "2347026531211"]; 
t = t.replace('const isOwner = (sender) => sender.includes(OWNER_NUMBER);', 'const isOwner = (sender) => OWNER_NUMBERS.some(n => sender.includes(n));');
fs.writeFileSync('index.js', t);
console.log("OWNER FIXED - NOW EDIT YOUR NUMBER");
