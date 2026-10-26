// Deterministic, parent-scoped procedural generation. Nothing is stored; every entity is a pure function of its path.
function hash(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}
function rng(seed){let a=hash(seed)();return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
export const MAX_INDEX=999999; // documented technical limit per parent
const P1=['Aur','Vel','Nox','Cyr','Lum','Eld','Zen','Kor','Ily','Sol','Thal','Myr','Ori','Vex','Qua'],P2=['ion','ara','eth','ova','is','ume','yx','andra','ora','ial','une','ex'];
const NA=['Lyra','Cinder','Halcyon','Meridian','Umbra','Aster','Nimbus','Vesper','Ember','Orchid','Quartz','Zephyr'],NB=['Reach','Drift','Veil','Expanse','Crown','Spiral','Cradle','Verge','Haven','Gate'];
const UT=['quiet','radiant','ancient','restless','crystalline','tidal','luminous','hollow'],PT=['ocean','rocky','frozen','desert','gas','volcanic','jungle','storm'];
const PRO=['Cartographer','Bard','Engineer','Botanist','Navigator','Archivist','Painter','Pilot','Chef','Composer','Mechanic','Dreamer'],INT=['astro-photography','synthwave','chess','gardening','speedruns','poetry','robotics','sailing','pixel art','tea','retro games','climbing'];
const word=r=>pick(r,P1)+pick(r,P2),cap=s=>s[0].toUpperCase()+s.slice(1);
const ok=n=>Number.isInteger(n)&&n>=0&&n<=MAX_INDEX;
export function universe(n){if(!ok(n))return null;const r=rng('U'+n),t=pick(r,UT);return{type:'universe',id:`U${n}`,path:[n],name:`${word(r)} ${pick(r,['Prime','Cluster','Continuum','Sea','Field'])}`,desc:`A ${t} universe whose galaxies drift in slow, patterned spirals.`,tags:[t,pick(r,UT),'universe'],hue:Math.floor(r()*360),kind:t}}
export function galaxy(u,k){if(!ok(u)||!ok(k))return null;const r=rng(`U${u}G${k}`);return{type:'galaxy',id:`U${u}-G${k}`,path:[u,k],name:`${pick(r,NA)} ${pick(r,NB)}`,desc:`A spiral galaxy with ${2+Math.floor(r()*4)} arms and a bright core, part of universe U${u}.`,tags:['galaxy',pick(r,['spiral','barred','elliptical','ringed'])],hue:Math.floor(r()*360),arms:2+Math.floor(r()*4),twist:Math.floor(r()*40)}}
export function planet(u,g,k){if(!ok(u)||!ok(g)||!ok(k))return null;const r=rng(`U${u}G${g}P${k}`),t=pick(r,PT);return{type:'planet',id:`U${u}-G${g}-P${k}`,path:[u,g,k],name:`${word(r)} ${pick(r,['I','II','III','IV','V','VI','VII'])}`,desc:`A ${t} world with ${Math.floor(r()*5)} moons and a ${pick(r,['thin','dense','dusty','clear'])} atmosphere.`,tags:['planet',t],hue:Math.floor(r()*360),kind:t,ring:r()>.7}}
export function profile(u,g,p,k){if(![u,g,p,k].every(ok))return null;const r=rng(`U${u}G${g}P${p}F${k}`),a=word(r),b=cap(pick(r,P1)+pick(r,P2)),role=pick(r,PRO);return{type:'profile',id:`U${u}-G${g}-P${p}-F${k}`,path:[u,g,p,k],name:`${a} ${b}`,username:`${a.toLowerCase()}_${Math.floor(r()*900)+100}`,desc:`Fictional ${role.toLowerCase()} who loves ${pick(r,INT)}. Generated persona, not a real person.`,tags:['profile',role.toLowerCase(),pick(r,INT)],hue:Math.floor(r()*360),initials:a[0]+b[0]}}
const make={universe:p=>universe(p[0]),galaxy:p=>galaxy(p[0],p[1]),planet:p=>planet(p[0],p[1],p[2]),profile:p=>profile(p[0],p[1],p[2],p[3])};
export const LEVELS=['universe','galaxy','planet','profile'];
export const get=(path)=>path.length&&path.length<=4?make[LEVELS[path.length-1]](path):null;
/** Cursor pagination over children of parentPath. Cursor = next index, so pages never overlap. */
export function page(parentPath,cursor=0,size=12){const items=[];for(let i=cursor;i<Math.min(cursor+size,MAX_INDEX+1);i++)items.push(get([...parentPath,i]));return{items,next:cursor+size>MAX_INDEX?null:cursor+size}}
export function chain(path){if(!path.length||path.length>4)return null;const out=[];for(let i=1;i<=path.length;i++){const e=get(path.slice(0,i));if(!e)return null;out.push(e)}return out}
export const href=e=>'/u/'+e.path[0]+['','/g/','/p/','/f/'].map((s,i)=>i&&e.path[i]!==undefined?s+e.path[i]:'').join('');
const nums=m=>m.slice(1).filter(x=>x!==undefined).map(Number);
export function parseUrl(p){const m=p.replace(/\/+$/,'').match(/^\/u\/(\d+)(?:\/g\/(\d+)(?:\/p\/(\d+)(?:\/f\/(\d+))?)?)?$/);if(!m)return null;const a=nums(m);return chain(a)?a:null}
export function parseId(q){const m=q.trim().toUpperCase().match(/^U(\d+)(?:-G(\d+)(?:-P(\d+)(?:-F(\d+))?)?)?$/);if(!m)return null;const a=nums(m);return chain(a)?a:null}
