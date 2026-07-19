import re

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

# EN indices that are on-screen text / signs / name-tags / UI captions with no
# corresponding line in the ja track (ja viewers already see the Japanese text
# on screen, so these were only added for the English release).
EXCLUDE_EN_IDX = {
    '1',
    '4', '5', '6',
    '34', '35', '36',
    '69',
    '106', '107',
    '132',
    '162',
    '196', '197',
    '247', '248', '249',
    '255',
    '270',
    '351', '352', '353', '354', '355', '356', '357', '358', '359', '360', '361', '362',
    '373', '374',
    '383',
    '384', '385',
    '386', '387',
    '388', '389',
    '390',
    '393',
}

en_candidates = [e for e in en if e['idx'] not in EXCLUDE_EN_IDX]

def overlap(a_start, a_end, b_start, b_end):
    lo = max(a_start, b_start)
    hi = min(a_end, b_end)
    return max(0, hi - lo)

def fmt_time(ms):
    h = ms // 3600000
    ms %= 3600000
    m = ms // 60000
    ms %= 60000
    s = ms // 1000
    ms %= 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

out_blocks = []
report_lines = []
for j in ja:
    best = None
    best_ov = -1
    for e in en_candidates:
        ov = overlap(j['start'], j['end'], e['start'], e['end'])
        if ov > best_ov:
            best_ov = ov
            best = e
    en_text = best['text'] if best and best_ov > 0 else ''
    report_lines.append(f"JA[{j['idx']}] {j['text']!r} <-> EN[{best['idx'] if best else None}] ov={best_ov} {en_text!r}")
    lines = [j['idx'], f"{fmt_time(j['start'])} --> {fmt_time(j['end'])}", j['text']]
    if en_text:
        lines.append(en_text)
    out_blocks.append('\n'.join(lines))

with open('Hibike! Euphonium - 01.final.srt', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(out_blocks) + '\n')

with open('final_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print("done")
