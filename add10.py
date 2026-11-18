import pathlib
p = pathlib.Path("index.js")
t = p.read_text()
# Find a good anchor - where OWNER commands start, or ping
anchor = None
for a in ["if(cmd==='ping')", "if(cmd==='alive')", "if(cmd==='mode')", "if(cmd==='owner')"]:
    if a in t:
        anchor = a; break
if not anchor:
    print("❌ Anchor not found - paste your command section, I go adjust am")
    raise SystemExit
code = r'''
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
'''
t = t.replace(anchor, code + "\n    " + anchor)
p.write_text(t)
print("10 COMMANDS ADDED")
