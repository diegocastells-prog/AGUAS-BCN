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
                    lst.append(str(f)[:30])
            out[role] = lst
    return out

info = {}
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
        r = roles(data)
        t = get_title(data)
        info[(page, v)] = (vt, t, r)
        # charts with dim_calendario anywhere
        has_cal = any('dim_calendario' in x for rr in r.values() for x in rr)
        if vt in ('lineChart', 'clusteredColumnChart', 'lineClusteredColumnComboChart',
                  'pieChart', 'azureMap', 'lineAreaChart', 'lineStackedColumnComboChart',
                  'stackedColumnChart', 'clusteredBarChart', 'areaChart', 'scatterChart',
                  'tableEx', 'pivotTable'):
            print('CHART page=%s vis=%s type=%s title=%s cal=%s' % (page, v, vt, t[:40], has_cal))
            for role, lst in r.items():
                if any('dim_calendario' in x for x in lst):
                    print('     %s: %s' % (role, lst))