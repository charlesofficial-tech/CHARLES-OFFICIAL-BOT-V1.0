import pathlib, re
p = pathlib.Path("index.js")
t = p.read_text()
print("=== BEFORE FIRST 3 LINES ===")
print("\n".join(t.splitlines()[:3]))
# Remove any app.listen / server.listen / .listen( in index.js - keepalive.js go handle am
# But keep require keepalive
t = re.sub(r'.*\.listen\s*\(.*\).*;?', '', t)
# Remove duplicate express require if e dey for index.js
# Keep only keepalive require at top
lines = t.splitlines()
new_lines = []
for line in lines:
    if "require('express')" in line or 'require("express")' in line:
        print("Removed express from index.js:", line)
        continue
    if "const app" in line and "express" in line:
        print("Removed app express line:", line)
        continue
    if "app.get" in line:
        continue
    new_lines.append(line)
# Make sure keepalive dey at top once
joined = "\n".join(new_lines)
if "keepalive" not in joined:
    joined = "require('./keepalive.js');\n" + joined
# Remove duplicate keepalive lines
final = []
seen=False
for l in joined.splitlines():
    if "keepalive" in l:
        if seen: continue
        seen=True
    final.append(l)
pathlib.Path("index.js").write_text("\n".join(final))
print("=== AFTER FIRST 3 LINES ===")
print("\n".join(final[:3]))
print("✅ Fixed - only keepalive.js go listen now")
