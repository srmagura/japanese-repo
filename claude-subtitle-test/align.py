import re, sys

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

ja = parse_srt(r'Hibike! Euphonium - 01.ja.srt')
en = parse_srt(r'Hibike! Euphonium - 01.en.srt')

print(f"JA entries: {len(ja)}")
print(f"EN entries: {len(en)}")

def overlap(a_start, a_end, b_start, b_end):
    lo = max(a_start, b_start)
    hi = min(a_end, b_end)
    return max(0, hi-lo)

used_en = set()
matches = []
for j in ja:
    best = None
    best_ov = -1
    for i, e in enumerate(en):
        ov = overlap(j['start'], j['end'], e['start'], e['end'])
        if ov > best_ov:
            best_ov = ov
            best = i
    matches.append((j, best, best_ov))

with open('align_out.txt', 'w', encoding='utf-8') as out:
    for j, best, ov in matches:
        e = en[best] if best is not None else None
        out.write(f"JA[{j['idx']}] {j['start']}-{j['end']} '{j['text'][:20]}' <-> EN[{e['idx'] if e else None}] ov={ov} '{e['text'][:30] if e else None}'\n")
