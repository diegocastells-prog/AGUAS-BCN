# -*- coding: utf-8 -*-
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\Aguas de Barcelona 4.Report\definition\pages'

def get_field_ref(field):
    try:
        if 'Column' in field:
            col = field['Column']
            ent = col.get('Expression', {}).get('SourceRef', {}).get('Entity')
            prop = col.get('Property')
            return 'Column: %s.%s' % (ent, prop)
        elif 'Measure' in field:
            m = field['Measure']
            ent = m.get('Expression', {}).get('SourceRef', {}).get('Entity')
            prop = m.get('Property')
            return 'Measure: %s.%s' % (ent, prop)
        elif 'Hierarchy' in field:
            return 'Hierarchy: %s' % field['Hierarchy']
        elif 'CalculationGroup' in field:
            return 'CalcGroup'
    except Exception:
        pass
    return str(field)[:80]

def get_title(data):
    t = data.get('visual', {}).get('visualContainerObjects', {}).get('title', [])
    for obj in t:
        props = obj.get('properties', {})
        text = props.get('text', {}).get('expr', {}).get('Literal', {}).get('Value')
        show = props.get('show', {}).get('expr', {}).get('Literal', {}).get('Value')
        if text is not None:
            return text, show
    return ('', '')

# --- slicers ---
print('==================== SLICERS ====================')
slicers = []
for page in os.listdir(ROOT):
    pdir = os.path.join(ROOT, page, 'visuals')
    if not os.path.isdir(pdir):
        continue
    for v in os.listdir(pdir):
        vp = os.path.join(pdir, v, 'visual.json')
        if not os.path.isfile(vp):
            continue
        try:
            with open(vp, encoding='utf-8-sig') as f:
                data = json.load(f)
        except Exception:
            continue
        vtype = data.get('visual', {}).get('visualType', '?')
        if vtype not in ('slicer', 'advancedSlicerVisual'):
            continue
        title, show = get_title(data)
        proj = data.get('visual', {}).get('query', {}).get('queryState', {}).get('Values', {}).get('projections', [])
        fields = [get_field_ref(p.get('field', {})) for p in proj]
        sync = data.get('visual', {}).get('syncGroup', {})
        slicers.append({
            'page': page,
            'vis': v,
            'type': vtype,
            'title': title,
            'show': show,
            'fields': fields,
            'sync': sync.get('groupName', ''),
        })

# group by field
from collections import defaultdict
byfield = defaultdict(list)
for s in slicers:
    key = ' | '.join(s['fields']) if s['fields'] else '(no fields)'
    byfield[key].append(s)

print('Total slicers:', len(slicers))
for k, items in sorted(byfield.items()):
    titles = sorted(set(i['title'] for i in items))
    print()
    print('FIELD: %s  (n=%d)' % (k, len(items)))
    print('  TITLES: %s' % titles)