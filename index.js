const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const BOT_NAME = "CHARLES OFFICIAL";
const OWNER = "2348152544750";
const PREFIX = ".";
const CHANNEL = "https://whatsapp.com/channel/0029Vb8o52c9MF8ztahPbI43";
const FOOTER = `\n\n━━━━━━━━━━━━\n📢 View Channel Down 👇\n${CHANNEL}`;

// --- DATABASE ---
let db = { users: {}, groups: {}, antiStatus: false };
if (fs.existsSync('db.json')) db = JSON.parse(fs.readFileSync('db.json'));
const saveDb = () => fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"], syncFullHistory: false, markOnlineOnConnect: false
    });
    let pairingRequested = false;
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (!sock.authState.creds.registered && !pairingRequested && connection === 'connecting') {
            pairingRequested = true; await delay(3000);
            console.log("\n=== CHARLES OFFICIAL V2 ===");
            let phone = await question("Enter BOT number (e.g 2348152544750): ");
            phone = phone.replace(/[^0-9]/g, '');
            try {
                let code = await sock.requestPairingCode(phone);
                console.log("\n==============================");
                console.log("YOUR PAIRING CODE: " + code);
                console.log("WhatsApp > Linked Devices > Link with phone number");
                console.log("==============================\n");
            } catch (e) { console.log("Pairing failed: " + e.message); setTimeout(() => startBot(), 5000); }
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) setTimeout(() => startBot(), 3000);
        } else if (connection === 'open') {
            console.log(`\n✅ ${BOT_NAME} V2 IS ONLINE!`);
        }
    });

    // ANTI STATUS - AUTO VIEW STATUS
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify' && db.antiStatus) {
            for (let m of messages) {
                if (m.key.remoteJid === 'status@broadcast') {
                    await sock.readMessages([m.key]);
                    console.log('Viewed status from', m.key.participant);
                }
            }
        }
    });

    // WELCOME / GOODBYE
    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        const g = db.groups[id];
        if (!g) return;
        for (let p of participants) {
            if (action === 'add' && g.welcome) {
                await sock.sendMessage(id, { text: `👋 Welcome @${p.split('@')[0]} to the group!\n\n${g.welcome}\n\n${FOOTER}`, mentions: [p] });
            }
            if (action === 'remove' && g.goodbye) {
                await sock.sendMessage(id, { text: `👋 Goodbye @${p.split('@')[0]} 😢\n\n${g.goodbye}\n\n${FOOTER}`, mentions: [p] });
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || "";
        if (!body.startsWith(PREFIX)) return;
        const full = body.slice(PREFIX.length).trim();
        const command = full.split(' ')[0].toLowerCase();
        const args = full.split(' ').slice(1).join(' ');
        const reply = (text) => sock.sendMessage(from, { text: text + FOOTER }, { quoted: msg });

        // INIT USER
        if (!db.users[sender]) db.users[sender] = { coins: 0, lastDaily: 0, lastClaim: 0 };
        saveDb();

        console.log(`[${command}] from ${sender}`);

        // --- HELP / MENU ---
        if (command === 'help' || command === 'menu') {
            return reply(`╭───「 *${BOT_NAME}* 」───\n│ 👑 OWNER: UCHENDU CHARLES\n│ ⚡ PREFIX: ${PREFIX}\n│\n├─ *GENERAL*\n│ • ${PREFIX}help - This menu\n│ • ${PREFIX}menu - This menu\n│ • ${PREFIX}info - Bot info\n│ • ${PREFIX}ping - Speed\n│ • ${PREFIX}owner - Owner\n│ • ${PREFIX}anti status - On/Off status viewer\n│\n├─ *ECONOMY*\n│ • ${PREFIX}claim - Claim free coins\n│ • ${PREFIX}daily - Daily reward\n│\n├─ *AI & MEDIA*\n│ • ${PREFIX}ai <ask> - Ask AI\n│ • ${PREFIX}image <prompt> - Make image\n│ • ${PREFIX}sticker - Photo to sticker\n│ • ${PREFIX}song <name> - Search song\n│ • ${PREFIX}video <name> - Search video\n│ • ${PREFIX}play <name> - Play music\n│ • ${PREFIX}download <link> - Download\n│ • ${PREFIX}search <query> - Web search\n│ • ${PREFIX}weather <city> - Weather\n│ • ${PREFIX}news - Latest news\n│\n├─ *FUN*\n│ • ${PREFIX}joke - Joke\n│ • ${PREFIX}quote - Quote\n│\n├─ *GROUP*\n│ • ${PREFIX}group - Group info\n│ • ${PREFIX}set welcome <msg>\n│ • ${PREFIX}set goodbye <msg>\n│\n╰─── *PVP CHARLES* ───`);
        }

        if (command === 'info') return reply(`🤖 *${BOT_NAME}*\nVersion: V2\nOwner: UCHENDU CHARLES\nUsers: ${Object.keys(db.users).length}\nStatus: Online ✅`);
        if (command === 'ping') return reply(`Pong! 🏓\nSpeed: Fast ✅\nCHARLES OFFICIAL is active`);
        if (command === 'owner') return reply(`👑 *OWNER*\nName: UCHENDU CHARLES\nBot: CHARLES OFFICIAL\nWhatsApp: wa.me/${OWNER}`);

        // ANTI STATUS
        if (body.toLowerCase().includes('anti status')) {
            db.antiStatus = !db.antiStatus; saveDb();
            return reply(db.antiStatus ? `✅ *ANTI STATUS ON*\nBot will now automatically view all statuses! 👁️` : `❌ *ANTI STATUS OFF*\nBot will stop viewing statuses.`);
        }

        // ECONOMY
        if (command === 'claim') {
            const now = Date.now();
            if (now - db.users[sender].lastClaim < 60*60*1000) return reply(`⏳ You already claimed! Wait 1 hour.`);
            db.users[sender].coins += 100; db.users[sender].lastClaim = now; saveDb();
            return reply(`🎁 *CLAIM SUCCESS!*\nYou got +100 coins 🪙\nYour balance: ${db.users[sender].coins} coins`);
        }
        if (command === 'daily') {
            const now = Date.now();
            if (now - db.users[sender].lastDaily < 24*60*60*1000) return reply(`⏳ Daily already claimed! Come tomorrow.`);
            db.users[sender].coins += 500; db.users[sender].lastDaily = now; saveDb();
            return reply(`🎉 *DAILY REWARD!*\nYou got +500 coins 🪙\nBalance: ${db.users[sender].coins} coins\nCome back tomorrow!`);
        }

        // AI & MEDIA
        if (command === 'ai') {
            if (!args) return reply(`Usage: ${PREFIX}ai What is football?`);
            return reply(`🤖 *CHARLES AI*\n\nYou asked: "${args}"\n\nI'm CHARLES OFFICIAL AI! I can help you with school, football, coding, and more. Ask me anything!\n\n*Tip:* Connect OpenAI API in V3 for real AI answers.`);
        }
        if (command === 'image') {
            if (!args) return reply(`Usage: ${PREFIX}image a boy playing football`);
            return reply(`🎨 *IMAGE GENERATOR*\n\nGenerating image for: "${args}"\n\nPlease wait... Image feature will be added in V3 with AI API. For now use ${PREFIX}ai for ideas.`);
        }
        if (command === 'sticker') {
            return reply(`🏷️ *STICKER MAKER*\n\nSend a photo with caption *${PREFIX}sticker* and I will turn it to sticker in V3!\nFor now, send photo here.`);
        }
        if (command === 'song') return reply(`🎵 *SONG SEARCH*\n\nSearching for: "${args || '...'}"\n\nUse: ${PREFIX}play <song name> to get the song.\nExample: ${PREFIX}play Asake Lonely At The Top`);
        if (command === 'video') return reply(`🎬 *VIDEO SEARCH*\n\nSearching for: "${args || '...'}"\n\nUse: ${PREFIX}download <youtube link> to download it.`);
        if (command === 'play') {
            if (!args) return reply(`Usage: ${PREFIX}play Asake - Lonely At The Top`);
            return reply(`🎶 *NOW PLAYING*\n\nSong: ${args}\n\nDownloading... Please connect YouTube API in V3 for real download. For now search on YouTube: https://youtube.com/results?search_query=${encodeURIComponent(args)}`);
        }
        if (command === 'download') {
            if (!args) return reply(`Usage: ${PREFIX}download <TikTok/YouTube/IG link>`);
            return reply(`⬇️ *DOWNLOADER*\n\nLink: ${args}\n\nDownloading... Connect downloader API in V3 for real file.`);
        }
        if (command === 'search') {
            if (!args) return reply(`Usage: ${PREFIX}search Who is Victor Osimhen?`);
            return reply(`🔎 *SEARCH RESULT*\n\nQuery: "${args}"\n\nResult: ${args} is trending! Search on Google: https://google.com/search?q=${encodeURIComponent(args)}`);
        }
        if (command === 'weather') {
            if (!args) return reply(`Usage: ${PREFIX}weather Lagos`);
            return reply(`🌤️ *WEATHER - ${args.toUpperCase()}*\n\nToday: Sunny ☀️ 32°C\nTomorrow: Partly Cloudy ⛅ 30°C\n\n*Live weather API coming in V3*`);
        }
        if (command === 'news') return reply(`📰 *LATEST NEWS*\n\n1. Nigeria Super Eagles win again! 🇳🇬\n2. Asake drops new album 🔥\n3. CHARLES OFFICIAL BOT is now trending!\n\nLive news API coming in V3.`);
        if (command === 'joke') {
            const jokes = ["Why did Charles cross the road? To make a bot! 🤖","What do you call a fake noodle? An Impasta! 🍝","Why is football so cool? Because it has fans! ⚽"];
            return reply(`😂 *JOKE*\n\n${jokes[Math.floor(Math.random()*jokes.length)]}`);
        }
        if (command === 'quote') {
            const quotes = ["Success is not final, failure is not fatal. - Churchill","Believe you can and you're halfway there.","Your only limit is your mind. - CHARLES"];
            return reply(`✨ *QUOTE OF THE DAY*\n\n"${quotes[Math.floor(Math.random()*quotes.length)]}"`);
        }

        // GROUP
        if (command === 'group') return reply(`👥 *GROUP INFO*\nGroup ID: ${from}\nMembers: Group\nBot: ${BOT_NAME} is active here ✅`);
        if (full.startsWith('set welcome')) {
            if (!isGroup) return reply(`Use this in a group!`);
            if (!db.groups[from]) db.groups[from] = {};
            db.groups[from].welcome = args.replace('welcome','').trim() || "Welcome to our group!";
            saveDb(); return reply(`✅ Welcome message set to:\n"${db.groups[from].welcome}"`);
        }
        if (full.startsWith('set goodbye') || full.startsWith('set good bye')) {
            if (!isGroup) return reply(`Use this in a group!`);
            if (!db.groups[from]) db.groups[from] = {};
            db.groups[from].goodbye = args.replace('goodbye','').replace('good bye','').trim() || "Goodbye!";
            saveDb(); return reply(`✅ Goodbye message set to:\n"${db.groups[from].goodbye}"`);
        }
    });
}
startBot();
