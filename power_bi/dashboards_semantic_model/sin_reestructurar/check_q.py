# -*- coding: utf-8 -*-
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\Aguas de Barcelona 4.Report\definition\pages'

def roles(data):
    qs = data.get('visual', {}).get('query', {}).get('queryState', {}) or {}
    out = {}
    for role, v in qs.items():
        if isinstance(v, dict) and 'projections' in v:
            lst = []
            for p in v['projections']:
                f = p.get('field', {})
                if 'Column' in f:
                    c = f['Column']
                    ent = c.get('Expression', {}).get('SourceRef', {}).get('Entity')
                    lst.append('%s.%s' % (ent, c.get('Property')))
                elif 'Measure' in f:
                    m = f['Measure']
                    ent = m.get('Expression', {}).get('SourceRef', {}).get('Entity')
                    lst.append('%s.%s (measure)' % (ent, m.get('Property')))
                else:
                    lst.append(str(f)[:40])
            out[role] = lst
    return out

# look at '?' visuals: print visualType field raw + first fields
cnt = 0
sample = None
qs_keys = {}
for page in os.listdir(ROOT):
    pdir = os.path.join(ROOT, page, 'visuals')
    if not os.path.isdir(pdir):
        continue
    for v in os.listdir(pdir):
        vp = os.path.join(pdir, v, 'visual.json')
        if not os.path.isfile(vp):
            continue
        with open(vp, encoding='utf-8-sig') as f:
            data = json.load(f)
        vt = data.get('visual', {}).get('visualType', '?')
        if vt != '?':
            continue
        cnt += 1
        if sample is None:
            sample = data
        qs = data.get('visual', {}).get('query', {}).get('queryState', {}) or {}
        for k in qs:
            qs_keys[k] = qs_keys.get(k, 0) + 1

print('count "?":', cnt)
print('queryState keys:', qs_keys)
print()
print('SAMPLE FILE (first 60 lines):')
if sample:
    import json as j
    print(j.dumps(sample, ensure_ascii=False)[:3000])