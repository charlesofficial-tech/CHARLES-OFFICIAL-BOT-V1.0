import pathlib, re
p = pathlib.Path("index.js")
t = p.read_text()
print("Original size:", len(t))

# 1. ADD SETTINGS AT TOP (if not there)
if "OWNER_NUMBER" not in t:
    t = "let MODE='private';\nlet GROUP_MODE='on';\nlet OWNER_NUMBER='2348012345678'; // CHANGE THIS TO YOUR NUMBER\n" + t
    print("✅ Settings added")

# 2. ADD FILTER + COMMANDS - Find where commands start
# We go insert our commands right after messages.upsert
cmd_code = '''
    // ===== CHARLES OFFICIAL AUTO-FIX START =====
    try{
    let senderNum = (m.sender || m.key.participant || m.key.remoteJid || "").split('@')[0];
    let isGroupMsg = (from || "").endsWith('@g.us');
    let isOwner = senderNum === OWNER_NUMBER || m.key.fromMe;
    let cmd = (body || "").split(' ')[0].replace(/^[.!#]/,'').toLowerCase();
    let text = (body || "").split(' ').slice(1).join(' ');
    // GROUP OFF FILTER
    if(isGroupMsg && GROUP_MODE==='off' && cmd!=='group'){ return; }
    // PRIVATE MODE FILTER
    if(MODE==='private' && !isOwner && cmd!=='mode' && cmd!=='group'){ 
        // In private mode, only owner fit use commands
        if(!isGroupMsg) return;
        if(isGroupMsg) return;
    }
    if(cmd==='mode'){
      if(!isOwner) return await sock.sendMessage(from,{text:'❌ Only paired number fit change mode'});
      if(!text) return await sock.sendMessage(from,{text:'Usage: .mode private / .mode public\\nCurrent: '+MODE});
      if(['private','public'].includes(text.toLowerCase())){ MODE=text.toLowerCase(); return await sock.sendMessage(from,{text:'✅ Mode set to *'+MODE.toUpperCase()+'*'}); }
    }
    if(cmd==='group'){
      if(!isOwner) return await sock.sendMessage(from,{text:'❌ Only paired number'});
      if(text.toLowerCase()==='on'){ GROUP_MODE='on'; return await sock.sendMessage(from,{text:'✅ Group ON - Bot go reply for group'}); }
      if(text.toLowerCase()==='off'){ GROUP_MODE='off'; return await sock.sendMessage(from,{text:'✅ Group OFF - Bot NO go reply'}); }
      return await sock.sendMessage(from,{text:'Group: '+GROUP_MODE+'\\nUse: .group on / .group off'});
    }
    if(cmd==='vv' || cmd==='vv2'){
      let quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if(!quoted) return await sock.sendMessage(from,{text:'Reply to View Once photo/video with .vv'});
      try{
        let q = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted;
        let isImg = q.imageMessage ? 'image' : q.videoMessage ? 'video' : null;
        if(!isImg) return await sock.sendMessage(from,{text:'❌ No be View Once'});
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        let stream = await downloadContentFromMessage(q[isImg+'Message'] || q, isImg);
        let buf = Buffer.from([]);
        for await (const chunk of stream){ buf = Buffer.concat([buf, chunk]); }
        let ownerJid = OWNER_NUMBER + '@s.whatsapp.net';
        if(isImg==='image') await sock.sendMessage(ownerJid,{image:buf, caption:'👁️ View Once .vv\\n© CHARLES OFFICIAL'});
        else await sock.sendMessage(ownerJid,{video:buf, caption:'👁️ View Once Video .vv\\n© CHARLES OFFICIAL'});
        await sock.sendMessage(from,{text:'✅ Sent to your paired number self-chat'});
      }catch(e){ await sock.sendMessage(from,{text:'❌ '+e.message}); }
      return;
    }
    }catch(e){ console.log('AUTO-FIX ERROR', e.message); }
    // ===== CHARLES OFFICIAL AUTO-FIX END =====
'''

if "CHARLES OFFICIAL AUTO-FIX" not in t:
    # Try to insert after messages.upsert line
    if "messages.upsert" in t:
        t = t.replace("messages.upsert", "messages.upsert", 1)
        # Find first occurrence of "=> {" after upsert and insert after
        idx = t.find("messages.upsert")
        idx2 = t.find("{", idx)
        t = t[:idx2+1] + "\n" + cmd_code + "\n" + t[idx2+1:]
        print("✅ Commands inserted after messages.upsert")
    else:
        t = t + "\n" + cmd_code
        print("✅ Commands appended at bottom")

# 3. REMOVE ADMIN BLOCK - make group commands work for all
t = t.replace("if(!isAdmin) return", "// ADMIN CHECK REMOVED - CHARLES OFFICIAL - if(!isAdmin) return")
t = t.replace("if (!isAdmin) return", "// ADMIN CHECK REMOVED")
print("✅ Admin check removed")

p.write_text(t)
print("DONE! New size:", len(t))
print("Now change your number: sed -i 's/2348012345678/YOURNUMBER/g' index.js")
