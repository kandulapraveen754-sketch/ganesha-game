import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find all enemy types
enemy_types = set(re.findall(r'type:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', js))
print("All entity types in configs:", sorted(list(enemy_types)))

# Find LEVEL_CONFIGS
level_count = len(re.findall(r'\{\s*name:\s*[\'"]Level\s*\d+', js))
print("Detected levels in LEVEL_CONFIGS:", level_count)
