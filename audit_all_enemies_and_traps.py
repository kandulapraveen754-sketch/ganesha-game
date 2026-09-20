import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's inspect LEVEL_CONFIGS
start_idx = js.find('const LEVEL_CONFIGS = [')
end_idx = js.find('\n];\n', start_idx)
configs_text = js[start_idx:end_idx+4]

# Let's find every level object
# Split by levelNum:
level_chunks = re.split(r'levelNum:\s*(\d+)', configs_text)

print(f"Total level chunks: {len(level_chunks)//2}")

for i in range(1, len(level_chunks), 2):
    lvl_num = int(level_chunks[i])
    chunk = level_chunks[i+1]
    
    title_m = re.search(r'title:\s*[\'"]([^\'"]+)[\'"]', chunk)
    title = title_m.group(1) if title_m else f"Level {lvl_num}"
    
    # Check platforms near spawn (x=60, y=380)
    plat_m = re.search(r'platforms:\s*\[([\s\S]*?)\]', chunk)
    plats = []
    if plat_m:
        for px, py, pw, ph in re.findall(r'\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*width:\s*(\d+),\s*height:\s*(\d+)', plat_m.group(1)):
            plats.append((int(px), int(py), int(pw), int(ph)))
            
    # Check enemies near spawn (x <= 200)
    enemies_m = re.search(r'enemies:\s*\[([\s\S]*?)\]', chunk)
    dangerous_enemies = []
    if enemies_m:
        for ex, ey, etype in re.findall(r'\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*type:\s*[\'"]([^\'"]+)[\'"]', enemies_m.group(1)):
            if int(ex) < 250:
                dangerous_enemies.append((int(ex), int(ey), etype))
                
    # Check traps near spawn (x <= 200)
    traps_m = re.search(r'traps:\s*\[([\s\S]*?)\]', chunk)
    dangerous_traps = []
    if traps_m:
        for tx, ty, ttype in re.findall(r'\{\s*x:\s*(\d+),\s*y:\s*(\d+)[^}]*type:\s*[\'"]([^\'"]+)[\'"]', traps_m.group(1)):
            if int(tx) < 250:
                dangerous_traps.append((int(tx), int(ty), ttype))
                
    # Check rivers near spawn (x <= 200)
    rivers_m = re.search(r'rivers:\s*\[([\s\S]*?)\]', chunk)
    dangerous_rivers = []
    if rivers_m:
        for rx, ry, rw, rh in re.findall(r'\{\s*x:\s*(\d+),\s*y:\s*(\d+),\s*width:\s*(\d+),\s*height:\s*(\d+)', rivers_m.group(1)):
            if int(rx) < 250:
                dangerous_rivers.append((int(rx), int(ry), int(rw), int(rh)))
                
    # Check boss in level
    boss_m = re.search(r'boss:\s*\{\s*x:\s*(\d+),\s*y:\s*(\d+)', chunk)
    boss_info = None
    if boss_m:
        bx, by = int(boss_m.group(1)), int(boss_m.group(2))
        if bx < 300:
            boss_info = (bx, by)
            
    # Check spawn platform
    has_spawn_plat = False
    for px, py, pw, ph in plats:
        if px <= 60 and (px + pw) >= 108: # Ganesha at x=60, w=48
            has_spawn_plat = True
            break
            
    issues = []
    if not has_spawn_plat:
        issues.append("NO SPAWN PLATFORM at x=60!")
    if dangerous_enemies:
        issues.append(f"ENEMY NEAR SPAWN: {dangerous_enemies}")
    if dangerous_traps:
        issues.append(f"TRAP NEAR SPAWN: {dangerous_traps}")
    if dangerous_rivers:
        issues.append(f"RIVER AT SPAWN: {dangerous_rivers}")
    if boss_info:
        issues.append(f"BOSS TOO CLOSE TO SPAWN: {boss_info}")
        
    status = "OK" if not issues else "DANGER: " + " | ".join(issues)
    print(f"Level {lvl_num:2d} ({title:<30}): {status}")
