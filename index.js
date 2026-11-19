require('./keepalive.js');

// ===== PIC_UP_COMMANDS_FOLLOW =====
const fs = require('fs');
async function sendMenuFinal(sock, chatId){
  const caption = `👑 *CHARLES-OFFICIAL BOT* 👑
━━━━━━━━━━━━━━━━
👑 *OWNER*
.mode public / private
.group on / off
.owner

📢 *CHANNEL - SERVER VOTE / REACT*
.creact <link> ❤️ 10
.cvote <link> Asake 20
.react <link> 🔥
.vote <link> Asake

👥 *GROUP*
.kick @user
.tagall
.promote / .demote
.mute / .unmute
.link

⬇️ *DOWNLOAD*
.play <song>
.video <name>
.tiktok <link>
.ig <link>

🎭 *FUN*
.sticker
.vv
.ai <question>
.ping / .alive
━━━━━━━━━━━━━━━━
*Powered by CHARLES-OFFICIAL* ✅`;
  // PIC UP - COMMANDS FOLLOW TOGETHER IN ONE MESSAGE
  if(fs.existsSync('./menu.jpg')){
    await sock.sendMessage(chatId, { image: fs.readFileSync('./menu.jpg'), caption });
  } else {
    await sock.sendMessage(chatId, { text: caption });
  }
}
console.log('✅ PIC UP + COMMANDS LOADED');


const pino = require('pino');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core').default || require('@distube/ytdl-core');
const { execFile } = require('child_process');
const axios = require('axios');
app.use(express.json());
let SETTINGS = { mode:'private', botDM:true, welcomeOn:true, goodbyeOn:true, welcomeMsg:'Welcome @user to *CHARLES OFFICIAL GROUP* 🔥\n\nType .menu for commands\n\n🤖 CHARLES OFFICIAL', goodbyeMsg:'Goodbye @user 👋 We go miss you!\n\n🤖 CHARLES OFFICIAL', sudo:['2348152544750'] };
let JAILED = [];
if(fs.existsSync('settings.json')) SETTINGS = JSON.parse(fs.readFileSync('settings.json'));
if(fs.existsSync('jailed.json')) JAILED = JSON.parse(fs.readFileSync('jailed.json'));
function save(){ fs.writeFileSync('settings.json', JSON.stringify(SETTINGS)); fs.writeFileSync('jailed.json', JSON.stringify(JAILED)); }
if(process.env.SESSION_ID){
  try{ if(!fs.existsSync('session')) fs.mkdirSync('session');
    const decoded = Buffer.from(process.env.SESSION_ID, 'base64').toString('utf-8');
    fs.writeFileSync('session/creds.json', decoded);
    console.log('✅ Session restored from ENV'); }catch(e){ console.log('Session restore fail', e.message); }
}
let sockGlobal=null;
  const num=(req.query.number||'').replace(/[^0-9]/g,'');
  if(!num) return res.json({error:'Put number'});
  if(!sockGlobal) return res.json({error:'Bot not ready'});
  try{ const code=await sockGlobal.requestPairingCode(num); return res.json({code}); }catch(e){ return res.json({error:e.message}); }
});

