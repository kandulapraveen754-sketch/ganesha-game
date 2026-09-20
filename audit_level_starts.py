import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's inspect LEVEL_CONFIGS
m = re.search(r'const LEVEL_CONFIGS = \[([\s\S]*?)\];\s*(?:class|const|let|var|function|\/\/)', js)
if m:
    print("Found LEVEL_CONFIGS")

# Let's check where checkpoint, spawn, or platforms are configured in each level
lines = js.splitlines()
in_configs = False
current_lvl = -1
for i, line in enumerate(lines):
    if 'const LEVEL_CONFIGS =' in line:
        in_configs = True
    if in_configs:
        if 'name:' in line or 'chapter:' in line:
            if 'name:' in line:
                current_lvl += 1
                print(f"\n--- Level {current_lvl}: {line.strip()} ---")
        if any(k in line for k in ['spawn', 'checkpoint', 'platforms: [', 'enemies: [', 'boss:']):
            print(f"  {line.strip()[:100]}")
    if in_configs and line.strip().startswith('];'):
        in_configs = False
        print("\nEnd of LEVEL_CONFIGS at line", i+1)
