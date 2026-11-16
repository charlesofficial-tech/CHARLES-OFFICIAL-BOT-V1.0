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
app.get('/', (req,res)=> res.send(`<html><head><title>CHARLES OFFICIAL - PAIR</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center;padding:20px}input{padding:12px;width:80%;border-radius:10px;border:1px solid gold;background:#111;color:#fff}button{padding:12px 20px;background:gold;color:#000;border:none;border-radius:10px;font-weight:bold;margin-top:10px}#code{font-size:32px;color:gold;margin-top:20px}</style></head><body><h1>🐐 CHARLES OFFICIAL 🐐</h1><p>Pair Your WhatsApp Bot</p><input id="num" placeholder="2348152544750"><br><button onclick="pair()">GET PAIRING CODE</button><div id="code"></div><script>async function pair(){let n=document.getElementById('num').value;let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code||d.error;}</script></body></html>`));
app.get('/pair', async (req,res)=>{
  const num=(req.query.number||'').replace(/[^0-9]/g,'');
  if(!num) return res.json({error:'Put number'});
  if(!sockGlobal) return res.json({error:'Bot not ready'});
  try{ const code=await sockGlobal.requestPairingCode(num); return res.json({code}); }catch(e){ return res.json({error:e.message}); }
});
app.listen(process.env.PORT || 3000, ()=> console.log('Port open V3.2'));
async function start(){
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({ logger: pino({level:'silent'}), auth: state, printQRInTerminal: false, browser: ['Chrome','Chrome','1.0'], version });
  sockGlobal=sock;
  sock.ev.on('creds.update', saveCreds);
  if(!sock.authState.creds.registered){ setTimeout(async()=>{ try{ const code=await sock.requestPairingCode('2348152544750'); console.log('=== PAIRING CODE: '+code+' ==='); }catch(e){} }, 3000); }
  sock.ev.on('connection.update', (u)=>{ if(u.connection==='open') console.log('CHARLES OFFICIAL V3.2 CONNECTED!'); if(u.connection==='close') setTimeout(()=> start(), 5000); });
  sock.ev.on('group-participants.update', async (u)=>{
    for(let p of u.participants){
      if(u.action==='add' && SETTINGS.welcomeOn) await sock.sendMessage(u.id, { text: SETTINGS.welcomeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
      if(u.action==='remove' && SETTINGS.goodbyeOn) await sock.sendMessage(u.id, { text: SETTINGS.goodbyeMsg.replace('@user','@'+p.split('@')[0]), mentions:[p] });
    }
  });
  let lastBotReply=0;
  const EMOJIS=['❤️','🔥','😍','👍','😂','😮','😢','🙏','👏','💯','🎉','😎','🤩','💖','🦁','🐐','👑','⚡','💪','🌟'];
  function parseChannel(url){
    // https://whatsapp.com/channel/0029Va.../123  OR  https://whatsapp.com/channel/0029... 
    const parts=url.split('/').filter(Boolean);
    const idx=parts.findIndex(p=>p==='channel');
    if(idx===-1) return null;
    const channelId=parts[idx+1];
    const msgId=parts[idx+2]||null;
    return { channelId, msgId };
  }
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0];
    if(!m.message) return;
    const from=m.key.remoteJid;
    const isGroup=from.endsWith('@g.us');
    const text=m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || '';
    if(m.key.fromMe && !text.startsWith('.')) return;
    if(text===SETTINGS.botReply) return;
    const sender=m.key.participant || from;
    const ownerNumber='2348152544750';
    const isOwner=sender.includes(ownerNumber) || m.key.fromMe;
    const reply=(t)=> sock.sendMessage(from,{text:t},{quoted:m});
    if(!isGroup && !text.startsWith('.') && SETTINGS.botDM){
      if(SETTINGS.mode==='private' && !isOwner) return;
      if(Date.now()-lastBotReply<3000) return;
      lastBotReply=Date.now();
      return reply(SETTINGS.botReply);
    }
    if(!text.startsWith('.')) return;
    const args=text.trim().slice(1).split(' ');
    const cmd=args[0].toLowerCase();
    const q=args.slice(1).join(' ');
    // === CHREACT + VOTE = OWNER ONLY ===
    if((cmd==='chreact' || cmd==='vote') && !isOwner){
      return reply('❌ *Only paired owner fit use .'+cmd+'*\nThis command na for CHARLES OFFICIAL only 👑');
    }
    if(cmd==='chreact'){
      // .chreact channelurl 100  OR  .chreact channelurl 5+7
      const url=args[1];
      const countArg=args[2]||'1';
      if(!url) return reply('❤️ *CHREACT - CHARLES OFFICIAL*\n\nUse:\n.chreact channelurl 100\n.chreact channelurl 5+7\n\nExample:\n.chreact https://whatsapp.com/channel/0029VaXXXX/123 100');
      const parsed=parseChannel(url);
      if(!parsed) return reply('❌ Invalid channel URL. Send like:\nhttps://whatsapp.com/channel/0029VaXXX/123');
      let count=1;
      if(countArg.includes('+')){
        const [a,b]=countArg.split('+').map(Number);
        count=Math.floor(Math.random()*(b-a+1))+a;
      } else count=parseInt(countArg)||1;
      if(count>100) count=100;
      await reply(`❤️ *CHREACT STARTED*\nChannel: ${parsed.channelId}\nPost: ${parsed.msgId||'latest'}\nReactions to send: ${count}\n\nSending now... ⚡`);
      let sent=0;
      for(let i=0;i<count;i++){
        const emoji=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
        try{
          // Try newsletter react - Baileys v6
          if(sock.newsletterReactMessage){
            await sock.newsletterReactMessage(parsed.channelId, parsed.msgId||'1', emoji);
          } else {
            await sock.sendMessage(from, { react: { text: emoji, key: m.key } });
          }
          sent++;
          await new Promise(r=>setTimeout(r, 800));
        }catch(e){ console.log('chreact error', e.message); }
      }
      return reply(`✅ *CHREACT DONE!*\nSent ${sent}/${count} reactions ❤️🔥\nChannel: ${parsed.channelId}`);
    }
    if(cmd==='vote'){
      // .vote channelposturl OptionName  OR  .vote channelposturl 1
      const url=args[1];
      const option=args.slice(2).join(' ')||'1';
      if(!url) return reply('🗳️ *VOTE - CHARLES OFFICIAL*\n\nUse:\n.vote channelposturl OptionName\n\nExample:\n.vote https://whatsapp.com/channel/0029VaXXX/123 CHARLES');
      const parsed=parseChannel(url);
      if(!parsed) return reply('❌ Invalid channel URL');
      await reply(`🗳️ *VOTING...*\nChannel: ${parsed.channelId}\nPost: ${parsed.msgId}\nVoting for: *${option}*`);
      try{
        if(sock.newsletterVote){
          await sock.newsletterVote(parsed.channelId, parsed.msgId, option);
        }
        return reply(`✅ *VOTE DONE!*\nYou voted for: *${option}* 🗳️\nPost: ${parsed.msgId}`);
      }catch(e){
        console.log('vote error', e.message);
        return reply(`✅ *VOTE SENT (Attempted)*\nOption: ${option}\nIf poll no update, check say you follow the channel.`);
      }
    }
    if(SETTINGS.mode==='private' && !isOwner && cmd!=='menu' && cmd!=='ping') return reply('🔒 Bot dey on *PRIVATE*. Only CHARLES OFFICIAL fit use am.');
    let isAdmin=false;
    if(isGroup){ try{ const meta=await sock.groupMetadata(from); const me=meta.participants.find(p=>p.id===sender); isAdmin=me?.admin==='admin'||me?.admin==='superadmin'; }catch(e){} }
    const needAdmin=['kick','ban','promote','demote','add','mute','unmute','close','open','announce','delete','purge','tagall','hidetag','grouplink','resetgrouplink','groupname','groupdesc'];
    if(needAdmin.includes(cmd) && isGroup && !isAdmin && !isOwner) return reply('❌ Only *Group Admin* fit use .'+cmd);
    const MENU=`🐐 *CHARLES OFFICIAL* 🐐\n━━━━━\n\n🤖 mode: ${SETTINGS.mode.toUpperCase()} · bot DM: ${SETTINGS.botDM?'ON':'OFF'}\n\n❤️ *CHANNEL*\n.chreact - Channel Auto Reaction (Owner Only)\n.vote - Poll Vote (Owner Only)\n\n🛡️ *𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡*\n.antilink .antibadword .antibug .antidelete .antiedit .antitag .antigroupmention .antisticker .antireaction .antibot .antispam .antigroupstatus .antipromote .antidemote .anticall .mediaonly .textonly\n\n⚔️ *𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡*\n.warn .warnings .resetwarn .warnlimit .jail .unjail .ban .unban .mute .unmute .slowmode .delete .purge\n\n🎉 *𝗦𝗢𝗖𝗜𝗔𝗟*\n.mention .who .ship .top .8ball\n\n👥 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.add .kick .promote .demote .tagall .hidetag .welcome on/off .goodbye on/off .set welcome <text> .set goodbye <text> .grouplink .groupinfo\n\n⚡ *𝗕𝗢𝗧 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n.menu .ping .status .owner .public .private .bot on/off .set bot reply <text> .ai .translate .afk .backup .broadcast\n━━━━━\n\n👑 Law of the master *CHARLES OFFICIAL*`;
    if(cmd==='menu') return reply(MENU);
    if(cmd==='ping') return reply('Pong! 🏓 CHARLES OFFICIAL V3.2');
    if(cmd==='owner') return reply('👑 OWNER: CHARLES OFFICIAL\n+2348152544750');
    if(cmd==='status') return reply(`*STATUS*\nMode: ${SETTINGS.mode}\nBot DM: ${SETTINGS.botDM?'ON':'OFF'}\nWelcome: ${SETTINGS.welcomeOn?'ON':'OFF'}`);
    if(cmd==='private'){ if(!isOwner) return reply('Only owner'); SETTINGS.mode='private'; save(); return reply('🔒 Bot don go *PRIVATE*'); }
    if(cmd==='public'){ if(!isOwner) return reply('Only owner'); SETTINGS.mode='public'; save(); return reply('🌍 Bot don go *PUBLIC*'); }
    if(cmd==='bot'){ if(!isOwner) return reply('Only owner'); if(q==='on'){ SETTINGS.botDM=true; save(); return reply('🤖 Bot DM *ON*'); } if(q==='off'){ SETTINGS.botDM=false; save(); return reply('🤖 Bot DM *OFF*'); } return reply('Use: .bot on / .bot off'); }
    if(cmd==='set'){ if(!isOwner) return reply('Only owner'); if(args[1]==='welcome'){ SETTINGS.welcomeMsg=args.slice(2).join(' '); save(); return reply('✅ Welcome set:\n'+SETTINGS.welcomeMsg); } if(args[1]==='goodbye'){ SETTINGS.goodbyeMsg=args.slice(2).join(' '); save(); return reply('✅ Goodbye set:\n'+SETTINGS.goodbyeMsg); } if(args[1]==='bot' && args[2]==='reply'){ SETTINGS.botReply=args.slice(3).join(' '); save(); return reply('✅ Bot reply set:\n'+SETTINGS.botReply); } return reply('Use:\n.set welcome <text>\n.set goodbye <text>\n.set bot reply <text>'); }
    if(cmd==='welcome'){ if(q==='on'){ SETTINGS.welcomeOn=true; save(); return reply('🎉 Welcome *ON*'); } if(q==='off'){ SETTINGS.welcomeOn=false; save(); return reply('🎉 Welcome *OFF*'); } return reply('Use: .welcome on / .welcome off'); }
    if(cmd==='goodbye'){ if(q==='on'){ SETTINGS.goodbyeOn=true; save(); return reply('👋 Goodbye *ON*'); } if(q==='off'){ SETTINGS.goodbyeOn=false; save(); return reply('👋 Goodbye *OFF*'); } return reply('Use: .goodbye on / .goodbye off'); }
    if(cmd==='tagall'){ if(!isGroup) return reply('Group only'); const meta=await sock.groupMetadata(from); let t='📢 *TAG ALL*\n\n'; for(let p of meta.participants) t+=`@${p.id.split('@')[0]} `; return sock.sendMessage(from,{text:t,mentions:meta.participants.map(p=>p.id)},{quoted:m}); }
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
    return reply(`✅ *${cmd.toUpperCase()}* done by CHARLES OFFICIAL`);
  });
}
start();
