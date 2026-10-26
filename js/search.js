import {get,universe,galaxy,planet,profile,parseId,chain} from './gen.js';
export const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
// Bounded deterministic search space (see README). Anything outside it is still reachable by exact ID.
export const SCOPE={universes:300,gU:30,g:12,pG:10,p:10,fU:8,fG:12,fP:8,f:10};
export function score(e,q){const n=norm(e.name),u=norm(e.username),id=e.id.toLowerCase();if(n===q||u===q||id===q)return 100;if(n.startsWith(q)||u.startsWith(q))return 80;if(n.split(' ').some(w=>w.startsWith(q)))return 65;if(n.includes(q)||u.includes(q))return 50;if(e.tags.some(t=>norm(t)===q))return 30;if(e.tags.some(t=>norm(t).includes(q)))return 22;if(norm(e.desc).includes(q))return 10;return 0}
function* space(){const S=SCOPE;
for(let u=0;u<S.universes;u++)yield universe(u);
for(let u=0;u<S.gU;u++)for(let g=0;g<S.g;g++)yield galaxy(u,g);
for(let u=0;u<S.gU;u++)for(let g=0;g<S.pG;g++)for(let p=0;p<S.p;p++)yield planet(u,g,p);
for(let u=0;u<S.fU;u++)for(let g=0;g<S.fG;g++)for(let p=0;p<S.fP;p++)for(let f=0;f<S.f;f++)yield profile(u,g,p,f)}
const tick=()=>new Promise(r=>setTimeout(r,0));
const top=(h,l)=>[...h.values()].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id,'en',{numeric:true})).slice(0,l);
/** Cancellable async search: exact-ID resolution first, then a chunked scan that yields to the UI. */
export async function search(raw,{signal,limit=24,onPartial}={}){const q=norm(raw);if(!q)return[];
const hits=new Map(),add=(e,s)=>{if(s>0&&(!hits.has(e.id)||hits.get(e.id).score<s))hits.set(e.id,{...e,score:s})};
const idp=parseId(raw);if(idp)add(get(idp),200);
let c=0;for(const e of space()){if(signal?.aborted)throw new DOMException('Aborted','AbortError');add(e,score(e,q));if(++c%1500===0){await tick();onPartial?.(top(hits,limit))}}
return top(hits,limit)}
export const context=e=>(chain(e.path)||[]).slice(0,-1).map(x=>x.name).join(' › ');
