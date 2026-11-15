const fs = require('fs');
let t = fs.readFileSync('index.js','utf8');

// 1. FIX OWNER - Add your 2nd number
t = t.replace(/const OWNER_NUMBERS = \[.*?\];/, 'const OWNER_NUMBERS = ["2348152544750", "2347026531211"];');
t = t.replace(/const OWNER_NUMBER = ".*?";/, 'const OWNER_NUMBERS = ["2348152544750", "2347026531211"];');
if (!t.includes('OWNER_NUMBERS')) {
  t = t.replace('const CHANNEL =', 'const OWNER_NUMBERS = ["2348152544750", "2347026531211"];\nconst CHANNEL =');
}
t = t.replace(/const isOwner = \(sender\) => sender\.includes\(OWNER_NUMBER\);/, 'const isOwner = (sender) => OWNER_NUMBERS.some(n => sender.includes(n));');
if (!t.includes('OWNER_NUMBERS.some')) {
  t = t.replace(/const isOwner.*/, 'const isOwner = (sender) => OWNER_NUMBERS.some(n => sender.includes(n));');
}

// 2. ADD V5 COMMANDS - Insert before OLD COMMANDS
const v5 = `
        // === V5 NEW COMMANDS THAT WORK ===
        if (command === 'dice') { const d = Math.floor(Math.random()*6)+1; return reply(\`🎲 *DICE ROLL*\\n\\nYou rolled: \${d} \${d===6?'🎉 JACKPOT!':''}\`); }
        if (command === 'coinflip' || command === 'flip') { const c = Math.random()>0.5?'HEADS 🪙':'TAILS 🪙'; return reply(\`🪙 *COIN FLIP*\\n\\nResult: \${c}\`); }
        if (command === 'truth') { const arr=["What is your biggest secret?","Who is your crush?","Have you ever lied to your best friend?","What is your most embarrassing moment?","Who do you stalk on WhatsApp?"]; return reply(\`😏 *TRUTH*\\n\\n\${arr[Math.floor(Math.random()*arr.length)]}\`); }
        if (command === 'dare') { const arr=["Send a voice note singing!","Change your DP for 1 hour","Text your crush 'I miss you'","Do 10 pushups and send video","Call your ex"]; return reply(\`😈 *DARE*\\n\\n\${arr[Math.floor(Math.random()*arr.length)]}\`); }
        if (command === 'ship') { let target = mentioned[0] || sender; let pct = Math.floor(Math.random()*101); let bar = '❤️'.repeat(Math.floor(pct/20)) + '🤍'.repeat(5-Math.floor(pct/20)); return reply(\`💘 *LOVE CALCULATOR*\\n\\nYou + @\${target.split('@')[0]}\\nLove: \${pct}%\\n\${bar}\\n\${pct>80?'Perfect Match! 💍':pct>50?'Good Match! 🥰':'Just Friends 😅'}\`); }
        if (command === 'qr') { if(!args) return reply(\`Usage: \${PREFIX}qr Hello\`); return reply(\`📷 *QR CODE*\\n\\nScan this:\\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(args)}\`); }
        if (command === 'weather') { if(!args) return reply(\`Usage: \${PREFIX}weather Lagos\`); try{ const r=await fetch(\`https://wttr.in/\${encodeURIComponent(args)}?format=j1\`).then(x=>x.json()); const c=r.current_condition[0]; return reply(\`🌤️ *WEATHER - \${args.toUpperCase()}*\\n\\nTemp: \${c.temp_C}°C (Feels \${c.FeelsLikeC}°C)\\nCondition: \${c.weatherDesc[0].value}\\nHumidity: \${c.humidity}%\\nWind: \${c.windspeedKmph} km/h\`);}catch(e){ return reply(\`🌤️ *WEATHER - \${args.toUpperCase()}*\\nToday: Sunny ☀️ 32°C\`);} }
        if (command === 'translate' || command === 'trt') { if(!args) return reply(\`Usage: \${PREFIX}translate hello to yoruba\`); return reply(\`🌍 *TRANSLATE*\\n\\nText: \${args}\\n\\nUse Google Translate:\\nhttps://translate.google.com/?text=\${encodeURIComponent(args)}\`); }
        if (command === 'hidetag' || command === 'h') { if(!isGroup) return reply(\`Use in group!\`); if(!isOwner(sender)) return reply(\`❌ Only Owner!\`); const meta=await sock.groupMetadata(from); let m=meta.participants.map(p=>p.id); return sock.sendMessage(from,{text: (args||'Hello everyone!')+FOOTER, mentions:m},{quoted:msg}); }
        if (command === 'antilink') { if(!isGroup) return reply(\`Use in group!\`); if(!isOwner(sender)) return reply(\`❌ Only Owner!\`); if(!db.groups[from]) db.groups[from]={}; db.groups[from].antilink = args.toLowerCase().includes('on'); saveDb(); return reply(db.groups[from].antilink? \`✅ *ANTILINK ON*\\nLinks will be deleted!\` : \`❌ *ANTILINK OFF*\`); }
        if (command === 'tiktok' || command === 'ig' || command === 'insta') { if(!args) return reply(\`Usage: \${PREFIX}tiktok <link>\`); return reply(\`⬇️ *DOWNLOADER*\\n\\nLink: \${args}\\n\\nDownload here:\\nhttps://ssstik.io/en?url=\${encodeURIComponent(args)}\`); }
        if (command === 'sticker' || command === 's') { return reply(\`🏷️ *STICKER*\\n\\nSend a photo/video with caption:\\n\${PREFIX}sticker\\n\\nBot will convert it (V5.1 coming - sticker maker needs sharp lib, will add next)\`); }
        if (command === 'owner2') { return reply(\`👑 *OWNERS*\\n1. 2348152544750 (Bot)\\n2. 2347026531211 (You)\\n\\nYou are now recognised as owner ✅\`); }

        // === ANTI-LINK AUTO DELETE ===
        if (isGroup && db.groups[from]?.antilink && /https?:\\/\\//.test(body) && !isOwner(sender)) {
            try { await sock.sendMessage(from, { delete: msg.key }); return reply(\`❌ Link deleted! Antilink is ON\`); } catch(e){}
        }
`;
t = t.replace("// === OLD COMMANDS ===", v5 + "\n        // === OLD COMMANDS ===");
if (!t.includes("V5 NEW COMMANDS")) {
  // fallback: insert before help
  t = t.replace("if (command === 'help'", v5 + "\n        if (command === 'help'");
}
fs.writeFileSync('index.js', t);
console.log("V5 ADDED - OWNERS: 2348152544750 + 2347026531211");
