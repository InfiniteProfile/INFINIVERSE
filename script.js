/* INFINIVERSE - plain script, no modules, works from file:// */
(()=>{'use strict';
/* ===== GENERATION + SEARCH ===== */
// Deterministic, parent-scoped procedural generation. Nothing is stored; every entity is a pure function of its path.
function hash(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}
function rng(seed){let a=hash(seed)();return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const MAX_INDEX=999999; // documented technical limit per parent
const P1=['Aur','Vel','Nox','Cyr','Lum','Eld','Zen','Kor','Ily','Sol','Thal','Myr','Ori','Vex','Qua'],P2=['ion','ara','eth','ova','is','ume','yx','andra','ora','ial','une','ex'];
const NA=['Lyra','Cinder','Halcyon','Meridian','Umbra','Aster','Nimbus','Vesper','Ember','Orchid','Quartz','Zephyr'],NB=['Reach','Drift','Veil','Expanse','Crown','Spiral','Cradle','Verge','Haven','Gate'];
const UT=['quiet','radiant','ancient','restless','crystalline','tidal','luminous','hollow'],PT=['ocean','rocky','frozen','desert','gas','volcanic','jungle','storm'];
const PRO=['Cartographer','Bard','Engineer','Botanist','Navigator','Archivist','Painter','Pilot','Chef','Composer','Mechanic','Dreamer'],INT=['astro-photography','synthwave','chess','gardening','speedruns','poetry','robotics','sailing','pixel art','tea','retro games','climbing'];
const an=w=>/^[aeiou]/i.test(w)?'An':'A',mo=n=>n===0?'no moons':n===1?'1 moon':n+' moons';const word=r=>pick(r,P1)+pick(r,P2),cap=s=>s[0].toUpperCase()+s.slice(1);
const ok=n=>Number.isInteger(n)&&n>=0&&n<=MAX_INDEX;
function universe(n){if(!ok(n))return null;const r=rng('U'+n),t=pick(r,UT);return{type:'universe',id:`U${n}`,path:[n],name:`${word(r)} ${pick(r,['Prime','Cluster','Continuum','Sea','Field'])}`,desc:`${an(t)} ${t} universe whose galaxies drift in slow, patterned spirals.`,tags:[t,pick(r,UT),'universe'],hue:Math.floor(r()*360),kind:t}}
function galaxy(u,k){if(!ok(u)||!ok(k))return null;const r=rng(`U${u}G${k}`);return{type:'galaxy',id:`U${u}-G${k}`,path:[u,k],name:`${pick(r,NA)} ${pick(r,NB)}`,desc:`A luminous galaxy with ${2+Math.floor(r()*4)} arms and a bright core, part of universe U${u}.`,tags:['galaxy',pick(r,['spiral','barred','elliptical','ringed'])],hue:Math.floor(r()*360),arms:2+Math.floor(r()*4),twist:Math.floor(r()*40)}}
function planet(u,g,k){if(!ok(u)||!ok(g)||!ok(k))return null;const r=rng(`U${u}G${g}P${k}`),t=pick(r,PT);return{type:'planet',id:`U${u}-G${g}-P${k}`,path:[u,g,k],name:`${word(r)} ${pick(r,['I','II','III','IV','V','VI','VII'])}`,desc:`${an(t)} ${t} world with ${mo(Math.floor(r()*5))} and a ${pick(r,['thin','dense','dusty','clear'])} atmosphere.`,tags:['planet',t],hue:Math.floor(r()*360),kind:t,ring:r()>.7}}
function profile(u,g,p,k){if(![u,g,p,k].every(ok))return null;const r=rng(`U${u}G${g}P${p}F${k}`),a=word(r),b=cap(pick(r,P1)+pick(r,P2)),role=pick(r,PRO);return{type:'profile',id:`U${u}-G${g}-P${p}-F${k}`,path:[u,g,p,k],name:`${a} ${b}`,username:`${a.toLowerCase()}_${Math.floor(r()*900)+100}`,desc:`Fictional ${role.toLowerCase()} who loves ${pick(r,INT)}. Generated persona, not a real person.`,tags:['profile',role.toLowerCase(),pick(r,INT)],hue:Math.floor(r()*360),initials:a[0]+b[0]}}
const make={universe:p=>universe(p[0]),galaxy:p=>galaxy(p[0],p[1]),planet:p=>planet(p[0],p[1],p[2]),profile:p=>profile(p[0],p[1],p[2],p[3])};
const LEVELS=['universe','galaxy','planet','profile'];
const get=(path)=>path.length&&path.length<=4?make[LEVELS[path.length-1]](path):null;
/** Cursor pagination over children of parentPath. Cursor = next index, so pages never overlap. */
function page(parentPath,cursor=0,size=12){const items=[];for(let i=cursor;i<Math.min(cursor+size,MAX_INDEX+1);i++)items.push(get([...parentPath,i]));return{items,next:cursor+size>MAX_INDEX?null:cursor+size}}
function chain(path){if(!path.length||path.length>4)return null;const out=[];for(let i=1;i<=path.length;i++){const e=get(path.slice(0,i));if(!e)return null;out.push(e)}return out}
const href=e=>'#/u/'+e.path[0]+['','/g/','/p/','/f/'].map((s,i)=>i&&e.path[i]!==undefined?s+e.path[i]:'').join('');
const nums=m=>m.slice(1).filter(x=>x!==undefined).map(Number);
function parseUrl(p){const m=p.replace(/\/+$/,'').match(/^\/u\/(\d+)(?:\/g\/(\d+)(?:\/p\/(\d+)(?:\/f\/(\d+))?)?)?$/);if(!m)return null;const a=nums(m);return chain(a)?a:null}
function parseId(q){const m=q.trim().toUpperCase().match(/^U(\d+)(?:-G(\d+)(?:-P(\d+)(?:-F(\d+))?)?)?$/);if(!m)return null;const a=nums(m);return chain(a)?a:null}

const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
// Bounded deterministic search space (see README). Anything outside it is still reachable by exact ID.
const SCOPE={universes:300,gU:30,g:12,pG:10,p:10,fU:8,fG:12,fP:8,f:10};
function score(e,q){const n=norm(e.name),u=norm(e.username),id=e.id.toLowerCase();if(n===q||u===q||id===q)return 100;if(n.startsWith(q)||u.startsWith(q))return 80;if(n.split(' ').some(w=>w.startsWith(q)))return 65;if(n.includes(q)||u.includes(q))return 50;if(e.tags.some(t=>norm(t)===q))return 30;if(e.tags.some(t=>norm(t).includes(q)))return 22;if(norm(e.desc).includes(q))return 10;return 0}
function* space(){const S=SCOPE;
for(let u=0;u<S.universes;u++)yield universe(u);
for(let u=0;u<S.gU;u++)for(let g=0;g<S.g;g++)yield galaxy(u,g);
for(let u=0;u<S.gU;u++)for(let g=0;g<S.pG;g++)for(let p=0;p<S.p;p++)yield planet(u,g,p);
for(let u=0;u<S.fU;u++)for(let g=0;g<S.fG;g++)for(let p=0;p<S.fP;p++)for(let f=0;f<S.f;f++)yield profile(u,g,p,f)}
const tick=()=>new Promise(r=>setTimeout(r,0));
const top=(h,l)=>[...h.values()].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id,'en',{numeric:true})).slice(0,l);
/** Cancellable async search: exact-ID resolution first, then a chunked scan that yields to the UI. */
async function search(raw,{signal,limit=24,onPartial}={}){const q=norm(raw).replace(/^@/,'');if(!q)return[];
const hits=new Map(),add=(e,s)=>{if(s>0&&(!hits.has(e.id)||hits.get(e.id).score<s))hits.set(e.id,{...e,score:s})};
const idp=parseId(raw);if(idp)add(get(idp),200);
let c=0;for(const e of space()){if(signal?.aborted)throw new DOMException('Aborted','AbortError');add(e,score(e,q));if(++c%1500===0){await tick();onPartial?.(top(hits,limit))}}
return top(hits,limit)}
const context=e=>(chain(e.path)||[]).slice(0,-1).map(x=>x.name).join(' › ');

/* ===== APP ===== */

/* ===== animated deep-space canvas (DPR-aware, pauses when hidden, static under reduced motion) ===== */
(()=>{const c=document.getElementById('cosmos');if(!c)return;const x=c.getContext('2d'),rm=matchMedia('(prefers-reduced-motion: reduce)');let w,h,S=[],M=[],raf=0,next=0;
const size=()=>{const d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(d,0,0,d,0,0);S=Array.from({length:Math.min(240,Math.floor(w*h/7500))},()=>({x:Math.random()*w,y:Math.random()*h,z:.15+Math.random()*.85,p:Math.random()*6.28,k:Math.random()}));draw(0)};
function draw(t){x.clearRect(0,0,w,h);const sy=scrollY;for(const s of S){const y=((s.y-sy*s.z*.3-t*.006*s.z)%h+h)%h,a=rm.matches?.8:.4+.6*Math.abs(Math.sin(t*.0007*s.z+s.p));x.globalAlpha=a*(.4+.6*s.z);x.fillStyle=s.k>.88?'#e8c98a':s.k>.65?'#8defff':'#fff';x.beginPath();x.arc(s.x,y,.5+s.z*1.3,0,6.283);x.fill()}
if(!rm.matches){if(t>next){M.push({x:Math.random()*w,y:Math.random()*h*.5,v:6+Math.random()*4,l:1});next=t+5000+Math.random()*7000}
M=M.filter(m=>m.l>0);for(const m of M){x.globalAlpha=m.l;const g=x.createLinearGradient(m.x,m.y,m.x-m.v*10,m.y-m.v*5);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');x.strokeStyle=g;x.lineWidth=1.6;x.beginPath();x.moveTo(m.x,m.y);x.lineTo(m.x-m.v*10,m.y-m.v*5);x.stroke();m.x+=m.v;m.y+=m.v*.5;m.l-=.018}}x.globalAlpha=1}
const loop=t=>{draw(t);raf=requestAnimationFrame(loop)};
const go=()=>{cancelAnimationFrame(raf);if(!rm.matches&&!document.hidden)raf=requestAnimationFrame(loop)};
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,150)});document.addEventListener('visibilitychange',go);rm.addEventListener&&rm.addEventListener('change',()=>{size();go()});size();go()})();
const $=s=>document.querySelector(s),main=$('#main'),live=$('#live');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const announce=t=>{live.textContent='';setTimeout(()=>live.textContent=t,50)};
const HERO=`<section class="hero"><div><p class="lvl">Explore the cosmos</p><h1>INFINIVERSE</h1><p class="tagl"><span>Infinite Universes.</span><span>Infinite Galaxies.</span><span>Infinite Worlds.</span><span>Infinite Identities.</span></p><p class="lead">A boundless, deterministic cosmos. Every universe holds galaxies, every galaxy holds planets, every planet holds fictional identities waiting to be discovered.</p><div class="cta"><button class="btn gold" id="heroSearch" type="button">Search the cosmos</button><a class="btn" href="#/u/0">Enter Universe 0</a></div><p class="flow">Universe <b>›</b> Galaxy <b>›</b> Planet <b>›</b> Profile</p></div><svg class="emblem" viewBox="0 0 200 200" aria-hidden="true"><g class="o o1"><ellipse cx="100" cy="100" rx="92" ry="32" stroke="url(#gg)"/></g><g class="o o2"><ellipse cx="100" cy="100" rx="92" ry="32" transform="rotate(60 100 100)" stroke="url(#gg)"/></g><g class="o o3"><ellipse cx="100" cy="100" rx="92" ry="32" transform="rotate(120 100 100)" stroke="url(#gg)"/></g><path class="e" d="M100 100c-14-28-50-28-50 0s36 28 50 0 50-28 50 0-36 28-50 0z" fill="none" stroke="url(#gg)" stroke-width="5" stroke-linecap="round"/><circle class="core" cx="100" cy="100" r="5" fill="#fff"/></svg></section>`;
const PL={universe:'Universes',galaxy:'Galaxies',planet:'Planets',profile:'Profiles'};const NAMES={universe:'Universe',galaxy:'Galaxy',planet:'Planet',profile:'Profile'};
function art(e){const h=`style="--h:${e.hue}"`;
if(e.type==='universe')return`<div class="uni" ${h}></div>`;
if(e.type==='galaxy')return`<div class="gal" style="--h:${e.hue};--a:${e.arms}"></div>`;
if(e.type==='planet')return`<div class="pl ${e.kind} ${e.ring?'ring':''}" ${h}></div>`;
return`<div class="av" ${h} role="img" aria-label="Generated avatar for ${esc(e.name)}">${esc(e.initials)}</div>`}
const tags=e=>`<div class="tags">${e.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`;
const card=(e,i)=>`<li><a class="card" href="${href(e)}" style="animation-delay:${Math.min(i%12,11)*40}ms"><div class="art">${art(e)}</div><div><span class="id">${e.id}</span><h2>${esc(e.name)}</h2>${e.username?`<p>@${esc(e.username)}</p>`:''}<p>${esc(e.desc)}</p>${tags(e)}</div></a></li>`;
// ---- routing (History API) ----
let cleanup=()=>{};
function route(){cleanup();cleanup=()=>{};const hp=location.hash.slice(1)||'/';const path=hp==='/'?[]:parseUrl(hp);
if(path===null)return notFound();const ch=path.length?chain(path):[];renderCrumbs(ch);
const cur=ch[ch.length-1];document.title=cur?`${cur.name} · INFINIVERSE`:'INFINIVERSE';
if(cur?.type==='profile')detail(cur,ch);else list(path,cur);scrollTo(0,0);main.focus({preventScroll:true})}
function renderCrumbs(ch){const items=[['INFINIVERSE','#/'],...ch.map(e=>[e.name,href(e)])];
$('#crumbs').innerHTML=items.map(([n,h],i)=>(i?'<b aria-hidden="true">/</b>':'')+(i===items.length-1?`<span aria-current="page" title="${esc(n)}">${esc(n)}</span>`:`<a href="${h}" title="${esc(n)}">${esc(n)}</a>`)).join('')}
function notFound(){renderCrumbs([]);document.title='Not found · INFINIVERSE';main.innerHTML=`<div class="view msg"><p class="lvl">Signal lost</p><h1>This region of space doesn’t exist</h1><p class="lead" style="margin:auto">The address is invalid or outside the supported index range.</p><p><a class="btn" style="display:inline-grid;place-items:center" href="#/">Return to the cosmos</a></p></div>`}
// ---- list with cursor pagination + IntersectionObserver ----
function list(path,cur){const lvl=path.length,child=LEVELS[lvl],intro=cur?`<p class="lvl">${NAMES[cur.type]} · ${cur.id}</p><h1>${esc(cur.name)}</h1><p class="lead">${esc(cur.desc)}</p>${tags(cur)}`:HERO;
main.innerHTML=`<div class="view">${intro}<div class="sec"><h2>${cur?(cur.type==='universe'?'Galaxies':cur.type==='galaxy'?'Planets':'Profiles')+' in '+esc(cur.name):'Explore Universes'}</h2></div><ul class="grid" id="g"></ul><div class="more" id="more"></div></div>`;$('#heroSearch')?.addEventListener('click',openSearch);
const vio='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('off',!e.isIntersecting)),{rootMargin:'120px'}):null;const g=$('#g'),more=$('#more');let cursor=0,busy=false,done=false,count=0,failed=false;const seen=new Set();
const load=()=>{if(busy||done)return;busy=true;more.innerHTML='<span class="spn"></span>Loading…';
try{const pg=page(path,cursor,12);const fresh=pg.items.filter(e=>e&&!seen.has(e.id));fresh.forEach(e=>seen.add(e.id));g.insertAdjacentHTML('beforeend',fresh.map((e,i)=>card(e,i)).join(''));g.querySelectorAll('.card:not([data-o])').forEach(c=>{c.dataset.o=1;vio?.observe(c)});count+=fresh.length;cursor=pg.next;if(cursor===null){done=true;more.textContent='End of the supported index.'}else more.innerHTML='<button class="btn" id="mb">Load more</button>';announce(`${count} ${PL[child].toLowerCase()} loaded`);failed=false}
catch(err){console.error(err);failed=true;more.innerHTML='<p>Couldn’t load more.</p><button class="btn" id="mb">Retry</button>'}busy=false};
more.addEventListener('click',e=>{if(e.target.id==='mb')load()});load();
const io='IntersectionObserver'in window?new IntersectionObserver(es=>{if(es[0].isIntersecting&&!failed&&count<3000)load()},{rootMargin:'600px'}):null;io?.observe(more);cleanup=()=>{io?.disconnect();vio?.disconnect()}}
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
async function run(){const raw=q.value,n=norm(raw).replace(/^@/,'');ctl?.abort();if(!n){res.innerHTML='';announce('');return}
ctl=new AbortController();const my=ctl;res.innerHTML='<li class="hint"><span class="spn"></span>Searching…</li>';
try{const items=await search(raw,{signal:my.signal,onPartial:p=>{if(ctl===my)show(p,n)}});if(ctl!==my)return;
if(!items.length){res.innerHTML=`<li class="hint">No matches for “${esc(raw.trim())}”. Try a shorter name, a tag, or an ID.</li>`;announce('No results')}else{show(items,n);announce(`${items.length} results`)}}
catch(err){if(err.name==='AbortError')return;console.error(err);res.innerHTML='<li class="hint">Search failed. <button class="btn" id="rt">Retry</button></li>';$('#rt').onclick=run}}
q.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,160)});
q.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSearch();return}const o=[...res.querySelectorAll('[role=option]')];
if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!o.length)return;e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+o.length)%o.length;o.forEach((x,i)=>x.setAttribute('aria-selected',i===sel));q.setAttribute('aria-activedescendant',o[sel].id);o[sel].scrollIntoView({block:'nearest'})}
else if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);const t=o[sel>=0?sel:0]?.querySelector('a');if(t){closeSearch(false);location.hash=t.getAttribute('href')}else run()}});
addEventListener('hashchange',route);
res.addEventListener('click',e=>{if(e.target.closest('a'))closeSearch(false)});
route();

})();
