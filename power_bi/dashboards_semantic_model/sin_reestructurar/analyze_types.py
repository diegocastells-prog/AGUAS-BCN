# -*- coding: utf-8 -*-
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\Aguas de Barcelona 4.Report\definition\pages'

# visualType -> count and sample titles
from collections import Counter
vt = Counter()
samples = {}
total = 0
for page in os.listdir(ROOT):
    pdir = os.path.join(ROOT, page, 'visuals')
    if not os.path.isdir(pdir):
        continue
    for v in os.listdir(pdir):
        vp = os.path.join(pdir, v, 'visual.json')
        if not os.path.isfile(vp):
            continue
        total += 1
        try:
            with open(vp, encoding='utf-8-sig') as f:
                data = json.load(f)
        except Exception as e:
            print('ERR', vp, e)
            continue
        vtype = data.get('visual', {}).get('visualType', '?')
        vt[vtype] += 1
        if vtype not in samples:
            samples[vtype] = vp

print('TOTAL visuals:', total)
for k, c in vt.most_common():
    print('%-30s %d' % (k, c))
print()
print('--- sample file per type ---')
for k, v in samples.items():
    print(k, '->', v)