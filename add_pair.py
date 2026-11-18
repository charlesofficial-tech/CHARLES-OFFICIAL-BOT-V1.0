import pathlib
p = pathlib.Path("index.js")
t = p.read_text()
if "requestPairingCode" not in t:
    # Find where sock is created, add pairing after it
    # Look for sock.ev.on('connection.update'
    old = "sock.ev.on('connection.update'"
    if old in t:
        pair_code = """
// ===== PAIRING CODE - CHARLES OFFICIAL =====
if(!sock.authState.creds.registered){
  (async()=>{
    await new Promise(r=>setTimeout(r, 3000));
    const PHONE = process.env.PHONE_NUMBER || '2349051234567'; // CHANGE TO YOUR NUMBER WITHOUT +
    try{
      const code = await sock.requestPairingCode(PHONE);
      console.log('========================================');
      console.log('🔥 PAIRING CODE: ' + code);
      console.log('Go WhatsApp > Linked Devices > Link with phone number');
      console.log('Enter this code: ' + code);
      console.log('========================================');
    }catch(e){ console.log('Pairing error:', e.message); }
  })();
}
// ===== END PAIRING =====
sock.ev.on('connection.update'"""
        t = t.replace(old, pair_code)
        print("✅ Pairing code added")
    else:
        print("❌ Could not find connection.update - paste first 80 lines")
else:
    print("✅ Pairing already dey")
pathlib.Path("index.js").write_text(t)
