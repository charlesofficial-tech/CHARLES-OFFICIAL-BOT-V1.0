import pathlib
p = pathlib.Path("index.js")
t = p.read_text()

# 1. Add global settings at top if not exist
if "globalGroupMode" not in t:
    t = t.replace("const sock", "let MODE = 'private'; // private or public\nlet GROUP_MODE = 'on'; // on or off\nconst OWNER_NUMBER = '2340000000000'; // <-- CHANGE TO YOUR PAIRED NUMBER e.g 2348012345678\nlet globalGroupMode = 'on';\nconst sock", 1) if "const sock" in t else "let MODE='private';\nlet GROUP_MODE='on';\nlet OWNER_NUMBER='2340000000000';\n" + t
    print("Settings added - CHANGE OWNER_NUMBER to your number!")

# 2. Add commands - insert before ping/alive
code = r'''
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
'''
# Insert before ping
for anchor in ["if(cmd==='ping')","if(cmd==='alive')"]:
    if anchor in t:
        t = t.replace(anchor, code + "\n    " + anchor, 1)
        break
p.write_text(t)
print("✅ MODE / GROUP / VV ADDED")
