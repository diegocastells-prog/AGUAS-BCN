# -*- coding: utf-8 -*-
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\Aguas de Barcelona 4.Report\definition\pages'

def get_title(data):
    t = data.get('visual', {}).get('visualContainerObjects', {}).get('title', [])
    for obj in t:
        props = obj.get('properties', {})
        text = props.get('text', {}).get('expr', {}).get('Literal', {}).get('Value')
        if text is not None:
            return text
    return ''

def roles(data):
    qs = data.get('visual', {}).get('query', {}).get('queryState', {}) or {}
    out = {}
    for role, v in qs.items():
        if isinstance(v, dict) and 'projections' in v:
            for p in v['projections']:
                f = p.get('field', {})
                if 'Column' in f:
                    c = f['Column']
                    ent = c.get('Expression', {}).get('SourceRef', {}).get('Entity')
                    ref = (ent,None,None)
                    out.setdefault(role, []).append('%s.%s' % (ent, c.get('Property')))
                elif 'Measure' in f:
                    m = f['Measure']
                    ent = m.get('Expression', {}).get('SourceRef', {}).get('Entity')
                    out.setdefault(role, []).append('%s.%s (measure)' % (ent, m.get('Property')))
    return out

targets = []
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
        if vt not in ('slicer', 'advancedSlicerVisual'):
            continue
        title = get_title(data)
        r = roles(data)
        vals = r.get('Values', [])
        # slicers of interest: gerencia, fecha, pres loi, Slicer_KPI
        joined = '|'.join(vals)
        if any(k in joined for k in ('gerencia', 'Gerencia')) or 'Slicer_KPI' in joined or 'mes' in joined or 'anio' in joined or 'Periodo' in joined or 'mestexto' in joined:
            targets.append((page, v, vt, title, vals))

for t in targets:
    print('page=%s vis=%s type=%s title=%s  vals=%s' % (t[0], t[1], t[2], t[3], t[4]))