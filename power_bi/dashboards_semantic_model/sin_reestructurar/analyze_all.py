# -*- coding: utf-8 -*-
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ROOT = r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\Aguas de Barcelona 4.Report\definition\pages'

# page id -> name
pagenames = {}
for page in os.listdir(ROOT):
    pj = os.path.join(ROOT, page, 'page.json')
    if os.path.isfile(pj):
        try:
            with open(pj, encoding='utf-8-sig') as f:
                d = json.load(f)
            pagenames[page] = d.get('displayName', d.get('name', page))
        except Exception:
            pagenames[page] = page

def get_title(data):
    t = data.get('visual', {}).get('visualContainerObjects', {}).get('title', [])
    for obj in t:
        props = obj.get('properties', {})
        text = props.get('text', {}).get('expr', {}).get('Literal', {}).get('Value')
        if text is not None:
            return text
    return ''

def field_ref(field):
    try:
        if 'Column' in field:
            col = field['Column']
            ent = col.get('Expression', {}).get('SourceRef', {}).get('Entity')
            return '%s.%s' % (ent, col.get('Property'))
        elif 'Measure' in field:
            m = field['Measure']
            ent = m.get('Expression', {}).get('SourceRef', {}).get('Entity')
            return '%s.%s (measure)' % (ent, m.get('Property'))
    except Exception:
        pass
    return '?'

def analyze(path):
    out = []
    with open(path, encoding='utf-8-sig') as f:
        data = json.load(f)
    v = data.get('visual', {})
    vtype = v.get('visualType', '?')
    qs = v.get('query', {}).get('queryState', {}) or {}
    roles = {}
    for role in ('Category', 'X', 'Values', 'Row', 'Columns', 'Values', 'Series',
                 'Legend', 'Tooltips', 'Drill', 'Y', 'Y1', 'Y2', 'SecondaryValues',
                 'CategoryValues', 'Rows', 'Columns', 'Axes', 'ColumnValues'):
        proj = qs.get(role, {}).get('projections')
        if proj:
            roles[role] = [field_ref(p.get('field', {})) for p in proj]
    return vtype, roles, get_title(data), data

# ---- SLICERS detail ----
print('==================== SLICERS (n=?) ====================')
slicers = []
for page in os.listdir(ROOT):
    pdir = os.path.join(ROOT, page, 'visuals')
    if not os.path.isdir(pdir):
        continue
    for v in os.listdir(pdir):
        vp = os.path.join(pdir, v, 'visual.json')
        if not os.path.isfile(vp):
            continue
        vtype, roles, title, data = analyze(vp)
        if vtype not in ('slicer', 'advancedSlicerVisual'):
            continue
        fields = roles.get('Values', [])
        sync = data.get('visual', {}).get('syncGroup', {}).get('groupName', '')
        slicers.append({
            'page': pagenames.get(page, page), 'pid': page, 'vis': v,
            'title': title, 'fields': fields, 'sync': sync})
print('Total:', len(slicers))
for s in slicers:
    print('P=%-32s %-18s %-14s %-28s %s' % (s['page'][:32], s['pid'][:12], s['title'][:14], '|'.join(s['fields'])[:28], s['sync'][:12]))

w = open(r'C:\Proyectos\AGUAS-BCN\power_bi\dashboards_semantic_model\sin_reestructurar\slicers_detail.txt', 'w', encoding='utf-8')
for s in slicers:
    w.write('page=%s | vis=%s | title=%s | fields=%s | sync=%s\n' % (s['page'], s['vis'], s['title'], s['fields'], s['sync']))
w.close()
print()
print('==== CHART AXES (Category/X roles) ====')
for page in os.listdir(ROOT):
    pdir = os.path.join(ROOT, page, 'visuals')
    if not os.path.isdir(pdir):
        continue
    for v in os.listdir(pdir):
        vp = os.path.join(pdir, v, 'visual.json')
        if not os.path.isfile(vp):
            continue
        vtype, roles, title, data = analyze(vp)
        if vtype in ('slicer', 'advancedSlicerVisual', 'shape', 'image', 'textbox',
                     'actionButton', 'pageNavigator', 'cardVisual', 'kpi', 'tableEx', 'pivotTable'):
            continue
        cats = []
        if 'Category' in roles:
            cats = roles['Category']
        elif 'X' in roles:
            cats = roles['X']
        if cats:
            print('P=%-28s %-22s title=%-30s X=%-40s' % (pagenames.get(page, page)[:28], vtype, title[:30], cats))