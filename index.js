const http = require('http');
http.createServer((req,res)=>{ res.writeHead(200); res.end("CHARLES OFFICIAL V4 IS ONLINE 24/7"); }).listen(process.env.PORT || 10000, ()=> console.log("WEB SERVER ON PORT " + (process.env.PORT || 10000)));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const BOT_NAME = "CHARLES OFFICIAL";
const PREFIX = ".";
const OWNER_NUMBER = "2348152544750";
const CHANNEL = "https://whatsapp.com/channel/0029Vb8o52c9MF8ztahPbI43";
const FOOTER = `\n\n━━━━━━━━━━━━\n📢 View Channel Down 👇\n${CHANNEL}`;
const PHONE = process.env.BOT_NUMBER || "2348152544750";

let db = { users: {}, groups: {}, antiStatus: false };
if (fs.existsSync('db.json')) db = JSON.parse(fs.readFileSync('db.json'));
const saveDb = () => fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
const isOwner = (sender) => sender.includes(OWNER_NUMBER);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: state, browser: ["Ubuntu", "Chrome", "20.0.04"], syncFullHistory: false, markOnlineOnConnect: false });
    let pairingRequested = false;
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => { console.log('STATUS:', update.connection);
        const { connection, lastDisconnect } = update;
        if (!sock.authState.creds.registered && !pairingRequested && connection === 'connecting') {
            pairingRequested = true; await delay(3000);
            try {
                let code = await sock.requestPairingCode(PHONE);
                console.log("\n==============================");
                console.log("YOUR PAIRING CODE: " + code);
                console.log("==============================\n");
            } catch (e) { console.log("Pairing failed: " + e.message); pairingRequested = false; }
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) setTimeout(() => startBot(), 5000);
        } else if (connection === 'open') { console.log(`\n✅ ${BOT_NAME} V4 IS ONLINE 24/7!`); }
    });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify' && db.antiStatus) { for (let m of messages) { if (m.key.remoteJid === 'status@broadcast') await sock.readMessages([m.key]); } }
    });
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        const g = db.groups[id]; if (!g) return;
        for (let p of participants) {
            if (action === 'add' && g.welcome) await sock.sendMessage(id, { text: `👋 Welcome @${p.split('@')[0]}!\n\n${g.welcome}${FOOTER}`, mentions: [p] });
            if (action === 'remove' && g.goodbye) await sock.sendMessage(id, { text: `👋 Goodbye @${p.split('@')[0]} 😢\n\n${g.goodbye}${FOOTER}`, mentions: [p] });
        }
    });
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]; if (!msg.message) return;
        const from = msg.key.remoteJid; const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (!body.startsWith(PREFIX)) return;
        const full = body.slice(PREFIX.length).trim();
        const command = full.split(' ')[0].toLowerCase(); const args = full.split(' ').slice(1).join(' ');
        const reply = (text) => sock.sendMessage(from, { text: text + FOOTER }, { quoted: msg });
        if (!db.users[sender]) db.users[sender] = { coins: 0, lastDaily: 0, lastClaim: 0 }; saveDb();

        // === 1. REAL AI ===
        if (command === 'ai') {
            if (!args) return reply(`Usage: ${PREFIX}ai What is football?`);
            await sock.sendMessage(from, { text: `🤖 Thinking...` }, { quoted: msg });
            try {
                const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent("You are CHARLES OFFICIAL, a helpful Nigerian WhatsApp bot by UCHENDU CHARLES. Answer short and fun. Question: " + args)}`);
                const ans = await res.text();
                return reply(`🤖 *CHARLES AI*\n\n${ans}`);
            } catch(e){ return reply(`🤖 *CHARLES AI*\n\nSorry, AI is busy. Try again.`); }
        }

        // === 2. REAL SONG / VIDEO ===
        if (command === 'play' || command === 'song' || command === 'music') {
            if (!args) return reply(`Usage: ${PREFIX}play Asake - Lonely At The Top`);
            await reply(`🎶 *SEARCHING...*\nSong: ${args}\nPlease wait...`);
            try {
                const search = await fetch(`https://yt.lemnoslife.com/noKey/search?part=snippet&q=${encodeURIComponent(args)}&type=video&maxResults=1`).then(r=>r.json());
                const vid = search.items?.[0];
                if (!vid) return reply(`❌ Not found: ${args}`);
                const title = vid.snippet.title; const vidId = vid.id.videoId;
                const dl = `https://www.youtube.com/watch?v=${vidId}`;
                return reply(`🎶 *NOW PLAYING*\n\nTitle: ${title}\nLink: ${dl}\n\n📥 Download MP3:\nhttps://ytmp3.com/?url=${encodeURIComponent(dl)}\n\nOr open YouTube link above to listen.`);
            } catch(e){ return reply(`🎶 *NOW PLAYING*\nSong: ${args}\nLink: https://youtube.com/results?search_query=${encodeURIComponent(args)}`); }
        }
        if (command === 'video') {
            if (!args) return reply(`Usage: ${PREFIX}video Funny cats`);
            return reply(`🎬 *VIDEO SEARCH*\nQuery: ${args}\nWatch: https://youtube.com/results?search_query=${encodeURIComponent(args)}`);
        }

        // === 3. OWNER COMMANDS ===
        if (command === 'broadcast' || command === 'bc') {
            if (!isOwner(sender)) return reply(`❌ Only Owner can use this!`);
            if (!args) return reply(`Usage: ${PREFIX}broadcast Hello everyone!`);
            let count = 0;
            for (let u of Object.keys(db.users)) { try { await sock.sendMessage(u, { text: `📢 *BROADCAST FROM CHARLES OFFICIAL*\n\n${args}${FOOTER}` }); count++; await delay(500); } catch(e){} }
            return reply(`✅ Broadcast sent to ${count} users!`);
        }
        if (command === 'kick') {
            if (!isGroup) return reply(`Use in group!`);
            if (!isOwner(sender)) return reply(`❌ Only Owner!`);
            let target = mentioned[0]; if (!target) return reply(`Reply/tag person: ${PREFIX}kick @user`);
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            return reply(`✅ Kicked @${target.split('@')[0]}`);
        }
        if (command === 'promote') {
            if (!isGroup) return reply(`Use in group!`);
            let target = mentioned[0]; if (!target) return reply(`Usage: ${PREFIX}promote @user`);
            await sock.groupParticipantsUpdate(from, [target], 'promote');
            return reply(`✅ Promoted @${target.split('@')[0]} to admin!`);
        }
        if (command === 'demote') {
            if (!isGroup) return reply(`Use in group!`);
            let target = mentioned[0]; if (!target) return reply(`Usage: ${PREFIX}demote @user`);
            await sock.groupParticipantsUpdate(from, [target], 'demote');
            return reply(`✅ Demoted @${target.split('@')[0]}`);
        }
        if (command === 'tagall') {
            if (!isGroup) return reply(`Use in group!`);
            if (!isOwner(sender)) return reply(`❌ Only Owner!`);
            const meta = await sock.groupMetadata(from); let txt = `📢 *TAG ALL*\n\n${args || "Attention everyone!"}\n\n`; let m=[]; for(let p of meta.participants){ txt += `@${p.id.split('@')[0]} `; m.push(p.id); }
            return sock.sendMessage(from, { text: txt + FOOTER, mentions: m }, { quoted: msg });
        }

        // === OLD COMMANDS ===
        if (command === 'help' || command === 'menu') return reply(`╭───「 *${BOT_NAME} V4* 」───\n│ 👑 OWNER: UCHENDU CHARLES\n│\n├─ *GENERAL*\n│ • ${PREFIX}help\n│ • ${PREFIX}info\n│ • ${PREFIX}ping\n│ • ${PREFIX}owner\n│ • ${PREFIX}anti status\n│\n├─ *ECONOMY*\n│ • ${PREFIX}claim\n│ • ${PREFIX}daily\n│\n├─ *AI & MEDIA*\n│ • ${PREFIX}ai <ask> - REAL AI 🤖\n│ • ${PREFIX}play <song> - REAL SEARCH 🎶\n│ • ${PREFIX}video <name>\n│ • ${PREFIX}sticker\n│ • ${PREFIX}download <link>\n│ • ${PREFIX}search <query>\n│ • ${PREFIX}weather <city>\n│ • ${PREFIX}news\n│\n├─ *FUN*\n│ • ${PREFIX}joke\n│ • ${PREFIX}quote\n│\n├─ *GROUP*\n│ • ${PREFIX}group\n│ • ${PREFIX}set welcome <msg>\n│ • ${PREFIX}set goodbye <msg>\n│\n├─ *OWNER ONLY 👑*\n│ • ${PREFIX}broadcast <msg>\n│ • ${PREFIX}kick @user\n│ • ${PREFIX}promote @user\n│ • ${PREFIX}demote @user\n│ • ${PREFIX}tagall <msg>\n│\n╰─── *PVP CHARLES* ───`);
        if (command === 'info') return reply(`🤖 *${BOT_NAME}*\nVersion: V4\nOwner: UCHENDU CHARLES\nStatus: Online ✅ 24/7`);
        if (command === 'ping') return reply(`Pong! 🏓\nCHARLES OFFICIAL V4 is active`);
        if (command === 'owner') return reply(`👑 *OWNER*\nName: UCHENDU CHARLES\nBot: CHARLES OFFICIAL\nWhatsApp: wa.me/2348152544750`);
        if (body.toLowerCase().includes('anti status')) { db.antiStatus = !db.antiStatus; saveDb(); return reply(db.antiStatus ? `✅ *ANTI STATUS ON*` : `❌ *ANTI STATUS OFF*`); }
        if (command === 'claim') { const now = Date.now(); if (now - db.users[sender].lastClaim < 3600000) return reply(`⏳ Already claimed! Wait 1 hour.`); db.users[sender].coins += 100; db.users[sender].lastClaim = now; saveDb(); return reply(`🎁 *CLAIM SUCCESS!*\n+100 coins 🪙\nBalance: ${db.users[sender].coins}`); }
        if (command === 'daily') { const now = Date.now(); if (now - db.users[sender].lastDaily < 86400000) return reply(`⏳ Daily already claimed! Come tomorrow.`); db.users[sender].coins += 500; db.users[sender].lastDaily = now; saveDb(); return reply(`🎉 *DAILY REWARD!*\n+500 coins 🪙\nBalance: ${db.users[sender].coins}`); }
        if (command === 'image') return reply(`🎨 *IMAGE*\nGenerating for: "${args}"\nImage API coming in V5.`);
        if (command === 'sticker') return reply(`🏷️ *STICKER*\nSend photo with caption ${PREFIX}sticker`);
        if (command === 'download') return reply(`⬇️ *DOWNLOADER*\nLink: ${args}`);
        if (command === 'search') return reply(`🔎 *SEARCH*\nQuery: "${args}"\nGoogle: https://google.com/search?q=${encodeURIComponent(args)}`);
        if (command === 'weather') return reply(`🌤️ *WEATHER - ${(args||'Lagos').toUpperCase()}*\nToday: Sunny ☀️ 32°C`);
        if (command === 'news') return reply(`📰 *LATEST NEWS*\n1. Super Eagles win! 🇳🇬\n2. CHARLES OFFICIAL BOT trending! 🔥`);
        if (command === 'joke') { const j=["Why did Charles cross the road? To make a bot! 🤖","What do you call a fake noodle? An Impasta! 🍝"]; return reply(`😂 *JOKE*\n\n${j[Math.floor(Math.random()*j.length)]}`); }
        if (command === 'quote') { const q=["Success is not final.","Believe you can and you're halfway there.","Your only limit is your mind. - CHARLES"]; return reply(`✨ *QUOTE*\n\n"${q[Math.floor(Math.random()*q.length)]}"`); }
        if (command === 'group') return reply(`👥 *GROUP INFO*\nBot is active here ✅`);
        if (full.startsWith('set welcome')) { if (!isGroup) return reply(`Use in a group!`); if (!db.groups[from]) db.groups[from]={}; db.groups[from].welcome = args.replace('welcome','').trim() || "Welcome!"; saveDb(); return reply(`✅ Welcome set!`); }
        if (full.startsWith('set goodbye') || full.startsWith('set good bye')) { if (!isGroup) return reply(`Use in a group!`); if (!db.groups[from]) db.groups[from]={}; db.groups[from].goodbye = args.replace('goodbye','').replace('good bye','').trim() || "Goodbye!"; saveDb(); return reply(`✅ Goodbye set!`); }
    });
}
startBot();
