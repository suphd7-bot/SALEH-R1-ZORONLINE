import pdfplumber,glob,json,re
U='/root/.claude/uploads/45e83dbc-9fae-5d38-8f18-61a30db88f6f/'
BU={'10':'Nakheel','11':'Namar','12':'Pharmacies'}
out={}
H=['code','desc','unit','cur','store','aziz','phr','cons','recv','outst','cost','ordq','ordc']
def num(x):
    try:return float(str(x).replace(',','').strip() or 0)
    except:return 0.0
for k,bu in BU.items():
    f=glob.glob(U+f'*Consumption_{k}.pdf')[0];rows=[]
    with pdfplumber.open(f) as pdf:
        for pg in pdf.pages:
            for tb in pg.extract_tables():
                for r in tb:
                    if r and r[0]=='Item Code' or not r or len(r)<13:continue
                    d=dict(zip(H,r));d['desc']=re.sub(r'\s+',' ',(d['desc'] or '')).strip();d['code']=(d['code'] or '').strip()
                    for h in H[3:]:d[h]=num(d[h])
                    rows.append(d)
    out[bu]=rows;print(bu,len(rows),sum(1 for r in rows if r['cur'] or r['cons'] or r['recv'] or r['outst']))
json.dump(out,open('dal_new.json','w'),ensure_ascii=False)
