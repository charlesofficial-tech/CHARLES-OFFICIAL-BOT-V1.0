import pathlib, re
p = pathlib.Path("index.js")
lines = p.read_text().splitlines()
seen = {}
for i, line in enumerate(lines):
    # Find: let/const senderNum, isGroupMsg, isOwner, _cmd, _text etc
    m = re.search(r'^\s*(let|const|var)\s+(senderNum|isGroupMsg|isOwner|_cmdRaw|_cmd|_text|isGroup|sender)\s*=', line)
    if m:
        name = m.group(2)
        if name in seen:
            print(f"Line {i+1} DUPLICATE {name} -> fixing: {line.strip()}")
            # Remove let/const, keep assignment
            lines[i] = re.sub(r'^\s*(let|const|var)\s+', '', line)
            # If it was const, make it just assignment
            lines[i] = lines[i].replace(f"{name} =", f"{name} =")
        else:
            seen[name] = i+1
            print(f"Line {i+1} FIRST {name} - keep")
    # Also fix: const senderNum = sender.split - second one uses sender, first uses m.sender
    # Make sure second one doesn't break
pathlib.Path("index.js").write_text("\n".join(lines))
print("✅ Fixed duplicates")
