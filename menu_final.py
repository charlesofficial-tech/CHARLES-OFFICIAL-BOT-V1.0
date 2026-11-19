import pathlib
p = pathlib.Path("index.js")
t = p.read_text()
# Remove old menu if e dey, put final one
if "PIC_UP_COMMANDS_FOLLOW" not in t:
    code = """
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
"""
    t = t.replace("require('./keepalive.js');", "require('./keepalive.js');\n" + code, 1)
    pathlib.Path("index.js").write_text(t)
    print("✅ DONE - Pic Up, Commands Follow")
else:
    print("✅ Already dey")
