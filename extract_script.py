import sys, json
from graphify.extract import extract
from pathlib import Path

files = [Path('grind.html')]
# Also include some relevant CSS/JS if possible
files.append(Path('css/grind.css'))
files.append(Path('js/grind.js'))

result = extract(files, cache_root=Path('.'))
with open('graphify-out/.graphify_ast.json', 'w') as f:
    json.dump(result, f, indent=2)
print(f"AST: {len(result['nodes'])} nodes, {len(result['edges'])} edges")
