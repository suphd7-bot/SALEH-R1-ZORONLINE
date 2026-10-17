import pandas as pd,glob,warnings;warnings.filterwarnings('ignore')
U='/mnt/user-data/uploads/'
NEW='/root/.claude/uploads/45e83dbc-9fae-5d38-8f18-61a30db88f6f/'
def ld(f,sh):
    d=pd.read_excel(f,sheet_name=sh);d.columns=[str(c).strip() for c in d.columns];return d
def sales(which):
    if which=='old': return ld(glob.glob(U+'25_VS_26*')[0],'25 VS 26 YTD - June Sales Data ')
    return ld(glob.glob(NEW+'*c7594402*')[0],'25 VS 26 YTD - Sept Sales Data ')

_old=None
def _oldraw():
    global _old
    if _old is None: _old=ld(glob.glob(U+'25_VS_26*')[0],'25 VS 26 YTD - June Sales Data ')
    return _old
def canon(d):
    o=_oldraw()
    pm=o.assign(pid=o.Productid.astype(str)).groupby('pid').Product.agg(lambda x:x.value_counts().index[0])
    cm=o.assign(cid=o['New Custid'].astype(str)).groupby('cid')['Customer Name'].agg(lambda x:x.value_counts().index[0])
    pid=d.Productid.astype(str);cid=d['New Custid'].astype(str)
    d=d.copy()
    d['Product']=[pm.get(p,n) for p,n in zip(pid,d.Product)]
    # new-only customers: most frequent name
    mf=d.assign(cid=cid).groupby('cid')['Customer Name'].agg(lambda x:x.value_counts().index[0])
    d['Customer Name']=[cm.get(c,mf.get(c,n)) for c,n in zip(cid,d['Customer Name'])]
    return d
_sales=sales
def sales(which):
    d=_sales(which)
    return canon(d)
