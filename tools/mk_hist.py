import json,subprocess,sys
from playwright.sync_api import sync_playwright
P=json.load(open('/home/claude/w/parts_new.json'))
pv=P['PREV']
first={'d':'2026-10-13','label':'Earlier cut: Q4 forecast first version, Habib through Aug','o':pv['o'],'h':pv['h'],'ytd':pv['ytd'],'fcSar':pv['fcsar'],'fcBox':105012,'hSo':pv['habib']['so'],'hSi':pv['habib']['si'],'hGap':pv['habib']['si']-pv['habib']['so'],'low':None,'crit':None,'high':None,'med':None,'keys':None}
P['HIST']=[first]
json.dump(P,open('/home/claude/w/parts_new.json','w'),ensure_ascii=False)
subprocess.run(['python3','/home/claude/w/assemble.py'],check=True)
with sync_playwright() as p:
    pg=p.chromium.launch().new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/index_new.html');pg.wait_for_timeout(1200)
    now=pg.evaluate('snapNow()');print(errs,now)
P['HIST']=[first,now]
json.dump(P,open('/home/claude/w/parts_new.json','w'),ensure_ascii=False)
