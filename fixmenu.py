import pathlib, re
p = pathlib.Path("index.js")
t = p.read_text()
new_menu = """╭─❍══ CHARLES OFFICIAL ══⊷❍
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

> © Powered by CHARLES OFFICIAL"""
# Try to replace old menu block - look for CHARLES OFFICIAL header
if "CHARLES OFFICIAL" in t:
    # Replace from first ╭ to © Powered by CHARLES OFFICIAL
    t2, n = re.subn(r"╭─❍══ CHARLES OFFICIAL.*?© Powered by CHARLES OFFICIAL", new_menu, t, flags=re.DOTALL)
    if n>0:
        p.write_text(t2); print("✅ MENU UPDATED")
    else:
        print("⚠️ Menu found but pattern no match - paste your .menu code")
else:
    print("⚠️ No menu in index.js - paste your menu/help code, I go give you exact replacement")
