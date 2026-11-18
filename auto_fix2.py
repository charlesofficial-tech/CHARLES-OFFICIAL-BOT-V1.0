import pathlib
p = pathlib.Path("index.js")
lines = p.read_text().splitlines()
print("Total lines:", len(lines))

# 1. Add settings at top
if not any("OWNER_NUMBER" in l for l in lines):
    lines.insert(0, "let MODE='private';")
    lines.insert(1, "let GROUP_MODE='on';")
    lines.insert(2, "let OWNER_NUMBER='2348012345678'; // CHANGE TO YOUR NUMBER")
    print("✅ Settings added")

# 2. Find where to insert commands - look for 'const m =' or 'let m ='
insert_at = -1
for i, l in enumerate(lines):
    if "const m =" in l or "let m =" in l or "const msg =" in l:
        insert_at = i + 1
        break

if insert_at == -1:
    # fallback: find messages.upsert line
    for i, l in enumerate(lines):
        if "messages.upsert" in l:
            insert_at = i + 2
            break

print("Insert at line:", insert_at)

code = """
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
      if(!_text){ await sock.sendMessage(from,{text:'Use: .mode private / .mode public\\nCurrent: '+MODE}); return; }
      if(['private','public'].includes(_text.toLowerCase())){ MODE=_text.toLowerCase(); await sock.sendMessage(from,{text:'✅ Mode: '+MODE.toUpperCase()}); return; }
    }
    if(_cmd==='group'){
      if(!isOwner){ await sock.sendMessage(from,{text:'❌ Only paired number'}); return; }
      if(_text.toLowerCase()==='on'){ GROUP_MODE='on'; await sock.sendMessage(from,{text:'✅ Group ON'}); return; }
      if(_text.toLowerCase()==='off'){ GROUP_MODE='off'; await sock.sendMessage(from,{text:'✅ Group OFF'}); return; }
      await sock.sendMessage(from,{text:'Group: '+GROUP_MODE+'\\nUse: .group on / .group off'}); return;
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
        if(isImg==='image') await sock.sendMessage(ownerJid,{image:buf, caption:'👁️ View Once .vv\\n© CHARLES OFFICIAL'});
        else await sock.sendMessage(ownerJid,{video:buf, caption:'👁️ View Once Video .vv\\n© CHARLES OFFICIAL'});
        await sock.sendMessage(from,{text:'✅ Sent to your paired number self-chat'});
      }catch(e){ await sock.sendMessage(from,{text:'❌ '+e.message}); }
      return;
    }
    // ===== END FIX V2 =====
"""

if insert_at != -1:
    lines.insert(insert_at, code)
    print("✅ Inserted at", insert_at)
else:
    print("❌ Could not find insert point - send me first 60 lines")

# Remove admin block
text = "\n".join(lines)
text = text.replace("if(!isAdmin) return", "// ADMIN REMOVED if(!isAdmin) return")
text = text.replace("if (!isAdmin) return", "// ADMIN REMOVED")
pathlib.Path("index.js").write_text(text)
print("✅ Saved, checking syntax...")
