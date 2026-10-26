import sys,json
from playwright.sync_api import sync_playwright
URL='file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html'))+''
R=[];err=[]
def ck(n,c,d=''):R.append((n,bool(c)));print(('PASS' if c else 'FAIL'),n,d)
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':800});pg=ctx.new_page()
    pg.on('console',lambda m:err.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:err.append(str(e)));pg.on('requestfailed',lambda r:err.append('REQFAIL '+r.url))
    pg.goto(URL);pg.wait_for_selector('.card',timeout=5000)
    ck('home renders cards',pg.locator('.card').count()==12,pg.locator('.card').count())
    ck('hero title',pg.inner_text('.hero h1')=='INFINIVERSE')
    # drill down
    names=[]
    for lvl in range(3):
        pg.locator('.card').first.click();pg.wait_for_selector('.card');names.append(pg.inner_text('main h1'))
    ck('hash after 3 clicks','#/u/0/g/0/p/0'==pg.evaluate('location.hash'),pg.evaluate('location.hash'))
    pg.locator('.card').first.click();pg.wait_for_selector('.detail')
    ck('profile detail',pg.evaluate('location.hash')=='#/u/0/g/0/p/0/f/0' and pg.locator('.av').count()==1)
    ck('breadcrumb 5 parts',pg.locator('#crumbs a').count()==4,pg.inner_text('#crumbs'))
    pg.locator('#crumbs a').nth(2).click();pg.wait_for_selector('.card')
    ck('crumb -> galaxy',pg.evaluate('location.hash')=='#/u/0/g/0',pg.evaluate('location.hash'))
    pg.go_back();pg.wait_for_selector('.detail');ck('back works',pg.evaluate('location.hash').endswith('/f/0'))
    pg.go_forward();pg.wait_for_selector('.card');ck('forward works',pg.evaluate('location.hash')=='#/u/0/g/0')
    pg.goto(URL+'#/u/12/g/5/p/3/f/9');pg.reload();pg.wait_for_selector('.detail')
    ck('deep link refresh',pg.inner_text('.lvl').endswith('U12-G5-P3-F9'))
    pg.goto(URL+'#/u/abc');pg.reload();pg.wait_for_selector('main .msg');ck('not found view','signal lost' in pg.inner_text('main').lower())
    pg.goto(URL+'#/');pg.reload();pg.wait_for_selector('.card')
    # infinite scroll
    for _ in range(4):pg.mouse.wheel(0,4000);pg.wait_for_timeout(300)
    ids=pg.eval_on_selector_all('.card .id','e=>e.map(x=>x.textContent)')
    ck('infinite scroll loads more & no dupes',len(ids)>12 and len(ids)==len(set(ids)),len(ids))
    # navbar
    pg.evaluate('scrollTo(0,0)');pg.wait_for_timeout(1200)
    pg.mouse.wheel(0,1500);pg.wait_for_timeout(500);ck('bar hides on scroll down','hide' in pg.get_attribute('#bar','class'))
    pg.mouse.wheel(0,-300);pg.wait_for_timeout(500);ck('bar shows on scroll up','hide' not in pg.get_attribute('#bar','class'))
    pg.evaluate('scrollTo(0,0)');pg.wait_for_timeout(1200);ck('bar visible at top','hide' not in pg.get_attribute('#bar','class'))
    # search
    pg.click('#searchBtn');ck('search opens',pg.evaluate("document.getElementById('dlg').open") and pg.evaluate("document.activeElement.id")=='q')
    pg.keyboard.type('  ocean ');pg.wait_for_selector('#res [role=option]',timeout=8000);pg.wait_for_timeout(1500)
    n=pg.locator('#res [role=option]').count();ck('search results',n>0,n)
    ck('result has type badge',pg.locator('#res .kind').first.inner_text() in('UNIVERSE','GALAXY','PLANET','PROFILE'))
    pg.keyboard.press('Escape');ck('escape closes + focus restored',not pg.evaluate("document.getElementById('dlg').open") and pg.evaluate("document.activeElement.id")=='searchBtn')
    # search a deep profile by name
    pg.goto(URL+'#/u/3/g/2/p/4/f/5');pg.reload();pg.wait_for_selector('.detail');nm=pg.inner_text('main h1');us=pg.inner_text('.id',timeout=3000) if False else ''
    pg.keyboard.press('/');pg.keyboard.type(nm);pg.wait_for_function("document.querySelectorAll('#res [role=option]').length>0 && !document.querySelector('#res .spin')",timeout=15000)
    first=pg.locator('#res li').first.inner_text();ck('search finds deep profile by name',nm.split()[0] in first,first[:60])
    pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    ck('enter navigates to correct entity',pg.evaluate('location.hash').startswith('#/u/') and nm in pg.inner_text('main'),pg.evaluate('location.hash'))
    pg.click('#searchBtn');pg.keyboard.type('U777-G8-P6-F5');pg.wait_for_selector('#res [role=option]',timeout=8000)
    pg.locator('#res a').first.click();pg.wait_for_selector('.detail');ck('ID search + click result',pg.evaluate('location.hash')=='#/u/777/g/8/p/6/f/5')
    pg.click('#searchBtn');pg.keyboard.type('zzzqqq');pg.wait_for_selector('#res .hint:has-text("No matches")',timeout=15000);ck('empty state',True);pg.keyboard.press('Escape')
    pg.click('#searchBtn');pg.keyboard.type('<img src=x onerror=alert(1)>');pg.wait_for_timeout(2500);ck('xss-safe',pg.locator('#res img').count()==0);pg.keyboard.press('Escape')
    # keyboard nav: tab to first card & Enter
    pg.goto(URL+'#/');pg.reload();pg.wait_for_selector('.card');pg.focus('.card');pg.keyboard.press('Enter');pg.wait_for_selector('main h1');ck('keyboard activate card',pg.evaluate('location.hash')=='#/u/0')
    # responsive overflow
    for w,h in [(320,640),(360,740),(375,812),(390,844),(430,932),(768,1024),(1024,768),(1280,800),(1440,900),(1920,1080),(812,375)]:
        pg2=ctx.new_page();pg2.set_viewport_size({'width':w,'height':h})
        for hh in ['#/','#/u/4/g/2/p/1','#/u/4/g/2/p/1/f/3']:
            pg2.goto(URL+hh);pg2.reload();pg2.wait_for_selector('main h1');pg2.wait_for_timeout(1300)
            ov=pg2.evaluate('document.documentElement.scrollWidth-innerWidth')
            if ov>0:ck(f'overflow {w}x{h} {hh}',False,ov)
            pg2.screenshot(path=f'/tmp/{w}x{h}_{hh.count("/")}.png')
        pg2.click('#searchBtn');pg2.keyboard.type('lyra');pg2.wait_for_timeout(1800)
        box=pg2.evaluate("(()=>{const r=document.getElementById('dlg').getBoundingClientRect();return [r.left>=0,r.right<=innerWidth,r.bottom<=innerHeight+1]})()")
        ck(f'search dialog fits {w}x{h}',all(box),box)
        if w in(375,1280):pg2.screenshot(path=f'/tmp/search_{w}.png')
        pg2.close()
    ck('no horizontal overflow anywhere',all(ok for n,ok in R if n.startswith('overflow'))) if any(n.startswith('overflow') for n,_ in R) else ck('no horizontal overflow anywhere',True)
    # reduced motion
    c2=b.new_context(reduced_motion='reduce');p3=c2.new_page();p3.goto(URL);p3.wait_for_selector('.card')
    an=p3.evaluate("getComputedStyle(document.querySelector('.sky i')).animationName");ck('reduced motion disables animation',an=='none',an)
    # broken image / timing
    t=pg.evaluate('performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd');ck('DCL fast (<1500ms)',t<1500,round(t))
    ck('console errors none',not err,err[:3])
    b.close()
bad=[n for n,o in R if not o];print('\n%d/%d passed'%(len(R)-len(bad),len(R)),'FAILED:',bad)
