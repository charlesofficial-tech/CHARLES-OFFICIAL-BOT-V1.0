require("http").createServer((req,res)=>res.end("CHARLES OFFICIAL ACTIVE")).listen(process.env.PORT||8000); const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core').default || require('@distube/ytdl-core');
const axios = require('axios');
const app = express();
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
app.get('/', (req,res)=> res.send(`<h1>CHARLES OFFICIAL</h1><p>Bot is running</p>`));
app.get('/pair', async (req,res)=>{
  const num=(req.query.number||'').replace(/[^0-9]/g,'');
  if(!num) return res.json({error:'Put number'});
  if(!sockGlobal) return res.json({error:'Bot not ready'});
  try{ const code=await sockGlobal.requestPairingCode(num); return res.json({code}); }catch(e){ return res.json({error:e.message}); }
});
app.get('/get-session', (req,res)=>{ try{ const c=fs.readFileSync('session/creds.json','utf-8'); return res.send(Buffer.from(c).toString('base64')); }catch(e){ return res.send('No session yet'); } });
app.listen(process.env.PORT || 3000, ()=> console.log('Port open CHARLES OFFICIAL V4'));
async function start(){
console.log('>>> STARTING BOT...');
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
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
    const from = m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = m.key.participant || m.key.remoteJid;
    const senderNum = sender.split('@')[0];
    const isOwner = SETTINGS.sudo.includes(senderNum) || senderNum==='2348152544750' || !isGroup && senderNum==='2348152544750';
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
      return reply(`╭─❍══ CHARLES OFFICIAL ══⊷❍\n┇◆ Owner: CHARLES\n┇◆ Mode: ${SETTINGS.mode}\n┇◆ Prefix: .\n┇◆ Version: 4.0\n╰══════════⍟\n\n👥 GROUP - EVERYONE:\n.tagall .link .ginfo .poll .welcome on/off .goodbye on/off .setwelcome .setgoodbye\n\n🔒 GROUP - ADMIN ONLY:\n.kick .promote .demote .mute .unmute .add .revoke .updategname .updategdesc .accept .reject .ban .jail\n_Reply to person + command, no need @_\n\n⬇️ DOWNLOAD - DIRECT:\n.play <song> - Download song direct\n.video <film> - Download video direct\n.tiktok <link> .igdl <link>\n\n❤️ CHANNEL - OWNER ONLY:\n.chreact <channel link> <emoji>\n.vote <channel link> <option>\n\n🎉 FUN:\n.joke .quote .roast .ship .8ball\n\n⚙️ OWNER:\n.mode public/private .sudo .alive .ping\n\n> © Powered by CHARLES OFFICIAL`);
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
        const r = await axios.get(`https://api.zenzxz.my.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`);
        const dl = r.data.download_url || r.data.result?.download_url || r.data.result?.url || r.data.result?.audio || r.data.url;
        if(!dl) return reply('❌ Play failed: No download link from API');
        const buf = (await axios.get(dl,{responseType:'arraybuffer', headers:{'User-Agent':'Mozilla/5.0'}})).data;
        await sock.sendMessage(from, { audio: Buffer.from(buf), mimetype:'audio/mpeg', fileName: video.title+'.mp3' }, { quoted: m });
      }catch(e){ return reply('❌ Play failed, try again: '+e.message); }
      return;
    }
    if(cmd==='video'){
      if(!text) return reply('Usage: .video Asake Lonely At The Top');
      await reply('🎬 Downloading video... CHARLES OFFICIAL');
      try{
        const search = await yts(text); const video = search.videos[0];
        if(!video) return reply('❌ Video not found');
        const r = await axios.get(`https://api.zenzxz.my.id/api/downloader/ytmp4?url=${encodeURIComponent(video.url)}`);
        const dl = r.data.download_url || r.data.result?.download_url || r.data.result?.url || r.data.result?.video || r.data.url;
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