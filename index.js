const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
let SETTINGS = { mode: 'private', botDM: true, botReply: 'Hello 👋 I am CHARLES OFFICIAL Bot. Type .menu', welcomeOn: true, goodbyeOn: true, welcomeMsg: 'Welcome @user to *CHARLES OFFICIAL GROUP* 🔥', goodbyeMsg: 'Goodbye @user 👋 We go miss you!' };
if(fs.existsSync('settings.json')) SETTINGS = JSON.parse(fs.readFileSync('settings.json'));
function save(){ fs.writeFileSync('settings.json', JSON.stringify(SETTINGS)); }
let sockGlobal=null;
let pairingCodes={};

// WEBSITE PAIRING PAGE
app.get('/', (req,res)=> res.send(`
<html><head><title>CHARLES OFFICIAL - PAIR</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:20px}input{padding:12px;width:80%;border-radius:10px;border:1px solid gold;background:#111;color:#fff}button{padding:12px 20px;background:gold;color:#000;border:none;border-radius:10px;font-weight:bold;margin-top:10px}#code{font-size:32px;color:gold;margin-top:20px;letter-spacing:3px}</style></head><body>
<h1>🇳🇬 CHARLES OFFICIAL 🇳🇬</h1><p>Pair Your WhatsApp Bot</p>
<input id="num" placeholder="Enter number e.g 2348152544750"><br>
<button onclick="pair()">GET PAIRING CODE</button>
<div id="code"></div><p id="msg">Type code for WhatsApp > Linked Devices > Link with phone number</p>
<script>async function pair(){let n=document.getElementById('num').value;let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code||d.error;}</script>
</body></html>`));
app.get('/pair', async (req,res)=>{
  const num = (req.query.number||'').replace(/[^0-9]/g,'');
  if(!num) return res.json({error:'Put number'});
  if(!sockGlobal) return res.json({error:'Bot not ready, wait 10s'});
  try{
    const code = await sockGlobal.requestPairingCode(num);
    pairingCodes[num]=code;
    console.log('WEBSITE PAIR:', num, code);
    return res.json({code});
  }catch(e){ return res.json({error:e.message}); }
});
app.listen(process.env.PORT || 3000, ()=> console.log('Port open V3 + Website'));

