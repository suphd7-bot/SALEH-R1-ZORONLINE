import json,sys
pre=open('/home/claude/w/pre.html').read();code=open('/home/claude/w/code.js').read()
P=json.load(open('/home/claude/w/parts_new.json'))
def js(v): return json.dumps(v,ensure_ascii=False,separators=(',',':'))
body=''.join(f'const {k}={js(P[k])};\n' for k in ['D2','SALES','HAB','HDOC','TERR','FCX','BR','JJ','PREV','DN','HIST'])
out=pre+body+code
open('/mnt/user-data/outputs/index_new.html','w').write(out)
print(len(out))