async function start(){
console.log('>>> STARTING BOT...');
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  let MODE = 'private'; // private or public
let GROUP_MODE = 'on'; // on or off
const OWNER_NUMBER = '2340000000000'; // <-- CHANGE TO YOUR PAIRED NUMBER e.g 2348152544750
let globalGroupMode = 'on';
const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sockGlobal=sock;
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered && !process.env.SESSION_ID){ setTimeout(async()=>{ try{ const code=await sock.requestPairingCode('2348152544750'); console.log('=== PAIRING CODE: '+code+' ==='); }catch(e){} }, 3000); }
  sock.ev.on('connection.update', (u)=>{ if(u.connection==='open') console.log('CHARLES OFFICIAL V4 CONNECTED!'); if(u.connection==='close'){ const r=u.lastDisconnect?.error?.output?.statusCode; console.log('Closed, code:',r); if(r!==401) setTimeout(()=> start(), 5000); else console.log('LOGGED OUT - need re-pair'); } });
  // WELCOME / GOODBYE - WORKS FOR EVERYONE, BOT NO NEED ADMIN
  sock.ev.on('group-participants.update', async (u)=>{
    try{
      for(let p of u.participants){
        if(u.action==='add' && SETTINGS.welcomeOn) await sock.sendMessage(u.id, { text: SETTINGS.welcomeMsg.replace(/@user/g,'@'+(p.id || p).split('@')[0]), mentions:[(p.id || p)] });
        if(u.action==='remove' && SETTINGS.goodbyeOn) await sock.sendMessage(u.id, { text: SETTINGS.goodbyeMsg.replace(/@user/g,'@'+(p.id || p).split('@')[0]), mentions:[(p.id || p)] });
      }
    }catch(e){ console.log('welcome err', e.message); }
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]; console.log("MSG:", m.key.remoteJid); if(!m.message) return;

    // ===== CHARLES OFFICIAL FIX V2 =====
    let senderNum = String(m.sender || m.key?.participant || m.key?.remoteJid || "").split('@')[0];
    let isGroupMsg = String(from || "").endsWith('@g.us');
    let isOwner = senderNum === OWNER_NUMBER || m.key?.fromMe;
    let _cmdRaw = String(body || "").split(' ')[0] || "";
    let _cmd = _cmdRaw.replace(/^[.!#]/,'').toLowerCase();
    let _text = String(body || "").split(' ').slice(1).join(' ');
    if(isGroupMsg && GROUP_MODE==='off' && _cmd!=='group'){ return; }
    if(MODE==='private' && !isOwner){ return; }
    if(_cmd==='mode'){
      if(!isOwner){ await sock.sendMessage(from,{text:'❌ Only paired number'}); return; }
      if(!_text){ await sock.sendMessage(from,{text:'Use: .mode private / .mode public\nCurrent: '+MODE}); return; }
      if(['private','public'].includes(_text.toLowerCase())){ MODE=_text.toLowerCase(); await sock.sendMessage(from,{text:'✅ Mode: '+MODE.toUpperCase()}); return; }
    }
    if(_cmd==='group'){
      if(!isOwner){ await sock.sendMessage(from,{text:'❌ Only paired number'}); return; }
      if(_text.toLowerCase()==='on'){ GROUP_MODE='on'; await sock.sendMessage(from,{text:'✅ Group ON'}); return; }
      if(_text.toLowerCase()==='off'){ GROUP_MODE='off'; await sock.sendMessage(from,{text:'✅ Group OFF'}); return; }
      await sock.sendMessage(from,{text:'Group: '+GROUP_MODE+'\nUse: .group on / .group off'}); return;
    }
    if(_cmd==='vv' || _cmd==='vv2'){
      let quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if(!quoted){ await sock.sendMessage(from,{text:'Reply to View Once with .vv'}); return; }
      try{
        let q = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted;
        let isImg = q.imageMessage ? 'image' : q.videoMessage ? 'video' : null;
        if(!isImg){ await sock.sendMessage(from,{text:'❌ No be View Once'}); return; }
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        let stream = await downloadContentFromMessage(q[isImg+'Message'] || q, isImg);
        let buf = Buffer.from([]);
        for await (const chunk of stream){ buf = Buffer.concat([buf, chunk]); }
        let ownerJid = OWNER_NUMBER + '@s.whatsapp.net';
        if(isImg==='image') await sock.sendMessage(ownerJid,{image:buf, caption:'👁️ View Once .vv\n© CHARLES OFFICIAL'});
        else await sock.sendMessage(ownerJid,{video:buf, caption:'👁️ View Once Video .vv\n© CHARLES OFFICIAL'});
        await sock.sendMessage(from,{text:'✅ Sent to your paired number self-chat'});
      }catch(e){ await sock.sendMessage(from,{text:'❌ '+e.message}); }
      return;
    }
    // ===== END FIX V2 =====

    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = m.key.participant || m.key.remoteJid;
senderNum = sender.split('@')[0];
isOwner = SETTINGS.sudo.includes(senderNum) || senderNum==='2348152544750' || !isGroup && senderNum==='2348152544750';
    // JAILED CHECK
    if(isGroup && JAILED.includes(sender) && !isOwner) return;
    // REPLY TARGET - reply to message = target, no need @user
    let quoted = m.message.extendedTextMessage?.contextInfo;
    let target = null;
    if(quoted?.participant) target = quoted.participant;
    if(quoted?.mentionedJid?.length) target = quoted.mentionedJid[0];
let _mc = m.message.ephemeralMessage?.message || m.message.viewOnceMessage?.message || m.message.viewOnceMessageV2?.message || m.message; const body = _mc.conversation || _mc.extendedTextMessage?.text || _mc.imageMessage?.caption || ''; console.log('BODY:', JSON.stringify(body));
    if(!body.startsWith('.')) return;
    const args = body.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();
    const text = args.join(' ');
    const reply = (t, mentions) => sock.sendMessage(from, { text: t, mentions }, { quoted: m });
    // GROUP META FOR ADMIN CHECK
    let isSenderAdmin = false, isBotAdmin = false, groupMeta = null;
    if(isGroup){
      try{ groupMeta = await sock.groupMetadata(from);
        isSenderAdmin = groupMeta.participants.find(p=>p.id===sender)?.admin ? true : false;
        const botId = sock.user.id.split(':')[0]+'@s.whatsapp.net';
        isBotAdmin = groupMeta.participants.find(p=>p.id===botId)?.admin ? true : false;
      }catch(e){}
    }
    if(isGroup && groupMeta){ const ownerInGroup = groupMeta.participants.find(p=>p.id.includes('2348152544750')); const isOwnerAdmin = ownerInGroup && ownerInGroup.admin ? true : false; if(!isOwnerAdmin) return; } const needAdmin = ['kick','promote','demote','mute','unmute','add','revoke','updategname','updategdesc','accept','reject','acceptall','rejectall','ban','unban','jail','unjail','antilink'];
    if(isGroup && needAdmin.includes(cmd) && !isSenderAdmin && !isOwner) return reply('❌ Only group admin fit use this command\n\n🤖 CHARLES OFFICIAL');
    const getTarget = () => {
      if(target) return target;
      if(text){
        let n = text.replace(/[^0-9]/g,'');
        if(n.length>=10) return n+'@s.whatsapp.net';
      }
      return null;
    };
    try{
    // MAIN
    if(cmd==='menu' || cmd==='help'){
      return reply(`╭─❍══ CHARLES OFFICIAL ══⊷❍
┇◆ Owner: CHARLES
┇◆ Mode: private
┇◆ Prefix: .
┇◆ Version: 4.0
╰══════════⍟

👥 GROUP - EVERYONE:
.tagall .link .ginfo .poll .welcome on/off .goodbye on/off .setwelcome .setgoodbye

🔒 GROUP - ADMIN ONLY:
.kick .promote .demote .mute .unmute .add .revoke .updategname .updategdesc .accept .reject .ban .jail
_Reply to person + command, no need @_

⬇️ DOWNLOAD - DIRECT:
.play <song> - Download song direct
.video <film> - Download video direct
.tiktok <link> .igdl <link> .fbdl <link> .ytdl <link> .song <song>

❤️ CHANNEL - OWNER ONLY:
.chreact <channel link> <emoji>
.vote <channel link> <option>
.chinfo <channel link> .chfollow <channel link>

🎉 FUN:
.joke .quote .roast .ship .8ball .truth .dare .fact .meme .pickup

🤖 AI:
.ai <ask> .gpt <ask> .img <prompt> .ask <question>

🛠️ TOOLS:
.sticker .sticker2 .toimg .tomp3 .tovn .ss <link> .short <link> .qr <text> .translate <text> .weather <city> .calc <2+2>

👤 PROFILE:
.profile .owner .me .rank .level

🆕 NEW:
.lyrics <song> .news .bible <verse> .quran <surah> .anime <name> .wallpaper .horoscope <sign> .pair .love <name> .hack <name>

⚙️ OWNER:
.mode public/private .sudo .alive .ping .restart .update .broadcast .block .unblock

> © Powered by CHARLES OFFICIAL`);
    }
    
    // ===== 10 NEW COMMANDS - CHARLES OFFICIAL =====
    if(cmd==='lyrics'){
      if(!text) return reply('Usage: .lyrics Asake Why Love');
      try{
        const r = await axios.get(`https://lrclib.net/api/search?track_name=${encodeURIComponent(text)}`);
        const s = r.data?.[0]; if(!s) return reply('❌ Lyrics not found');
        await reply(`🎵 *${s.trackName} - ${s.artistName}*\n\n${s.plainLyrics?.slice(0,3000) || 'No lyrics'}`);
      }catch(e){ return reply('❌ '+e.message); }
      return;
    }
    if(cmd==='news'){
      try{
        const r = await axios.get('https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=5');
        let msg='📰 *LATEST NEWS*\n\n'; r.data.hits.forEach((h,i)=>{ msg+=`${i+1}. ${h.title}\n🔗 ${h.url||''}\n\n`; });
        await reply(msg);
      }catch(e){ return reply('❌ '+e.message); }
      return;
    }
    if(cmd==='bible'){
      try{
        const q = text || 'John 3:16';
        const r = await axios.get(`https://bible-api.com/${encodeURIComponent(q)}`);
        await reply(`📖 *${r.data.reference}*\n\n${r.data.text}\n\n— ${r.data.translation_name}`);
      }catch(e){ return reply('❌ Verse not found. Try: .bible John 3:16'); }
      return;
    }
    if(cmd==='quran'){
      try{
        const n = text || '1'; // number or 1:1
        const r = await axios.get(`https://api.alquran.cloud/v1/ayah/${encodeURIComponent(n)}/en.asad`);
        const d = r.data.data; await reply(`🕌 *Surah ${d.surah.englishName} - Ayah ${d.numberInSurah}*\n\n${d.text}\n\nArabic: ${d.surah.englishNameTransliteration}`);
      }catch(e){ return reply('❌ Try: .quran 1 or .quran 2:255'); }
      return;
    }
    if(cmd==='anime'){
      if(!text) return reply('Usage: .anime Naruto');
      try{
        const r = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
        const a = r.data?.data?.[0]; if(!a) return reply('❌ Anime not found');
        await sock.sendMessage(from,{image:{url:a.images.jpg.large_image_url},caption:`🎌 *${a.title}*\n⭐ Score: ${a.score}\n📺 Episodes: ${a.episodes}\n📅 ${a.year||''}\n\n${(a.synopsis||'').slice(0,500)}`},{quoted:m});
      }catch(e){ return reply('❌ '+e.message); }
      return;
    }
    if(cmd==='wallpaper'){
      try{ await sock.sendMessage(from,{image:{url:'https://picsum.photos/1080/1920?random='+Date.now()},caption:'🖼️ *Random Wallpaper*\n> © CHARLES OFFICIAL'},{quoted:m}); }catch(e){ return reply('❌ '+e.message); }
      return;
    }
    if(cmd==='horoscope'){
      if(!text) return reply('Usage: .horoscope Aries');
      try{
        const r = await axios.get(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${encodeURIComponent(text)}&day=today`);
        const d = r.data.data; await reply(`🔮 *Horoscope - ${text}*\n\n📅 ${d.date}\n\n${d.horoscope_data}`);
      }catch(e){ return reply('❌ Try: .horoscope Leo'); }
      return;
    }
    if(cmd==='pair'){
      try{
        const meta = await sock.groupMetadata(from).catch(()=>null); if(!meta) return reply('❌ Use in group only');
        const members = meta.participants.map(p=>p.id); const a = members[Math.floor(Math.random()*members.length)]; const b = members[Math.floor(Math.random()*members.length)];
        await reply(`💘 *PERFECT PAIR*\n\n@${a.split('@')[0]} ❤️ @${b.split('@')[0]}\n\n98% Match! Congrats 💍`, {mentions:[a,b]});
      }catch(e){ return reply('❌ '+e.message); }
      return;
    }
    if(cmd==='love'){
      if(!text) return reply('Usage: .love Charles');
      const pct = Math.floor(Math.random()*100)+1;
      await reply(`❤️ *LOVE CALCULATOR*\n\nYou ❤️ ${text}\n\nLove: ${pct}%\n${pct>80?'💍 Marry am now!':pct>50?'😍 E go work':'💔 Try another person'}`);
      return;
    }
    if(cmd==='hack'){
      if(!text) return reply('Usage: .hack John');
      await reply(`💻 *HACKING ${text.toUpperCase()}...*\n\n[▓▓▓▓▓▓▓░░░] 70%\nInjecting virus...\nBypassing password...\n\n✅ HACKED! 😂\n\nJust prank o, no real hack. > © CHARLES OFFICIAL`);
      return;
    }

    
    // ===== MODE / GROUP / VV - CHARLES OFFICIAL =====
    if(cmd==='mode'){
      if(sender !== OWNER_NUMBER && !m.key.fromMe) return reply('❌ Only paired number fit change mode');
      if(!text) return reply('Usage: .mode private / .mode public\nCurrent: '+MODE);
      if(['private','public'].includes(text.toLowerCase())){
        MODE = text.toLowerCase();
        return reply(`✅ Mode set to *${MODE.toUpperCase()}*\n${MODE==='private'?'Only paired number fit use commands':'Anybody fit use commands'}`);
      }
      return reply('Use: .mode private OR .mode public');
    }
    if(cmd==='group'){
      if(sender !== OWNER_NUMBER && !m.key.fromMe) return reply('❌ Only paired number fit change group mode');
      if(text.toLowerCase()==='on'){ GROUP_MODE='on'; return reply('✅ Group ON - Bot go reply for group'); }
      if(text.toLowerCase()==='off'){ GROUP_MODE='off'; return reply('✅ Group OFF - Bot NO go reply for group'); }
      return reply(`Group Mode: ${GROUP_MODE}\nUse: .group on / .group off`);
    }
    if(cmd==='vv' || cmd==='vv2'){
      // Must reply to view once
      let quoted = m.quoted || m.msg?.contextInfo?.quotedMessage;
      if(!quoted) return reply('Reply to a View Once photo/video with .vv');
      try{
        let qmsg = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted;
        let type = qmsg.imageMessage ? 'image' : qmsg.videoMessage ? 'video' : null;
        if(!type) return reply('❌ That no be View Once photo/video');
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        let stream = await downloadContentFromMessage(qmsg[type+'Message'] || qmsg, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream){ buffer = Buffer.concat([buffer, chunk]); }
        let ownerJid = OWNER_NUMBER + '@s.whatsapp.net';
        if(type==='image'){
          await sock.sendMessage(ownerJid, {image: buffer, caption: '👁️ *View Once - .vv*\n> © CHARLES OFFICIAL'});
        } else {
          await sock.sendMessage(ownerJid, {video: buffer, caption: '👁️ *View Once Video - .vv*\n> © CHARLES OFFICIAL'});
        }
        await reply('✅ View Once sent to your paired number self-chat');
      }catch(e){ return reply('❌ '+e.message); }
      return;
    }

    if(cmd==='ping') return reply(`Pong! ⚡ CHARLES OFFICIAL\nSpeed: ${Date.now()%1000}ms`);
    if(cmd==='alive') return reply(`🤖 *CHARLES OFFICIAL Activated*\n\nType .menu for commands\n\n⚡ Version: 4.0\n> © CHARLES OFFICIAL`);
    if(cmd==='owner') return reply(`👑 Owner: CHARLES\n📞 2348152544750\n🤖 CHARLES OFFICIAL`);
    if(cmd==='uptime') return reply(`⏰ Uptime: ${Math.floor(process.uptime()/60)} mins\n🤖 CHARLES OFFICIAL`);
    if(cmd==='mode'){ if(!isOwner) return reply('❌ Owner only'); SETTINGS.mode = text.toLowerCase()==='public'?'public':'private'; save(); return reply(`✅ Mode set to ${SETTINGS.mode}\n🤖 CHARLES OFFICIAL`); }
    // WELCOME / GOODBYE - EVERYONE FIT USE
    if(cmd==='welcome'){ if(!isGroup) return reply('Group only'); if(text.toLowerCase()==='on'){ SETTINGS.welcomeOn=true; save(); return reply('✅ Welcome ON for everyone\n🤖 CHARLES OFFICIAL'); } if(text.toLowerCase()==='off'){ SETTINGS.welcomeOn=false; save(); return reply('❌ Welcome OFF'); } return reply(`Welcome is: ${SETTINGS.welcomeOn?'ON ✅':'OFF ❌'}\nUse: .welcome on / off`); }
    if(cmd==='goodbye'){ if(!isGroup) return reply('Group only'); if(text.toLowerCase()==='on'){ SETTINGS.goodbyeOn=true; save(); return reply('✅ Goodbye ON'); } if(text.toLowerCase()==='off'){ SETTINGS.goodbyeOn=false; save(); return reply('❌ Goodbye OFF'); } return reply(`Goodbye is: ${SETTINGS.goodbyeOn?'ON ✅':'OFF ❌'}`); }
    if(cmd==='setwelcome'){ SETTINGS.welcomeMsg = text || SETTINGS.welcomeMsg; save(); return reply('✅ Welcome message set:\n'+SETTINGS.welcomeMsg); }
    if(cmd==='setgoodbye'){ SETTINGS.goodbyeMsg = text || SETTINGS.goodbyeMsg; save(); return reply('✅ Goodbye message set'); }
    // GROUP EVERYONE
    if(cmd==='tagall' || cmd==='everyone'){ if(!isGroup) return reply('Group only'); let txt = text||'📢 CHARLES OFFICIAL TAG ALL\n\n'; let men=[]; for(let p of groupMeta.participants){ txt+=`@${p.id.split('@')[0]} `; men.push(p.id); } return sock.sendMessage(from,{text:txt, mentions:men},{quoted:m}); }
    if(cmd==='link'){ if(!isGroup) return reply('Group only'); try{ const code = await sock.groupInviteCode(from); return reply(`🔗 Group Link:\nhttps://chat.whatsapp.com/${code}\n\n🤖 CHARLES OFFICIAL`); }catch(e){ return reply('❌ Bot need admin for link'); } }
    if(cmd==='ginfo'){ if(!isGroup) return reply('Group only'); return reply(`📋 *${groupMeta.subject}*\n👥 Members: ${groupMeta.participants.length}\n📝 Desc: ${groupMeta.desc||'No desc'}\n\n🤖 CHARLES OFFICIAL`); }
    if(cmd==='poll'){ if(!isGroup) return reply('Group only'); let parts = text.split('|'); if(parts.length<3) return reply('Usage: .poll Question | Option1 | Option2'); return sock.sendMessage(from,{ poll:{ name:parts[0], values:parts.slice(1), selectableCount:1 }},{quoted:m}); }
    // GROUP ADMIN ONLY - REPLY TO EXECUTE
    if(cmd==='kick'){ let t=getTarget(); if(!t) return reply('Reply to person + .kick'); await sock.groupParticipantsUpdate(from,[t],'remove'); return reply(`✅ Kicked @${t.split('@')[0]}\n🤖 CHARLES OFFICIAL`,[t]); }
    if(cmd==='promote'){ let t=getTarget(); if(!t) return reply('Reply to person + .promote'); await sock.groupParticipantsUpdate(from,[t],'promote'); return reply(`✅ Promoted @${t.split('@')[0]}`,[t]); }
    if(cmd==='demote'){ let t=getTarget(); if(!t) return reply('Reply to person + .demote'); await sock.groupParticipantsUpdate(from,[t],'demote'); return reply(`✅ Demoted @${t.split('@')[0]}`,[t]); }
    if(cmd==='add'){ let n=text.replace(/[^0-9]/g,''); if(!n) return reply('Usage: .add 234...'); let res=await sock.groupParticipantsUpdate(from,[n+'@s.whatsapp.net'],'add'); return reply('✅ Add attempted - check if person join\n🤖 CHARLES OFFICIAL'); }
    if(cmd==='mute'){ await sock.groupSettingUpdate(from,'announcement'); return reply('🔇 Group Muted'); }
    if(cmd==='unmute'){ await sock.groupSettingUpdate(from,'not_announcement'); return reply('🔊 Group Unmuted'); }
    if(cmd==='revoke'){ const code=await sock.groupRevokeInvite(from); return reply(`✅ New link: https://chat.whatsapp.com/${code}`); }
    if(cmd==='updategname'){ await sock.groupUpdateSubject(from,text); return reply('✅ Group name updated'); }
    if(cmd==='updategdesc'){ await sock.groupUpdateDescription(from,text); return reply('✅ Group desc updated'); }
    if(cmd==='del' || cmd==='delete'){ if(!quoted?.stanzaId) return reply('Reply to message + .del'); await sock.sendMessage(from,{delete: quoted}); return reply('✅ Deleted'); }
    if(cmd==='jail'){ let t=getTarget(); if(!t) return reply('Reply to person + .jail'); if(!JAILED.includes(t)) JAILED.push(t); save(); return reply(`🔒 Jailed @${t.split('@')[0]}`,[t]); }
    if(cmd==='unjail'){ let t=getTarget(); if(!t) return reply('Reply to person + .unjail'); JAILED=JAILED.filter(x=>x!==t); save(); return reply(`🔓 Unjailed @${t.split('@')[0]}`,[t]); }
    if(cmd==='ban'){ let t=getTarget(); if(!t) return reply('Reply to person + .ban'); if(!JAILED.includes(t)) JAILED.push(t); save(); return reply(`🚫 Banned @${t.split('@')[0]}`,[t]); }
    if(cmd==='unban'){ let t=getTarget(); JAILED=JAILED.filter(x=>x!==t); save(); return reply('✅ Unbanned'); }
    // DOWNLOAD - DIRECT, NO API - MUST RETURN FILE
    if(cmd==='play'){
      if(!text) return reply('Usage: .play Asake Lonely At The Top');
      await reply('🔍 Searching song... CHARLES OFFICIAL');
      try{
        const search = await yts(text); const video = search.videos[0];
        if(!video) return reply('❌ Song not found');
        const out = '/tmp/play_'+Date.now()+'.m4a';
        await new Promise((res,rej)=>{
          execFile('yt-dlp',['-f','bestaudio[ext=m4a]/18/best','-o',out,'--no-playlist','--extractor-args','youtube:player_client=android',video.url],(e,stdout,stderr)=>{ if(e) rej(new Error(stderr||e.message)); else res(); });
        });
        const buf = fs.readFileSync(out); fs.unlinkSync(out);
        await sock.sendMessage(from, { audio: buf, mimetype:'audio/mp4', fileName: video.title+'.m4a' }, { quoted: m });
      }catch(e){ return reply('❌ Play failed: '+e.message); }
      return;
    }
    if(cmd==='video'){
      if(!text) return reply('Usage: .video Asake Lonely At The Top');
      await reply('🎬 Downloading video... CHARLES OFFICIAL');
      try{
        const search = await yts(text); const video = search.videos[0];
        if(!video) return reply('❌ Video not found');
        let dl=null;
        const apis=[`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(video.url)}`,`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(video.url)}`];
        for(const api of apis){ try{ const r=await axios.get(api,{timeout:20000}); dl=r.data.download_url||r.data.result?.download_url||r.data.result?.url||r.data.result?.video||r.data.result?.download||r.data.url||r.data.download; if(dl) break; }catch(e){ console.log('video api fail',api,e.message); } }
        if(!dl) return reply('❌ Video failed: No download link');
        const buf = (await axios.get(dl,{responseType:'arraybuffer', headers:{'User-Agent':'Mozilla/5.0'}})).data;
        await sock.sendMessage(from, { video: Buffer.from(buf), caption:`🎬 ${video.title}\n\n🤖 CHARLES OFFICIAL` }, { quoted: m });
      }catch(e){ return reply('❌ Video failed: '+e.message); }
      return;
    }
    if(cmd==='tiktok'){ if(!text) return reply('Usage: .tiktok <link>'); await reply('⬇️ Downloading TikTok...'); try{ const r=await axios.get(`https://api.zenzxz.my.id/api/downloader/tiktok?url=${encodeURIComponent(text)}`); const dl=r.data.download_url||r.data.result?.video||r.data.url; if(!dl) return reply('❌ Failed'); const buf=(await axios.get(dl,{responseType:'arraybuffer'})).data; await sock.sendMessage(from,{video:Buffer.from(buf), caption:'🤖 CHARLES OFFICIAL'},{quoted:m}); }catch(e){ return reply('❌ TikTok failed: '+e.message); } return; }
    if(cmd==='igdl'){ if(!text) return reply('Usage: .igdl <link>'); return reply('⬇️ IG download coming - use .play for now'); }
    // FUN
    if(cmd==='joke') return reply('😂 Why did the chicken cross the road? To see CHARLES OFFICIAL! 🤖');
    if(cmd==='quote') return reply('✨ "Success na for person wey no give up." - CHARLES OFFICIAL');
    if(cmd==='roast'){ let t=getTarget(); return reply(`🔥 @${t?t.split('@')[0]:senderNum} your phone need update, like your brain 😂`, t?[t]:[]); }
    if(cmd==='ship'){ return reply('❤️ Ship result: 87% match! CHARLES OFFICIAL approve 💍'); }
    if(cmd==='8ball'){ return reply('🎱 8Ball: Yes, definitely! - CHARLES OFFICIAL'); }
    // CHANNEL - OWNER ONLY - REAL FIX
    if(cmd==='chreact'){ if(!isOwner) return reply('❌ Owner only'); let parts=text.split(' '); if(parts.length<2) return reply('Usage: .chreact <channel link> ❤️\nExample: .chreact https://whatsapp.com/channel/xxx ❤️'); let link=parts[0]; let emoji=parts[1]||'❤️'; try{ let id=link.split('/').pop(); let jid=id+'@newsletter'; await sock.newsletterReactMessage(jid, '1', emoji); return reply(`✅ Reacted ${emoji} to channel\n🤖 CHARLES OFFICIAL`); }catch(e){ return reply(`❌ Chreact failed: ${e.message}\nMake sure you don follow that channel first with bot number`); } return; }
    if(cmd==='vote'){ if(!isOwner) return reply('❌ Owner only'); let parts=text.split(' '); if(parts.length<2) return reply('Usage: .vote <channel link> <option>\nExample: .vote https://whatsapp.com/channel/xxx Yes'); return reply('🗳️ Vote sent attempt - check channel\n🤖 CHARLES OFFICIAL'); }
    if(cmd==='sudo'){ if(!isOwner) return reply('❌ Owner only'); return reply('👑 Sudo: '+SETTINGS.sudo.join(', ')); }
    if(cmd==='out' || cmd==='leave'){ if(!isGroup) return reply('Group only'); await reply('👋 CHARLES OFFICIAL dey go... Bye!'); await sock.groupLeave(from); return; }
    }catch(e){ console.log('cmd err', e.message); return reply('❌ Error: '+e.message); }
  });
}
start();