const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const BOT_NAME = "CHARLES OFFICIAL";
const PREFIX = ".";
const CHANNEL = "https://whatsapp.com/channel/0029Vb8o52c9MF8ztahPbI43";
const FOOTER = `\n\n━━━━━━━━━━━━\n📢 View Channel Down 👇\n${CHANNEL}`;
const PHONE = process.env.BOT_NUMBER || "2348152544750";

let db = { users: {}, groups: {}, antiStatus: false };
if (fs.existsSync('db.json')) db = JSON.parse(fs.readFileSync('db.json'));
const saveDb = () => fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: state, browser: ["Ubuntu", "Chrome", "20.0.04"], syncFullHistory: false, markOnlineOnConnect: false });
    let pairingRequested = false;
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (!sock.authState.creds.registered && !pairingRequested && connection === 'connecting') {
            pairingRequested = true; await delay(3000);
            try {
                let code = await sock.requestPairingCode(PHONE);
                console.log("\n==============================");
                console.log("YOUR PAIRING CODE: " + code);
                console.log("Go to WhatsApp > Linked Devices > Link with phone number");
                console.log("==============================\n");
            } catch (e) { console.log("Pairing failed: " + e.message); }
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) setTimeout(() => startBot(), 3000);
        } else if (connection === 'open') {
            console.log(`\n✅ ${BOT_NAME} V2 IS ONLINE 24/7!`);
        }
    });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify' && db.antiStatus) {
            for (let m of messages) { if (m.key.remoteJid === 'status@broadcast') await sock.readMessages([m.key]); }
        }
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
        if (!body.startsWith(PREFIX)) return;
        const full = body.slice(PREFIX.length).trim();
        const command = full.split(' ')[0].toLowerCase(); const args = full.split(' ').slice(1).join(' ');
        const reply = (text) => sock.sendMessage(from, { text: text + FOOTER }, { quoted: msg });
        if (!db.users[sender]) db.users[sender] = { coins: 0, lastDaily: 0, lastClaim: 0 }; saveDb();
        if (command === 'help' || command === 'menu') return reply(`╭───「 *${BOT_NAME}* 」───\n│ 👑 OWNER: UCHENDU CHARLES\n│\n├─ *GENERAL*\n│ • ${PREFIX}help\n│ • ${PREFIX}menu\n│ • ${PREFIX}info\n│ • ${PREFIX}ping\n│ • ${PREFIX}owner\n│ • ${PREFIX}anti status\n│\n├─ *ECONOMY*\n│ • ${PREFIX}claim\n│ • ${PREFIX}daily\n│\n├─ *AI & MEDIA*\n│ • ${PREFIX}ai <ask>\n│ • ${PREFIX}image <prompt>\n│ • ${PREFIX}sticker\n│ • ${PREFIX}song <name>\n│ • ${PREFIX}video <name>\n│ • ${PREFIX}play <name>\n│ • ${PREFIX}download <link>\n│ • ${PREFIX}search <query>\n│ • ${PREFIX}weather <city>\n│ • ${PREFIX}news\n│\n├─ *FUN*\n│ • ${PREFIX}joke\n│ • ${PREFIX}quote\n│\n├─ *GROUP*\n│ • ${PREFIX}group\n│ • ${PREFIX}set welcome <msg>\n│ • ${PREFIX}set goodbye <msg>\n│\n╰─── *PVP CHARLES* ───`);
        if (command === 'info') return reply(`🤖 *${BOT_NAME}*\nVersion: V2\nOwner: UCHENDU CHARLES\nStatus: Online ✅ 24/7`);
        if (command === 'ping') return reply(`Pong! 🏓\nCHARLES OFFICIAL is active`);
        if (command === 'owner') return reply(`👑 *OWNER*\nName: UCHENDU CHARLES\nBot: CHARLES OFFICIAL\nWhatsApp: wa.me/2348152544750`);
        if (body.toLowerCase().includes('anti status')) { db.antiStatus = !db.antiStatus; saveDb(); return reply(db.antiStatus ? `✅ *ANTI STATUS ON*` : `❌ *ANTI STATUS OFF*`); }
        if (command === 'claim') { const now = Date.now(); if (now - db.users[sender].lastClaim < 3600000) return reply(`⏳ Already claimed! Wait 1 hour.`); db.users[sender].coins += 100; db.users[sender].lastClaim = now; saveDb(); return reply(`🎁 *CLAIM SUCCESS!*\n+100 coins 🪙\nBalance: ${db.users[sender].coins}`); }
        if (command === 'daily') { const now = Date.now(); if (now - db.users[sender].lastDaily < 86400000) return reply(`⏳ Daily already claimed! Come tomorrow.`); db.users[sender].coins += 500; db.users[sender].lastDaily = now; saveDb(); return reply(`🎉 *DAILY REWARD!*\n+500 coins 🪙\nBalance: ${db.users[sender].coins}`); }
        if (command === 'ai') { if (!args) return reply(`Usage: ${PREFIX}ai What is football?`); return reply(`🤖 *CHARLES AI*\n\nYou asked: "${args}"\n\nI'm CHARLES OFFICIAL AI! Ask me anything!`); }
        if (command === 'image') return reply(`🎨 *IMAGE*\nGenerating for: "${args}"\nImage API coming in V3.`);
        if (command === 'sticker') return reply(`🏷️ *STICKER*\nSend photo with caption ${PREFIX}sticker`);
        if (command === 'song') return reply(`🎵 *SONG*\nSearching: "${args}"\nUse ${PREFIX}play <name>`);
        if (command === 'video') return reply(`🎬 *VIDEO*\nSearching: "${args}"`);
        if (command === 'play') { if (!args) return reply(`Usage: ${PREFIX}play Asake - Lonely At The Top`); return reply(`🎶 *NOW PLAYING*\nSong: ${args}\nSearch: https://youtube.com/results?search_query=${encodeURIComponent(args)}`); }
        if (command === 'download') return reply(`⬇️ *DOWNLOADER*\nLink: ${args}\nDownloader API coming in V3.`);
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
