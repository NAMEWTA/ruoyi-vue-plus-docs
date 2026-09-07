#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const TEXT_EXT = new Set(['.js','.mjs','.cjs','.ts','.tsx','.vue','.java','.kt','.xml','.yml','.yaml','.json','.md','.txt','.properties','.sql','.sh','.ps1','.html','.css','.scss','.svg','.ftl','.conf']);
const THIRD_PARTY = [/org\.dromara\.sms4j/, /warm[- ]?flow/i, /mica/i, /easy[- ]?es/i, /LICENSE|NOTICE|COPYING/i];
const ignored = new Set(['.git','node_modules','target','dist','build','coverage','.idea','.vscode','temp','.cache','logs','specdev-worktree']);
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const fileSha = p => sha(fs.readFileSync(p));
function args(argv){ const out={_:[]}; for(let i=0;i<argv.length;i++){const x=argv[i]; if(x.startsWith('--')) out[x.slice(2).replaceAll('-','_')]=argv[++i] ?? true; else out._.push(x);} return out; }
function profile(a){ if(!a.profile) throw Error('--profile is required'); const p=JSON.parse(fs.readFileSync(path.resolve(a.profile),'utf8')); p.frontendDir??='frontend'; p.backendDir??='backend'; p.author??='wta'; p.persistenceRoot??='temp/base-sync'; if(!p.brand||!p.javaPackage||!p.targetRoot) throw Error('brand, javaPackage and targetRoot are required'); p.frontendScope??='@'+p.brand.toLowerCase(); return p; }
function walk(root, rel=''){ const abs=path.join(root,rel); if(!fs.existsSync(abs)) return []; return fs.readdirSync(abs,{withFileTypes:true}).flatMap(e=>{const r=path.join(rel,e.name); if(e.isDirectory()&&ignored.has(e.name)) return []; if(e.isFile() && (e.name.endsWith('.tgz')||e.name.endsWith('.zip')||e.name.endsWith('.jar'))) return []; return e.isDirectory()?walk(root,r):[r];}); }
function textFile(p){ return TEXT_EXT.has(path.extname(p).toLowerCase()) && fs.statSync(p).size < 5_000_000; }
function thirdParty(rel, content=''){ return THIRD_PARTY.some(r=>r.test(rel)) || /org\.dromara\.sms4j/.test(content); }
function transform(s,p,rel){ const protectedFile=THIRD_PARTY.some(r=>r.test(rel)) || /org\.dromara\.sms4j/.test(s); const b=p.brand, low=b.toLowerCase(), upper=b.toUpperCase(), scope=p.frontendScope; let out=s; if(!protectedFile){ out=out.replace(/(@author\s+|maintainer[:=]\s*|"author"\s*:\s*")[^\n"<]+/gi,(m,pre)=>pre+p.author); const rules=[[/ruoyi-vue-plus-namewta/gi,low+'-backend'],[/plus-ui-namewta/gi,low+'-frontend'],[/NAMEWTA/g,upper],[/namewta/gi,low],[/@namewta\//g,scope+'/'],[/org\.dromara\b/g,p.javaPackage],[/org\/dromara\b/g,p.javaPackage.replace(/\./g,'/')],[/PLUS官网|plus官网/g,''],[/GitHub|Gitee|github|gitee/g,'']]; for(const [r,v] of rules) out=out.replace(r,v); out=out.replace(/疯狂的狮子Li/gi,p.author); } return out; }
function gitInfo(dir){ if(!fs.existsSync(path.join(dir,'.git'))) return {path:dir,head_sha:null,worktree_sha:null,source_state:'unversioned'}; const run=x=>spawnSync('git',x,{cwd:dir,encoding:'utf8'}).stdout.trim(); const head=run(['rev-parse','HEAD']); const status=run(['status','--porcelain']); const tree=run(['write-tree']); return {path:dir,head_sha:head||null,worktree_sha:tree||null,source_state:status?'dirty':'clean',dirty_files:status?status.split(/\r?\n/).filter(Boolean):[]}; }
function atomic(file,data){ fs.mkdirSync(path.dirname(file),{recursive:true}); const tmp=file+'.tmp-'+process.pid; fs.writeFileSync(tmp,data); if(fs.existsSync(file)) fs.copyFileSync(file,file+'.previous'); fs.renameSync(tmp,file); }
function render(st){ const rows=(st.files||[]).slice(0,200).map(f=>`| ${f.source_repo} | ${f.source_path} | ${f.target_path} | ${f.status} |`).join('\n'); return `# Base mapping\n\n- Status: **${st.status}**\n- Brand: **${st.target.brand}**\n- Java package: **${st.target.java_package}**\n- Updated: ${st.updated_at}\n\n| Source | Source path | Target path | Status |\n|---|---|---|---|\n${rows}\n`; }
function sources(p){ const s=p.source||{}; if(!s.parent||!s.frontend||!s.backend) throw Error('source.parent, source.frontend and source.backend are required'); return s; }
function create(p,mode){ const s=sources(p), target=path.resolve(p.targetRoot); if(mode==='create' && fs.existsSync(target) && fs.readdirSync(target).length) throw Error('target exists and is not empty; use adopt'); if(mode==='adopt' && fs.existsSync(target) && fs.readdirSync(target).length) return walk(target).map(rel=>({source_repo:'target',source_path:null,target_path:rel,relation:'adopted',target_sha256:fileSha(path.join(target,rel)),owner:'first-party',status:'customized'})); const stage=target+'.candidate-'+Date.now(); fs.mkdirSync(stage,{recursive:true}); const files=[]; const rename=x=>x.split(path.sep).map(v=>v.replace(/ruoyi-vue-plus-namewta/gi,p.brand.toLowerCase()+'-backend').replace(/plus-ui-namewta/gi,p.brand.toLowerCase()+'-frontend')).join(path.sep); for(const [repo,root,sub] of [['parent',s.parent,'' ],['frontend',s.frontend,p.frontendDir],['backend',s.backend,p.backendDir]]) for(const rel of walk(root)){ if(repo==='parent' && /^(plus-ui-namewta|ruoyi-vue-plus-namewta)([\\\\/]|$)/i.test(rel)) continue; const destRel=rename(repo==='parent'?rel:path.join(sub,rel)); if(destRel.startsWith('.git'+path.sep)||destRel==='.gitmodules') continue; if(files.some(f=>f.target_path.toLowerCase()===destRel.toLowerCase())) throw Error('path collision: '+destRel); const src=path.join(root,rel), dest=path.join(stage,destRel); fs.mkdirSync(path.dirname(dest),{recursive:true}); if(textFile(src)){const before=fs.readFileSync(src,'utf8'); fs.writeFileSync(dest,transform(before,p,rel));} else fs.copyFileSync(src,dest); const prot=thirdParty(rel, textFile(src)?fs.readFileSync(src,'utf8'):''); files.push({source_repo:repo,source_path:rel,target_path:destRel,relation:destRel===rel?'copied':'renamed',source_sha256:fileSha(src),target_sha256:fileSha(dest),owner:prot?'third-party':'first-party',status:prot?'protected-third-party':'transformed'}); } fs.mkdirSync(target,{recursive:true}); for(const rel of walk(stage)){const from=path.join(stage,rel),to=path.join(target,rel);fs.mkdirSync(path.dirname(to),{recursive:true});if(fs.existsSync(to)&&fileSha(from)!==fileSha(to)) throw Error(`target collision: ${rel}`);fs.copyFileSync(from,to);} fs.rmSync(stage,{recursive:true,force:true}); return files; }
function main(){
  const a=args(process.argv.slice(2)), mode=a._[0];
  if(!['create','adopt','compare','sync','refresh-map'].includes(mode)) throw Error('mode must be create, adopt, compare, sync or refresh-map');
  const p=profile(a), target=path.resolve(p.targetRoot), map=path.resolve(target,p.persistenceRoot,'current.json'), now=new Date().toISOString(), dir=path.dirname(map);
  let old=null;
  if(fs.existsSync(map)){try{old=JSON.parse(fs.readFileSync(map,'utf8'));}catch{throw Error('mapping state is invalid; restore current.json.previous');}}
  if(!old && !['create','adopt'].includes(mode)) throw Error('mapping missing; adopt or restore before comparing');
  if(mode==='create' || (mode==='adopt'&&!old)){
    const files=create(p,mode);
    if(mode==='adopt'){ for(const f of files){ const m=/^(frontend|backend)[\\/](.*)$/.exec(f.target_path); f.source_repo=m?m[1]:'parent'; f.source_path=m?m[2]:f.target_path; const src=p.source?.[f.source_repo]?path.join(p.source[f.source_repo],f.source_path):null; if(src&&fs.existsSync(src)){f.source_sha256=fileSha(src);f.status=f.source_sha256===f.target_sha256?'unchanged':'customized';} else {f.source_sha256=null;f.status='added';} } }
    old={schema_version:1,mapping_version:'rules-v1',status:mode==='create'?'created':'adopted',created_at:now,updated_at:now,base:{parent:gitInfo(p.source.parent),frontend:gitInfo(p.source.frontend),backend:gitInfo(p.source.backend)},observed:{},integrated:null,target:{root:target,brand:p.brand,java_package:p.javaPackage,frontend_scope:p.frontendScope},files,customizations:[],runs:[],deployment:null};
  } else {
    old.updated_at=now;
    old.observed={parent:gitInfo(p.source?.parent||''),frontend:gitInfo(p.source?.frontend||''),backend:gitInfo(p.source?.backend||'')};
    const changes=[];
    for(const f of old.files){
      const to=path.join(target,f.target_path), current=fs.existsSync(to)?fileSha(to):null;
      if(mode==='refresh-map'){if(current!==f.target_sha256) f.status='customized'; f.current_sha256=current; continue;}
      if(!f.source_path || !p.source?.[f.source_repo]){changes.push({target_path:f.target_path,status:'pending-source-mapping'});continue;}
      const from=path.join(p.source[f.source_repo],f.source_path), exists=fs.existsSync(from), sourceHash=exists?fileSha(from):null;
      if(sourceHash===f.source_sha256) continue;
      const status=current===f.target_sha256?(exists?'upstream-change':'upstream-delete'):'conflict';
      changes.push({target_path:f.target_path,status,source_sha256:sourceHash,current_sha256:current});
    }
    old.changes=changes;
    old.status=mode==='sync'?'candidate':mode==='compare'?'compared':'refreshed';
    if(mode==='sync'){
      if(changes.some(c=>c.status==='conflict'||c.status==='pending-source-mapping')) throw Error('unresolved mapping/conflicts; compare report required before sync');
      const cmds=p.verification?.commands||[];
      if(!cmds.length) throw Error('sync requires explicit verification.commands; integrated checkpoint unchanged');
      const backup=path.join(dir,'runs',now.replace(/[:.]/g,'-'),'backup');
      for(const c of changes){const f=old.files.find(x=>x.target_path===c.target_path),to=path.join(target,c.target_path); if(fs.existsSync(to)){const b=path.join(backup,c.target_path);fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(to,b);} if(c.status==='upstream-delete'){fs.unlinkSync(to);}else{const from=path.join(p.source[f.source_repo],f.source_path);fs.writeFileSync(to,textFile(from)?transform(fs.readFileSync(from,'utf8'),p,f.source_path):fs.readFileSync(from));}}
      for(const c of cmds){const r=spawnSync(c,{cwd:target,shell:true,stdio:'inherit'});if(r.status!==0)throw Error(`verification failed; backup retained: ${c}`);}
      for(const c of changes){const f=old.files.find(x=>x.target_path===c.target_path);f.source_sha256=c.source_sha256;f.target_sha256=fs.existsSync(path.join(target,c.target_path))?fileSha(path.join(target,c.target_path)):null;f.status=c.status==='upstream-delete'?'deleted':'transformed';}
      old.integrated={...old.observed,verified_at:now};old.status='synced';
    }
  }
  fs.mkdirSync(dir,{recursive:true});
  if(!old.snapshot){const snap=path.join(dir,'snapshots',now.replace(/[:.]/g,'-'));for(const f of old.files){const to=path.join(target,f.target_path);if(fs.existsSync(to)){const dst=path.join(snap,'target',f.target_path);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(to,dst);}if(f.source_path&&p.source?.[f.source_repo]){const from=path.join(p.source[f.source_repo],f.source_path);if(fs.existsSync(from)){const dst=path.join(snap,'source',f.source_repo,f.source_path);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(from,dst);}}}old.snapshot=path.relative(target,snap);}
  atomic(map,JSON.stringify(old,null,2)+'\n');atomic(path.join(dir,'mapping.md'),render(old));
  const runDir=path.join(dir,'runs',now.replace(/[:.]/g,'-'));fs.mkdirSync(runDir,{recursive:true});fs.writeFileSync(path.join(runDir,'result.json'),JSON.stringify({mode,status:old.status,at:now,changes:old.changes||[]},null,2));
  console.log(JSON.stringify({mode,status:old.status,target,files:old.files?.length||0,mapping:map},null,2));
}
try{main();}catch(e){console.error(`base-platform-migration: ${e.message}`);process.exitCode=1;}


