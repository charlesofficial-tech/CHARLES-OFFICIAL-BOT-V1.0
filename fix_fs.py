import pathlib, re
p = pathlib.Path("index.js")
t = p.read_text()
# Count how many times fs dey
count = t.count("const fs = require('fs');")
print(f"fs dey {count} times - we go leave 1, remove rest")
# Keep first one, remove others
first = True
lines = t.splitlines()
new_lines = []
for line in lines:
    if "const fs = require('fs');" in line:
        if first:
            new_lines.append(line)
            first = False
        else:
            # skip duplicate - na this cause crash
            continue
    else:
        new_lines.append(line)
t = "\n".join(new_lines)
p.write_text(t)
print("✅ Fixed! fs now dey 1 time")
