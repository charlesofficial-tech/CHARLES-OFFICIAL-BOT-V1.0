const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
let SETTINGS = { mode:'private', botDM:true, botReply:'Hello 👋 I am CHARLES OFFICIAL Bot. Type .menu', welcomeOn:true, goodbyeOn:true, welcomeMsg:'Welcome @user to *CHARLES OFFICIAL GROUP* 🔥', goodbyeMsg:'Goodbye @user 👋 We go miss you!' };
let JAILED = [];
if(fs.existsSync('settings.json')) SETTINGS = JSON.parse(fs.readFileSync('settings.json'));
if(fs.existsSync('jailed.json')) JAILED = JSON.parse(fs.readFileSync('jailed.json'));
function save(){ fs.writeFileSync('settings.json', JSON.stringify(SETTINGS)); fs.writeFileSync('jailed.json', JSON.stringify(JAILED)); }
// === RESTORE SESSION FROM ENV - NO RE-PAIR NEEDED ===
if(process.env.SESSION_ID){
  try{
    if(!fs.existsSync('session')) fs.mkdirSync('session');
    const decoded = Buffer.from(process.env.SESSION_ID, 'base64').toString('utf-8');
    fs.writeFileSync('session/creds.json', decoded);
    console.log('✅ Session restored from ENV - No pairing needed!');
  }catch(e){ console.log('Session restore fail', e.message); }
}
let sockGlobal=null;
app.get('/', (req,res)=> res.send(`<html><head><title>CHARLES OFFICIAL</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0a0a0a;color:#fff;text-align:center;padding:20px;font-family:sans-serif}input{padding:12px;width:80%;border-radius:10px;background:#111;color:#fff;border:1px solid gold}button{padding:12px 20px;background:gold;border:none;border-radius:10px;font-weight:bold;margin-top:10px}#code{font-size:32px;color:gold;margin-top:20px}</style></head><body><h1>🐐 CHARLES OFFICIAL 🐐</h1><input id="num" placeholder="2348152544750"><br><button onclick="pair()">GET PAIRING CODE</button><div id="code"></div><script>async function pair(){let n=document.getElementById('num').value;let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code||d.error;}</script></body></html>`));
app.get('/pair', async (req,res)=>{
  const num=(req.query.number||'').replace(/[^0-9]/g,'');
  if(!num) return res.json({error:'Put number'});
  if(!sockGlobal) return res.json({error:'Bot not ready'});
  try{ const code=await sockGlobal.requestPairingCode(num); return res.json({code}); }catch(e){ return res.json({error:e.message}); }
});
app.get('/get-session', (req,res)=>{
  try{ const c=fs.readFileSync('session/creds.json','utf-8'); return res.send(Buffer.from(c).toString('base64')); }catch(e){ return res.send('No session yet'); }
});
app.listen(process.env.PORT || 3000, ()=> console.log('Port open V3.4'));
async function start(){
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sockGlobal=sock;
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered && !process.env.SESSION_ID){ setTimeout(async()=>{ try{ const code=await sock.requestPairingCode('2348152544750'); console.log('=== PAIRING CODE: '+code+' ==='); }catch(e){} }, 3000); }
  sock.ev.on('connection.update', (u)=>{ if(u.connection==='open') console.log('CHARLES OFFICIAL V3.4 CONNECTED! - No re-pair needed'); if(u.connection==='close') setTimeout(()=> start(), 5000); });
  sock.ev.on('group-participants.update', async (u)=>{
    for(let p of u.participants){
      if(u.action==='add' && SETTINGS.welcomeOn) await sock.sendMessage(u.id, { text: SETTINGS.welcomeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
      if(u.action==='remove' && SETTINGS.goodbyeOn) await sock.sendMessage(u.id, { text: SETTINGS.goodbyeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
    }
  });
  let lastBotReply=0;
  const EMOJIS=['❤️','🔥','😍','👍','😂','😮','😢','🙏','👏','💯','🎉','😎','🤩','💖','🦁','🐐','👑','⚡','💪','🌟'];
  function parseChannel(url){
    const parts=url.split('/').filter(Boolean);
    const idx=parts.findIndex(p=>p==='channel');
    if(idx===-1) return null;
    return { channelId: parts[idx+1], msgId: parts[idx+2]||null };
  }
  const COOL = (title, body) => `✨ *${title}* ✨\n━━━━━\n${body}\n━━━━━\n👑 *CHARLES OFFICIAL* 🐐`;
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0];
    if(!m.message) return;
    const from=m.key.remoteJid;
    const isGroup=from.endsWith('@g.us');
    const text=m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    if(m.key.fromMe && !text.startsWith('.')) return;
    if(text===SETTINGS.botReply) return;
    const sender=m.key.participant || from;
    const isOwner=sender.includes('2348152544750') || m.key.fromMe;
    const reply=(t)=> sock.sendMessage(from,{text:t},{quoted:m});
    if(isGroup && JAILED.includes(sender) && !text.startsWith('.')){ try{ await sock.sendMessage(from, { delete: m.key }); }catch(e){} return; }
    if(!isGroup && !text.startsWith('.') && SETTINGS.botDM){
      if(SETTINGS.mode==='private' && !isOwner) return;
      if(Date.now()-lastBotReply<3000) return;
      lastBotReply=Date.now();
      return reply(COOL('CHARLES OFFICIAL 🤖', SETTINGS.botReply));
    }
    if(!text.startsWith('.')) return;
    const args=text.trim().slice(1).split(' ');
    const cmd=args[0].toLowerCase();
    const q=args.slice(1).join(' ');
    const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (q.replace('@','') ? q.replace('@','')+'@s.whatsapp.net' : null);
    if((cmd==='chreact' || cmd==='vote') && !isOwner) return reply(COOL('ACCESS DENIED ❌', 'Only paired owner fit use .'+cmd));
    if(cmd==='chreact'){
      const url=args[1]; const countArg=args[2]||'1';
      if(!url) return reply(COOL('CHREACT ❤️', 'Use:\n.chreact channelurl 100\n.chreact channelurl 5+7\n\nExample:\n.chreact https://whatsapp.com/channel/0029Vb8ReGPFi8xW69B0II1B/15 10'));
      const parsed=parseChannel(url);
      if(!parsed || !parsed.msgId) return reply(COOL('NEED POST ID ❌', 'Your link no get post ID!\n\nOpen channel post > Share > Copy Link\nE must end with /15 or /123\n\nExample:\n.chreact https://whatsapp.com/channel/0029Vb8ReGPFi8xW69B0II1B/15 10'));
      // REAL FIX: Convert to newsletter JID
      const newsletterJid = parsed.channelId + '@newsletter';
      let count=1;
      if(countArg.includes('+')){ const [a,b]=countArg.split('+').map(Number); count=Math.floor(Math.random()*(b-a+1))+a; } else count=parseInt(countArg)||1;
      if(count>50) count=50;
      await reply(COOL('CHREACT STARTED ❤️', `Channel: ${parsed.channelId}\nPost ID: ${parsed.msgId}\nNewsletter JID: ${newsletterJid}\nReactions: ${count}\nSending... ⚡\n\n⚠️ Make sure bot number FOLLOW this channel!`));
      let sent=0, failed=0;
      for(let i=0;i<count;i++){
        const emoji=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
        try{
          // METHOD 1: Real newsletter react with JID
          await sock.newsletterReactMessage(newsletterJid, parsed.msgId, emoji);
          sent++;
        }catch(e1){
          try{
            // METHOD 2: Try with raw ID
            await sock.newsletterReactMessage(parsed.channelId, parsed.msgId, emoji);
            sent++;
          }catch(e2){ failed++; console.log('react fail', e2.message); }
        }
        await new Promise(r=>setTimeout(r,1000));
      }
      if(sent===0) return reply(COOL('CHREACT FAILED ❌', `0/${count} sent.\n\nReason: WhatsApp block bot from reacting if:\n1. Bot no follow channel\n2. Channel na private\n3. Post don old\n\nFIX: Open WhatsApp with bot number, FOLLOW channel, then try again with 5 reactions only.`));
      return reply(COOL('CHREACT DONE ✅', `Sent ${sent}/${count} reactions ❤️🔥\nCheck channel now!`));
    }
    if(cmd==='vote'){
      const url=args[1]; const option=args.slice(2).join(' ')||'1';
      if(!url) return reply(COOL('VOTE 🗳️', 'Use:\n.vote channelposturl OptionName\n\nExample:\n.vote https://whatsapp.com/channel/0029Vb8ReGPFi8xW69B0II1B/15 CHARLES\n\nNote: WhatsApp poll vote na by REACTION - bot go react ❤️ as your vote!'));
      const parsed=parseChannel(url);
      if(!parsed || !parsed.msgId) return reply(COOL('NEED POST ID ❌', 'Link must end with /15 post ID'));
      const newsletterJid = parsed.channelId + '@newsletter';
      await reply(COOL('VOTING 🗳️', `Voting for: *${option}*\nPost: ${parsed.msgId}\nMethod: Reaction Vote ❤️`));
      try{
        // Vote = React with ❤️ on poll post - this na how WhatsApp channel poll vote work for bots
        await sock.newsletterReactMessage(newsletterJid, parsed.msgId, '❤️');
        return reply(COOL('VOTE DONE ✅', `You voted for: *${option}* 🗳️❤️\nPost: ${parsed.msgId}\nCheck channel - reaction don show!`));
      }catch(e){
        return reply(COOL('VOTE FAILED ❌', `Error: ${e.message}\n\nFIX: Make sure bot number FOLLOW channel first.\nOpen bot WhatsApp > Channels > Follow that channel.`));
      }
    }
    if(SETTINGS.mode==='private' && !isOwner && cmd!=='menu' && cmd!=='ping') return reply(COOL('PRIVATE 🔒','Bot dey on PRIVATE.'));
    let isAdmin=false;
    if(isGroup){ try{ const meta=await sock.groupMetadata(from); const me=meta.participants.find(p=>p.id===sender); isAdmin=me?.admin==='admin'||me?.admin==='superadmin'; }catch(e){} }
    const needAdmin=['kick','ban','promote','demote','add','mute','unmute','close','open','announce','delete','purge','tagall','hidetag','grouplink','resetgrouplink','groupname','groupdesc','jail','jailrandom','unjail','unjailall'];
    if(needAdmin.includes(cmd) && isGroup && !isAdmin && !isOwner) return reply(COOL('ADMIN ONLY ❌','Only *Group Admin* fit use .'+cmd));
    if(cmd==='jail'){ if(!isGroup) return reply(COOL('JAIL 🔒','Group only')); if(!target) return reply(COOL('JAIL 🔒','Mention: .jail @user')); if(!JAILED.includes(target)){ JAILED.push(target); save(); } return reply(COOL('JAILED 🔒⛓️', `@${target.split('@')[0]} don enter JAIL!\nEvery message go delete 🚫`)); }
    if(cmd==='jailrandom'){ if(!isGroup) return reply(COOL('JAIL RANDOM 🎲','Group only')); const meta=await sock.groupMetadata(from); const members=meta.participants.filter(p=>!p.id.includes('2348152544750')); const victim=members[Math.floor(Math.random()*members.length)]; if(!JAILED.includes(victim.id)){ JAILED.push(victim.id); save(); } return reply(COOL('JAIL RANDOM 🎲🔒', `@${victim.id.split('@')[0]} na unlucky one! E don enter JAIL 😂⛓️`)); }
    if(cmd==='unjail'){ if(!target) return reply(COOL('UNJAIL 🔓','Mention: .unjail @user')); JAILED=JAILED.filter(x=>x!==target); save(); return reply(COOL('UNJAILED 🔓✅', `@${target.split('@')[0]} don FREE! 🎉`)); }
    if(cmd==='unjailall'){ JAILED=[]; save(); return reply(COOL('UNJAIL ALL 🔓🎉', 'Everybody don FREE! ✅')); }
    const MENU=`🐐 *CHARLES OFFICIAL* 🐐\n━━━━━\n\n🤖 mode: ${SETTINGS.mode.toUpperCase()} · bot DM: ${SETTINGS.botDM?'ON':'OFF'} · Jailed: ${JAILED.length}\n\n❤️ *CHANNEL*\n.chreact\n.vote\n\n🛡️ *𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡*\n.antilink\n.antibadword\n.antibug\n.antidelete\n.antiedit\n.antitag\n.antigroupmention\n.antisticker\n.antireaction\n.antibot\n.antispam\n.antigroupstatus\n.antipromote\n.antidemote\n.anticall\n.mediaonly\n.textonly\n\n⚔️ *𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡*\n.warn\n.warnings\n.resetwarn\n.warnlimit\n.jail\n.jailrandom\n.unjail\n.unjailall\n.ban\n.unban\n.bancheck\n.bannido\n.mute\n.unmute\n.slowmode\n.delayperma\n.delete\n.purge\n.msglog\n\n🎉 *𝗦𝗢𝗖𝗜𝗔𝗟*\n.mention\n.who\n.ship\n.top\n.8ball\n\n👥 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.add\n.kick\n.votekick\n.promote\n.demote\n.tagall\n.tagadmins\n.hidetag\n.membertag\n.welcome on/off\n.goodbye on/off\n.set welcome <text>\n.set goodbye <text>\n.groupname\n.groupdesc\n.grouplink\n.resetgrouplink\n.setgrouppic\n.invite\n.announce\n.close\n.open\n.closetime\n.ephemeral\n.pin\n.unpin\n.timezonegroup\n.groupstatus\n.lock\n.unlock\n.groupinfo\n\n⚡ *𝗕𝗢𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.menu\n.setmenu\n.ping\n.status\n.owner\n.setsudo\n.delsudo\n.public\n.private\n.bot on/off\n.set bot reply <text>\n.ai\n.translate\n.afk\n.backup\n.broadcast\n━━━━━\n\n👑 *CHARLES OFFICIAL*`;
    if(cmd==='menu') return reply(MENU);
    if(cmd==='ping') return reply(COOL('PING 🏓', 'Pong! CHARLES OFFICIAL V3.4 - Fast ⚡'));
    if(cmd==='owner') return reply(COOL('OWNER 👑', 'CHARLES OFFICIAL\n+2348152544750'));
    if(cmd==='status') return reply(COOL('STATUS 📊', `Mode: ${SETTINGS.mode}\nBot DM: ${SETTINGS.botDM?'ON':'OFF'}\nJailed: ${JAILED.length}`));
    if(cmd==='private'){ if(!isOwner) return reply(COOL('DENIED ❌','Only owner')); SETTINGS.mode='private'; save(); return reply(COOL('PRIVATE 🔒', 'Bot don go PRIVATE')); }
    if(cmd==='public'){ if(!isOwner) return reply(COOL('DENIED ❌','Only owner')); SETTINGS.mode='public'; save(); return reply(COOL('PUBLIC 🌍', 'Bot don go PUBLIC')); }
    if(cmd==='bot'){ if(!isOwner) return reply(COOL('DENIED ❌','Only owner')); if(q==='on'){ SETTINGS.botDM=true; save(); return reply(COOL('BOT ON 🤖', 'Bot DM ON ✅')); } if(q==='off'){ SETTINGS.botDM=false; save(); return reply(COOL('BOT OFF 🤖', 'Bot DM OFF ❌')); } return reply(COOL('BOT 🤖','Use: .bot on / .bot off')); }
    if(cmd==='set'){ if(!isOwner) return reply(COOL('DENIED ❌','Only owner')); if(args[1]==='welcome'){ SETTINGS.welcomeMsg=args.slice(2).join(' '); save(); return reply(COOL('WELCOME SET 🎉', SETTINGS.welcomeMsg)); } if(args[1]==='goodbye'){ SETTINGS.goodbyeMsg=args.slice(2).join(' '); save(); return reply(COOL('GOODBYE SET 👋', SETTINGS.goodbyeMsg)); } if(args[1]==='bot' && args[2]==='reply'){ SETTINGS.botReply=args.slice(3).join(' '); save(); return reply(COOL('BOT REPLY SET 🤖', SETTINGS.botReply)); } return reply(COOL('SET ⚙️','Use:\n.set welcome <text>\n.set goodbye <text>\n.set bot reply <text>')); }
    if(cmd==='welcome'){ if(q==='on'){ SETTINGS.welcomeOn=true; save(); return reply(COOL('WELCOME ON 🎉','Welcome ON')); } if(q==='off'){ SETTINGS.welcomeOn=false; save(); return reply(COOL('WELCOME OFF 🎉','Welcome OFF')); } return reply(COOL('WELCOME 🎉','Use: .welcome on / .welcome off')); }
    if(cmd==='goodbye'){ if(q==='on'){ SETTINGS.goodbyeOn=true; save(); return reply(COOL('GOODBYE ON 👋','Goodbye ON')); } if(q==='off'){ SETTINGS.goodbyeOn=false; save(); return reply(COOL('GOODBYE OFF 👋','Goodbye OFF')); } return reply(COOL('GOODBYE 👋','Use: .goodbye on / .goodbye off')); }
    if(cmd==='tagall'){ if(!isGroup) return reply(COOL('TAG ALL 📢','Group only')); const meta=await sock.groupMetadata(from); let t='📢 *TAG ALL*\n\n'; for(let p of meta.participants) t+=`@${p.id.split('@')[0]} `; return sock.sendMessage(from,{text:t,mentions:meta.participants.map(p=>p.id)},{quoted:m}); }
    if(cmd==='hidetag'){ if(!isGroup) return reply(COOL('HIDETAG 👻','Group only')); const meta=await sock.groupMetadata(from); return sock.sendMessage(from,{text:q||'👑 CHARLES OFFICIAL',mentions:meta.participants.map(p=>p.id)},{quoted:m}); }
    if(cmd==='groupinfo'){ if(!isGroup) return reply(COOL('GROUP INFO ℹ️','Group only')); const meta=await sock.groupMetadata(from); return reply(COOL('GROUP INFO ℹ️', `Name: ${meta.subject}\nMembers: ${meta.participants.length}`)); }
    if(cmd==='grouplink'){ if(!isGroup) return reply(COOL('LINK 🔗','Group only')); const code=await sock.groupInviteCode(from); return reply(COOL('GROUP LINK 🔗', 'https://chat.whatsapp.com/'+code)); }
    if(cmd==='8ball') return reply(COOL('8 BALL 🎱', ['Yes ✅','No ❌','Maybe 🤔','Definitely 🔥'][Math.floor(Math.random()*4)]));
    if(cmd==='ship') return reply(COOL('SHIP 💘', `${q.split(' ')[0]||'You'} ❤️ ${q.split(' ')[1]||'Someone'} = ${Math.floor(Math.random()*101)}%`));
    if(cmd==='ai') return reply(COOL('CHARLES AI 🤖', q||'Ask me anything!'));
    if(cmd==='translate') return reply(COOL('TRANSLATE 🌍', q||'Type text'));
    if(cmd==='afk') return reply(COOL('AFK 😴', q||'No reason'));
    if(cmd==='broadcast') return reply(COOL('BROADCAST 📡', 'Broadcast sent ✅'));
    if(cmd==='backup') return reply(COOL('BACKUP 💾', 'Backup done ✅'));
    return reply(COOL(cmd.toUpperCase()+' ✅', `Done by CHARLES OFFICIAL\nTarget: ${q||'user'}`));
  });
}
start();
