import {get,page,chain,href,parseUrl,LEVELS} from './gen.js';
import {search,context,norm} from './search.js';
const $=s=>document.querySelector(s),main=$('#main'),live=$('#live');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const announce=t=>{live.textContent='';setTimeout(()=>live.textContent=t,50)};
const NAMES={universe:'Universe',galaxy:'Galaxy',planet:'Planet',profile:'Profile'};
function art(e){const h=`style="--h:${e.hue}"`;
if(e.type==='universe')return`<div class="uni" ${h}></div>`;
if(e.type==='galaxy')return`<div class="gal" style="--h:${e.hue};--a:${e.arms}"></div>`;
if(e.type==='planet')return`<div class="pl ${e.kind} ${e.ring?'ring':''}" ${h}></div>`;
return`<div class="av" ${h} role="img" aria-label="Generated avatar for ${esc(e.name)}">${esc(e.initials)}</div>`}
const tags=e=>`<div class="tags">${e.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
const card=(e,i)=>`<li><a class="card" href="${href(e)}" style="animation-delay:${Math.min(i%12,11)*40}ms"><div class="art">${art(e)}</div><div><span class="id">${e.id}</span><h2>${esc(e.name)}</h2>${e.username?`<p>@${esc(e.username)}</p>`:''}<p>${esc(e.desc)}</p>${tags(e)}</div></a></li>`;
// ---- routing (History API) ----
let cleanup=()=>{};
function nav(url,replace){if(url===location.pathname+location.search)return;history[replace?'replaceState':'pushState'](null,'',url);route()}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="/"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||a.target)return;e.preventDefault();if(dlg.open)closeSearch(false);nav(a.getAttribute('href'))});
addEventListener('popstate',route);
function route(){cleanup();cleanup=()=>{};const path=location.pathname==='/'?[]:parseUrl(location.pathname);
if(path===null)return notFound();const ch=path.length?chain(path):[];renderCrumbs(ch);
const cur=ch[ch.length-1];document.title=cur?`${cur.name} · INFINIVERSE`:'INFINIVERSE';
if(cur?.type==='profile')detail(cur,ch);else list(path,cur);scrollTo(0,0);main.focus({preventScroll:true})}
function renderCrumbs(ch){const items=[['INFINIVERSE','/'],...ch.map(e=>[e.name,href(e)])];
$('#crumbs').innerHTML=items.map(([n,h],i)=>(i?'<b aria-hidden="true">/</b>':'')+(i===items.length-1?`<span aria-current="page" title="${esc(n)}">${esc(n)}</span>`:`<a href="${h}" title="${esc(n)}">${esc(n)}</a>`)).join('')}
function notFound(){renderCrumbs([]);document.title='Not found · INFINIVERSE';main.innerHTML=`<div class="view msg"><p class="lvl">Signal lost</p><h1>This region of space doesn’t exist</h1><p class="lead" style="margin:auto">The address is invalid or outside the supported index range.</p><p><a class="btn" style="display:inline-grid;place-items:center" href="/">Return to the cosmos</a></p></div>`}
// ---- list with cursor pagination + IntersectionObserver ----
function list(path,cur){const lvl=path.length,child=LEVELS[lvl],intro=cur?`<p class="lvl">${NAMES[cur.type]} · ${cur.id}</p><h1>${esc(cur.name)}</h1><p class="lead">${esc(cur.desc)}</p>${tags(cur)}`:`<div class="hero"><p class="lvl">Explore the cosmos</p><h1>INFINIVERSE</h1><p class="lead">INFINITE UNIVERSES. INFINITE GALAXIES. INFINITE WORLDS. INFINITE IDENTITIES.</p></div>`;
main.innerHTML=`<div class="view">${intro}<h2 class="lvl" style="margin-top:28px">${NAMES[child]}s</h2><ul class="grid" id="g"></ul><div class="more" id="more"></div></div>`;
const g=$('#g'),more=$('#more');let cursor=0,busy=false,done=false,count=0,failed=false;const seen=new Set();
const load=()=>{if(busy||done)return;busy=true;more.innerHTML='<span class="spin"></span>Loading…';
try{const pg=page(path,cursor,12);const fresh=pg.items.filter(e=>e&&!seen.has(e.id));fresh.forEach(e=>seen.add(e.id));g.insertAdjacentHTML('beforeend',fresh.map((e,i)=>card(e,i)).join(''));count+=fresh.length;cursor=pg.next;if(cursor===null){done=true;more.textContent='End of the supported index.'}else more.innerHTML='<button class="btn" id="mb">Load more</button>';announce(`${count} ${child}s loaded`);failed=false}
catch(err){console.error(err);failed=true;more.innerHTML='<p>Couldn’t load more.</p><button class="btn" id="mb">Retry</button>'}busy=false};
more.addEventListener('click',e=>{if(e.target.id==='mb')load()});load();
const io='IntersectionObserver'in window?new IntersectionObserver(es=>{if(es[0].isIntersecting&&!failed&&count<3000)load()},{rootMargin:'600px'}):null;io?.observe(more);cleanup=()=>io?.disconnect()}
function detail(p,ch){const [u,g,pl]=ch;main.innerHTML=`<article class="view"><p class="lvl">Profile · ${p.id}</p><div class="detail"><div class="art">${art(p)}</div><div><h1>${esc(p.name)}</h1><p class="id">@${esc(p.username)}</p><p class="lead">${esc(p.desc)}</p>${tags(p)}<p class="lead">Lives on <a href="${href(pl)}"><b>${esc(pl.name)}</b></a> in <a href="${href(g)}">${esc(g.name)}</a>, <a href="${href(u)}">${esc(u.name)}</a>.</p><p class="lead"><small>Generated fictional identity. Not a verified or real person.</small></p><p><button class="btn" id="cp">Copy link</button></p></div></div></article>`;
$('#cp').onclick=async e=>{try{await navigator.clipboard.writeText(location.href);e.target.textContent='Copied ✓'}catch{e.target.textContent='Copy failed'}}}
// ---- smart nav bar ----
const bar=$('#bar');let lastY=scrollY,acc=0,tk=false;
addEventListener('scroll',()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{const y=Math.max(0,scrollY),d=y-lastY;lastY=y;
if(y<=8||bar.contains(document.activeElement)){bar.classList.remove('hide');acc=0}else{acc=Math.sign(d)===Math.sign(acc)?acc+d:d;if(acc>12&&y>80)bar.classList.add('hide');else if(acc<-8)bar.classList.remove('hide')}tk=false})},{passive:true});
bar.addEventListener('focusin',()=>bar.classList.remove('hide'));
// ---- search ----
const dlg=$('#dlg'),q=$('#q'),res=$('#res'),sb=$('#searchBtn');let ctl=null,timer=0,sel=-1,opener=null;
function openSearch(){opener=document.activeElement;if(!dlg.open)dlg.showModal();q.focus();q.select()}
function closeSearch(restore=true){ctl?.abort();dlg.open&&dlg.close();if(restore)(opener&&opener.isConnected?opener:sb).focus()}
sb.addEventListener('click',openSearch);$('#closeBtn').addEventListener('click',()=>closeSearch());
dlg.addEventListener('click',e=>{if(e.target===dlg)closeSearch()});dlg.addEventListener('cancel',e=>{e.preventDefault();closeSearch()});
addEventListener('keydown',e=>{if((e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();openSearch()}});
const hl=(t,n)=>{const i=norm(t).indexOf(n);return i<0||n.length<1||norm(t).length!==t.length?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+n.length))+'</mark>'+esc(t.slice(i+n.length))};
function show(items,n){res.innerHTML=items.map((e,i)=>`<li role="option" id="r${i}" aria-selected="false"><a href="${href(e)}"><span class="kind">${NAMES[e.type]}</span><span class="rt"><b>${hl(e.name,n)}</b><small>${e.username?'@'+esc(e.username)+' · ':''}${esc(e.id)}${context(e)?' · '+esc(context(e)):''}</small></span></a></li>`).join('');sel=-1;q.setAttribute('aria-expanded',items.length?'true':'false')}
async function run(){const raw=q.value,n=norm(raw);ctl?.abort();if(!n){res.innerHTML='';announce('');return}
ctl=new AbortController();const my=ctl;res.innerHTML='<li class="hint"><span class="spin"></span>Searching…</li>';
try{const items=await search(raw,{signal:my.signal,onPartial:p=>{if(ctl===my)show(p,n)}});if(ctl!==my)return;
if(!items.length){res.innerHTML=`<li class="hint">No matches for “${esc(raw.trim())}”. Try a shorter name, a tag, or an ID.</li>`;announce('No results')}else{show(items,n);announce(`${items.length} results`)}}
catch(err){if(err.name==='AbortError')return;console.error(err);res.innerHTML='<li class="hint">Search failed. <button class="btn" id="rt">Retry</button></li>';$('#rt').onclick=run}}
q.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,160)});
q.addEventListener('keydown',e=>{const o=[...res.querySelectorAll('[role=option]')];
if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!o.length)return;e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+o.length)%o.length;o.forEach((x,i)=>x.setAttribute('aria-selected',i===sel));q.setAttribute('aria-activedescendant',o[sel].id);o[sel].scrollIntoView({block:'nearest'})}
else if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);const t=o[sel>=0?sel:0]?.querySelector('a');if(t){closeSearch(false);nav(t.getAttribute('href'))}else run()}});
route();