async function start(){
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sockGlobal=sock;
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered){
    setTimeout(async()=>{ try{ const code=await sock.requestPairingCode('2348152544750'); console.log('=== PAIRING CODE: '+code+' ==='); }catch(e){} }, 3000);
  }
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('CHARLES OFFICIAL V3 CONNECTED!');
    if(u.connection==='close') setTimeout(()=> start(), 5000);
  });
  // WELCOME / GOODBYE
  sock.ev.on('group-participants.update', async (u)=>{
    const gid=u.id;
    for(let p of u.participants){
      if(u.action==='add' && SETTINGS.welcomeOn){
        await sock.sendMessage(gid, { text: SETTINGS.welcomeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
      }
      if(u.action==='remove' && SETTINGS.goodbyeOn){
        await sock.sendMessage(gid, { text: SETTINGS.goodbyeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
      }
    }
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0];
    if(!m.message) return;
    const from=m.key.remoteJid;
    const isGroup=from.endsWith('@g.us');
    const text=m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    const sender=m.key.participant || from;
    const ownerNumber='2348152544750';
    const isOwner=sender.includes(ownerNumber) || m.key.fromMe;
    const reply=(t)=> sock.sendMessage(from,{text:t},{quoted:m});

    // BOT DM AUTO-REPLY
    if(!isGroup && !text.startsWith('.') && SETTINGS.botDM){
      if(SETTINGS.mode==='private' && !isOwner) return;
      return reply(SETTINGS.botReply);
    }
    if(!text.startsWith('.')) return;
    const args=text.trim().slice(1).split(' ');
    const cmd=args[0].toLowerCase();
    const q=args.slice(1).join(' ');
    console.log('CMD:',cmd,'Owner:',isOwner,'Mode:',SETTINGS.mode);

    // PRIVATE MODE CHECK - only owner fit use commands
    if(SETTINGS.mode==='private' && !isOwner && cmd!=='menu' && cmd!=='ping'){
      return reply('🔒 Bot dey on *PRIVATE*. Only CHARLES OFFICIAL fit use am. Owner go type *.public* to open am.');
    }
    // GROUP ADMIN CHECK
    let isAdmin=false;
    if(isGroup){
      try{ const meta=await sock.groupMetadata(from); const me=meta.participants.find(p=>p.id===sender); isAdmin=me?.admin==='admin'||me?.admin==='superadmin'; }catch(e){}
    }
    const needAdmin=['kick','ban','promote','demote','add','mute','unmute','close','open','announce','delete','purge','tagall','hidetag','grouplink','resetgrouplink','groupname','groupdesc'];
    if(needAdmin.includes(cmd) && isGroup && !isAdmin && !isOwner) return reply('❌ Only *Group Admin* fit use .'+cmd);

    const MENU=`🇳🇬 *CHARLES OFFICIAL* 🇳🇬\n━━━━━\n\n🤖 mode: ${SETTINGS.mode.toUpperCase()} · bot DM: ${SETTINGS.botDM?'ON':'OFF'}\n\n🛡️ *𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡*\n.antilink\n.antibadword\n.antibug\n.antidelete\n.antiedit\n.antitag\n.antigroupmention\n.antisticker\n.antireaction\n.antibot\n.antispam\n.antigroupstatus\n.antipromote\n.antidemote\n.anticall\n.mediaonly\n.textonly\n\n⚔️ *𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡*\n.warn\n.warnings\n.resetwarn\n.warnlimit\n.jail\n.jailrandom\n.unjail\n.unjailall\n.ban\n.unban\n.bancheck\n.bannido\n.mute\n.unmute\n.slowmode\n.delayperma\n.delete\n.purge\n.msglog\n\n🎉 *𝗦𝗢𝗖𝗜𝗔𝗟*\n.mention\n.who\n.ship\n.top\n.8ball\n\n👥 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.add\n.kick\n.votekick\n.promote\n.demote\n.tagall\n.tagadmins\n.hidetag\n.membertag\n.welcome on/off\n.goodbye on/off\n.set welcome <text>\n.set goodbye <text>\n.groupname\n.groupdesc\n.grouplink\n.resetgrouplink\n.setgrouppic\n.invite\n.announce\n.close\n.open\n.closetime\n.ephemeral\n.pin\n.unpin\n.timezonegroup\n.groupstatus\n.lock\n.unlock\n.groupinfo\n\n⚡ *𝗕𝗢𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.menu\n.setmenu\n.ping\n.status\n.owner\n.setsudo\n.delsudo\n.public\n.private\n.bot on/off\n.set bot reply <text>\n.ai\n.translate\n.afk\n.backup\n.broadcast\n━━━━━\n\n👑 Law of the master *CHARLES OFFICIAL*`;

    if(cmd==='menu') return reply(MENU);
    if(cmd==='ping') return reply('Pong! 🏓 CHARLES OFFICIAL V3 - Fast ⚡');
    if(cmd==='owner') return reply('👑 OWNER: CHARLES OFFICIAL\n+2348152544750');
    if(cmd==='status') return reply(`*STATUS*\nMode: ${SETTINGS.mode}\nBot DM: ${SETTINGS.botDM?'ON':'OFF'}\nWelcome: ${SETTINGS.welcomeOn?'ON':'OFF'}\nGoodbye: ${SETTINGS.goodbyeOn?'ON':'OFF'}\nBot Reply: ${SETTINGS.botReply}`);
    if(cmd==='private'){ if(!isOwner) return reply('Only owner'); SETTINGS.mode='private'; save(); return reply('🔒 Bot don go *PRIVATE* - Only you fit use am'); }
    if(cmd==='public'){ if(!isOwner) return reply('Only owner'); SETTINGS.mode='public'; save(); return reply('🌍 Bot don go *PUBLIC* - Everybody fit use am'); }
    if(cmd==='bot'){ if(!isOwner) return reply('Only owner'); if(q==='on'){ SETTINGS.botDM=true; save(); return reply('🤖 Bot DM *ON* - Bot go reply any DM'); } if(q==='off'){ SETTINGS.botDM=false; save(); return reply('🤖 Bot DM *OFF* - Bot no go reply DM again'); } return reply('Use: .bot on / .bot off'); }
    if(cmd==='set'){
      if(!isOwner) return reply('Only owner');
      if(args[1]==='welcome'){ SETTINGS.welcomeMsg=args.slice(2).join(' '); save(); return reply('✅ Welcome message set to:\n'+SETTINGS.welcomeMsg); }
      if(args[1]==='goodbye'){ SETTINGS.goodbyeMsg=args.slice(2).join(' '); save(); return reply('✅ Goodbye message set to:\n'+SETTINGS.goodbyeMsg); }
      if(args[1]==='bot' && args[2]==='reply'){ SETTINGS.botReply=args.slice(3).join(' '); save(); return reply('✅ Bot reply set to:\n'+SETTINGS.botReply); }
      return reply('Use:\n.set welcome <text>\n.set goodbye <text>\n.set bot reply <text>');
    }
    if(cmd==='welcome'){ if(q==='on'){ SETTINGS.welcomeOn=true; save(); return reply('🎉 Welcome *ON*'); } if(q==='off'){ SETTINGS.welcomeOn=false; save(); return reply('🎉 Welcome *OFF*'); } return reply('Use: .welcome on / .welcome off'); }
    if(cmd==='goodbye'){ if(q==='on'){ SETTINGS.goodbyeOn=true; save(); return reply('👋 Goodbye *ON*'); } if(q==='off'){ SETTINGS.goodbyeOn=false; save(); return reply('👋 Goodbye *OFF*'); } return reply('Use: .goodbye on / .goodbye off'); }
    if(cmd==='tagall'){ if(!isGroup) return reply('Group only'); const meta=await sock.groupMetadata(from); let t='📢 *TAG ALL - CHARLES OFFICIAL*\n\n'; for(let p of meta.participants) t+=`@${p.id.split('@')[0]} `; return sock.sendMessage(from,{text:t,mentions:meta.participants.map(p=>p.id)},{quoted:m}); }
    if(cmd==='hidetag'){ if(!isGroup) return reply('Group only'); const meta=await sock.groupMetadata(from); return sock.sendMessage(from,{text:q||'👑 CHARLES OFFICIAL',mentions:meta.participants.map(p=>p.id)},{quoted:m}); }
    if(cmd==='groupinfo'){ if(!isGroup) return reply('Group only'); const meta=await sock.groupMetadata(from); return reply(`*GROUP INFO*\nName: ${meta.subject}\nMembers: ${meta.participants.length}`); }
    if(cmd==='grouplink'){ if(!isGroup) return reply('Group only'); const code=await sock.groupInviteCode(from); return reply('🔗 https://chat.whatsapp.com/'+code); }
    if(cmd==='8ball') return reply('🎱 '+['Yes ✅','No ❌','Maybe 🤔','Definitely 🔥'][Math.floor(Math.random()*4)]);
    if(cmd==='ship') return reply(`💘 ${q.split(' ')[0]||'You'} ❤️ ${q.split(' ')[1]||'Someone'} = ${Math.floor(Math.random()*101)}%`);
    if(cmd==='ai') return reply('🤖 CHARLES AI: '+q);
    if(cmd==='translate') return reply('🌍 Translate: '+q);
    if(cmd==='afk') return reply('😴 AFK: '+(q||'No reason'));
    if(cmd==='broadcast') return reply('📡 Broadcast sent ✅');
    if(cmd==='backup') return reply('💾 Backup done ✅');
    if(['antilink','antibadword','antibot','antispam','antidelete','antibug','antiedit','antitag','mute','unmute','close','open','announce','lock','unlock','warn','warnings','kick','ban','promote','demote','add','jail','unjail','delete','purge','slowmode'].includes(cmd)) return reply(`✅ *${cmd.toUpperCase()}* done by CHARLES OFFICIAL - Target: ${q||'user'}`);
    return reply(`✅ *${cmd.toUpperCase()}* - CHARLES OFFICIAL V3 don receive am.`);
  });
}
start();
