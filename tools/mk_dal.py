import json
P=json.load(open('/home/claude/w/parts_new_pre_dal.json'));n=json.load(open('/home/claude/w/dal_new.json'))
MAP={'Zoron 4 Tab':'PCNS0681','Zoron 4 Inj':'PCNS0679','Zoron 8 Tab':'PCNS0682','Zoron 8 Inj':'PCNS0680','Meva SR 200':'PGIT1303','Meva 135':'PGIT1273','Maxim 7s':'PINF1144','Maxim 5s':'PINF1141'}
FAC={'Zoron 4 Inj':5,'Zoron 8 Inj':5}  # report counts ampoules, Jamjoom/forecast count boxes of 5
ix={bu:{r['code']:r for r in rows} for bu,rows in n.items()}
r1=lambda v:round(v,1)
for it in P['D2']['items']:
    r=ix[it['place']][MAP[it['item']]];f=FAC.get(it['item'],1)
    it['prev']=it['stock'];it['stock']=r1(r['cur']/f);it['cons']=r1(r['cons']/f);it['recv']=r1(r['recv']/f);it['outst']=r1(r['outst']/f);it['ordq']=r1(r['ordq']/f)
    it['cover']=round(it['stock']/it['target'],1) if it['target']>0 else None
rows={}
for bu,rs in n.items():
    rows[bu]=[[r['code'],r['desc'],r['unit'],r['cur'],r['store'],r['aziz'],r['phr'],r['cons'],r['recv'],r['outst'],r['cost'],r['ordq']] for r in rs if any(r[k] for k in ('cur','cons','recv','outst'))]
P['DN']={'date':'2026-10-14','from':'2026-07-01','map':MAP,'fac':FAC,'rows':rows}
json.dump(P,open('/home/claude/w/parts_new.json','w'),ensure_ascii=False)
print({k:len(v) for k,v in rows.items()})
