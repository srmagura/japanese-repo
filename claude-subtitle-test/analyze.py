import re
from collections import defaultdict

def parse_srt(path):
    with open(path, encoding='utf-8-sig') as f:
        content = f.read()
    blocks = re.split(r'\n\s*\n', content.strip())
    entries = []
    time_re = re.compile(r'(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})')
    for block in blocks:
        lines = block.strip('\n').split('\n')
        if len(lines) < 2:
            continue
        idx = lines[0].strip()
        m = time_re.search(lines[1])
        if not m:
            continue
        h1,m1,s1,ms1,h2,m2,s2,ms2 = map(int, m.groups())
        start = ((h1*60+m1)*60+s1)*1000+ms1
        end = ((h2*60+m2)*60+s2)*1000+ms2
        text = '\n'.join(lines[2:]).strip()
        entries.append({'idx': idx, 'start': start, 'end': end, 'text': text})
    return entries

en = parse_srt(r'Hibike! Euphonium - 01.en.srt')

groups = defaultdict(list)
for e in en:
    groups[(e['start'], e['end'])].append(e)

with open('sign_groups.txt', 'w', encoding='utf-8') as out:
    for k, v in sorted(groups.items()):
        if len(v) >= 2:
            out.write(f"TIME {k}:\n")
            for e in v:
                out.write(f"  EN[{e['idx']}] {e['text']!r}\n")
