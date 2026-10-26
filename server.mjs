import {createServer} from 'node:http';import {readFile} from 'node:fs/promises';import {extname,join,normalize} from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
export const server=createServer(async(q,s)=>{const p=normalize(decodeURIComponent(new URL(q.url,'http://x').pathname)).replace(/^(\.\.[/\\])+/,'');
const ok=/^\/(css|js)\/|^\/favicon\.svg$/.test(p.replace(/\\/g,'/'));const f=ok?join(root,p):join(root,'index.html');
try{const b=await readFile(f);s.writeHead(200,{'Content-Type':T[extname(f)]||'text/html; charset=utf-8','Cache-Control':ok?'public,max-age=3600':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"});s.end(b)}catch{s.writeHead(404);s.end('Not found')}});
if(process.argv[1]===fileURLToPath(import.meta.url)){const P=process.env.PORT||4173;server.listen(P,()=>console.log('INFINIVERSE on http://localhost:'+P))}
