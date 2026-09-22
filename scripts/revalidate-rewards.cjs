/* Rebuild only reward/rank fields from explicit, game-scoped source records. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const root=path.resolve(__dirname,'..');
const cache=path.join(root,'work/reward-audit');
fs.mkdirSync(cache,{recursive:true});
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#039;|&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const key=s=>clean(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const rank=s=>({lr:'low',low:'low',lowrank:'low',hr:'high',high:'high',highrank:'high',mr:'master',g:'master',grank:'master',master:'master',masterrank:'master'})[key(s)]||null;
async function get(url,binary=false){
 const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex')+(binary?'.bin':'.txt'));
 if(fs.existsSync(file))return binary?fs.readFileSync(file):fs.readFileSync(file,'utf8');
 for(let attempt=0;attempt<3;attempt++)try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status+' '+url);const b=Buffer.from(await r.arrayBuffer());fs.writeFileSync(file,b);return binary?b:b.toString('utf8');}catch(e){if(attempt===2)throw e;}
}
function links(html,re){return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter(m=>re.test(m[1])).map(m=>({url:m[1],name:clean(m[2]),html:m[2]}));}
function cells(row){return [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1]);}
function method(text){
 let type='reward',part=null;
 if(/carv/i.test(text)){type='carve';part=/tail/i.test(text)?'Tail':'Body';}
 else if(/captur/i.test(text))type='capture';
 else if(/break|wound/i.test(text)){type='broken-part';part=text.replace(/^.*?(?:'s |Wound |Break )/i,'');}
 else if(/investigation/i.test(text))type='investigation';
 else if(/plunder/i.test(text))type='plunderblade';
 else if(/palic/i.test(text))type='palico';
 else if(/track/i.test(text))type='track';
 else if(/drop|shiny/i.test(text))type='dropped';
 else if(/hunt|target/i.test(text))type='target-reward';
 return {type,part,sourceLabel:text};
}
function grouped(rows){const map=new Map();for(const r of rows){const k=r.itemId||r.item;let target=map.get(k);if(!target){target={...r,conditions:[]};map.set(k,target);}for(const c of r.conditions){if(!target.conditions.some(x=>JSON.stringify(x)===JSON.stringify(c)))target.conditions.push(c);}}return [...map.values()];}
function csv(text){return text.trim().split(/\r?\n/).slice(1).map(line=>{const values=[];let value='',quoted=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){values.push(value);value='';}else value+=ch;}values.push(value);return values;});}
function worldRewards(html,url){
 const rows=[];let currentRank=null,section='',major='';
 for(const token of html.matchAll(/<h6\b[^>]*>([\s\S]*?)<\/h6>|<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  if(token[1]!=null){const h=clean(token[1]);if(rank(h))currentRank=rank(h);else{major=h;currentRank=null;}section='';continue;}
  const raw=cells(token[2]);if(!raw.length)continue;
  const item=links(raw[0],/\/items\//)[0];
  if(!item){if(raw.length===1)section=clean(raw[0]);continue;}
  const chance=clean(raw[1]).match(/(\d+(?:\.\d+)?)%/);if(!currentRank||!chance)continue;
  const image=raw[0].match(/<img[^>]+src="([^"]+)"/i)?.[1];
  rows.push({item:item.name,itemId:item.url,iconSource:image||null,source:url,conditions:[{...method(section||major),rank:currentRank,chance:Number(chance[1]),quantity:Number(clean(raw[0]).match(/\bx(\d+)/i)?.[1]||1),sourceSection:major}]});
 }
 // Generic investigation tables can exist for monsters that do not occur in that rank.
 const ranks=[...new Set(rows.filter(r=>r.conditions[0].sourceSection!=='Investigations').map(r=>r.conditions[0].rank))];
 return {rewards:grouped(rows.filter(r=>ranks.includes(r.conditions[0].rank))),ranks};
}
function riseRewards(html,url,icons){const rows=[];for(const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){const c=cells(m[1]);const item=links(c[0]||'',/\/data\/items\//)[0];if(!item||c.length<6)continue;const r=rank(clean(c[1]));const chance=clean(c[5]).match(/(\d+(?:\.\d+)?)%/);if(!r||!chance)continue;rows.push({item:item.name,itemId:item.url,iconSource:icons.get(item.url)||null,source:url,conditions:[{...method(clean(c[2])),part:clean(c[3])||null,rank:r,quantity:Number(clean(c[4]).replace(/[^\d]/g,''))||1,chance:Number(chance[1])}]});}const rewards=grouped(rows);return {rewards,ranks:[...new Set(rows.map(r=>r.conditions[0].rank))]};}
async function main(){
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'src/data/monster-catalog.v1.json'),'utf8'));
 const [worldIndex,worldItemIndex,riseLarge,riseSmall,riseItems,wildsText,wildsItems,guTreeText,worldCsv,worldItemCsv,manifestText]=await Promise.all([
  get('https://mhworld.kiranico.com/en/monsters'),get('https://mhworld.kiranico.com/en/items'),get('https://mhrise.kiranico.com/data/monsters?view=lg'),get('https://mhrise.kiranico.com/data/monsters?view=sm'),get('https://mhrise.kiranico.com/data/items?view=material'),get('https://wilds.mhdb.io/en/monsters'),get('https://mhwilds.kiranico.com/data/items'),get('https://api.github.com/repos/gatheringhallstudios/MHGenDatabase/git/trees/master?recursive=1'),get('https://raw.githubusercontent.com/gatheringhallstudios/MHWorldData/master/source_data/monsters/monster_rewards.csv'),get('https://raw.githubusercontent.com/gatheringhallstudios/MHWorldData/master/source_data/items/item_base.csv'),get('https://raw.githubusercontent.com/lazywalker/zukan-assets/master/source/item-icons/_manifest.json')]);
 const indexes={world:new Map(links(worldIndex,/\/monsters\/[^/]+\//).map(x=>[key(x.name),x.url])),rise:new Map(links(riseLarge+riseSmall,/\/data\/monsters\//).map(x=>[key(x.name),x.url]))};
 const riseIcons=new Map(links(riseItems,/\/data\/items\//).map(x=>[x.url,x.html.match(/<img[^>]+src="([^"]+)"/i)?.[1]?.replace(/^http:/,'https:')]).filter(x=>x[1]));
 for(const view of ['account','consume']) {const html=await get('https://mhrise.kiranico.com/data/items?view='+view);for(const x of links(html,/\/data\/items\//)){const image=x.html.match(/<img[^>]+src="([^"]+)"/i)?.[1];if(image)riseIcons.set(x.url,image.replace(/^http:/,'https:'));}}
 const wilds=JSON.parse(wildsText);
 const worldRows=csv(worldCsv),worldItems=new Map(csv(worldItemCsv).map(r=>[key(r[1]),{kind:r[9],color:r[10]}]));
 const worldIndexIcons=new Map(links(worldItemIndex,/\/items\//).map(x=>[key(x.name),x.html.match(/<img[^>]+src="([^"]+)"/i)?.[1]]).filter(x=>x[1]));
 const itemManifest=JSON.parse(manifestText).icons;
 const worldIcon=(name)=>{if(worldIndexIcons.has(key(name)))return worldIndexIcons.get(key(name));const ref=worldItems.get(key(name));if(!ref)return null;const aliases={liquid:'medicine',sphere:'armor-sphere',question:'question-mark',feystone:'streamstone',fang:'claw'};const kind=aliases[key(ref.kind)]||ref.kind;const asset=itemManifest.find(i=>key(i.kind)===key(kind)&&key(i.color)===key(ref.color))||itemManifest.find(i=>key(i.kind)===key(kind));return asset?'https://raw.githubusercontent.com/lazywalker/zukan-assets/master/source/item-icons/'+asset.svg:null;};
 const wildIcons=new Map(links(wildsItems,/\/data\/items\//).map(x=>[key(x.name),x.html.match(/<img[^>]+src="([^"]+)"/i)?.[1]]).filter(x=>x[1]));
 const dbFile=path.join(root,'work/mhgu-db/mhgu.db');
 if(!fs.existsSync(dbFile))throw Error('MHGU source database required: GatheringHallStudios/MHGenDatabase app/src/main/assets/databases/mhgu.db.zip');
 const db=new DatabaseSync(dbFile,{readOnly:true});
 const guMonsters=db.prepare('SELECT * FROM monsters').all();
 const guIcons=new Map(JSON.parse(guTreeText).tree.filter(x=>/\/icon-res\/drawable\/.*\.png$/.test(x.path)).map(x=>[path.basename(x.path,'.png'),'https://raw.githubusercontent.com/gatheringhallstudios/MHGenDatabase/master/'+x.path]));
 guIcons.set('icon_question_mark','https://raw.githubusercontent.com/gatheringhallstudios/MHGenDatabase/master/app/src/main/res/drawable-xhdpi/question_mark_grey.png');
 const report={checkedAt:new Date().toISOString(),entries:[],failures:[],icons:[]};
 let completed=0;
 const queue=[...catalog.entries];
 await Promise.all(Array.from({length:4},async()=>{while(queue.length){const e=queue.shift();try{
  let data,url;
  if(e.game==='world'||e.game==='rise'){
   url=indexes[e.game].get(key(e.name==='Kestodon'&&e.game==='world'?'Kestodon (Male)':e.name));if(!url)throw Error('No exact source page for '+e.name);
   const html=await get(url);data=e.game==='world'?worldRewards(html,url):riseRewards(html,url,riseIcons);
   if(e.game==='world'){
    const kiranicoData=data;
    const iconByItem=new Map(data.rewards.filter(x=>x.iconSource).map(x=>[key(x.item),x.iconSource]));
    const rows=worldRows.filter(r=>key(r[0])===key(e.name)||e.name==='Kestodon'&&/^kestodon(?: \(male\)| \(female\))?$/i.test(r[0]));
    if(rows.length){
     const source='https://github.com/gatheringhallstudios/MHWorldData/blob/master/source_data/monsters/monster_rewards.csv';
     data={rewards:grouped(rows.map(r=>({item:r[3],itemId:r[3],source,iconSource:iconByItem.get(key(r[3]))||worldIcon(r[3]),conditions:[{...method(r[2]),sourceLabel:r[2],rank:rank(r[1]),quantity:Number(r[4]),chance:Number(r[5])}]}))),ranks:[...new Set(rows.map(r=>rank(r[1])).filter(Boolean))]};
     url=source;
     // The base-World CSV omits Iceborne encounters for these two base monsters.
     // Kulve is the MR target of The Eternal Gold Rush; regular Deviljho is a
     // secondary MR monster in Return of the Crazy One. Retain only obtainable
     // carve/break/drop evidence, never generic investigation or hunt placeholders.
     if(['Kulve Taroth','Deviljho'].includes(e.name)&&kiranicoData.ranks.includes('master')){
      const mr=kiranicoData.rewards.map(reward=>({...reward,conditions:reward.conditions.filter(condition=>condition.rank==='master'&&condition.sourceSection!=='Investigations'&&!/^(?:Hunt|Capture|Investigation Rewards|Monster tracks|Guiding Lands|Bandit Mantle)/i.test(condition.sourceLabel))})).filter(reward=>reward.conditions.length);
      if(!mr.length)throw Error('Missing source-backed master-rank rewards for '+e.name);
      data.rewards=grouped([...data.rewards,...mr]);
      data.ranks.push('master');
     }
    }else{
     // MHWorldData covers base World only. Iceborne-exclusive entries use their
     // Kiranico master-rank reward section; generic investigations are excluded.
     data.ranks=['master'];
     data.rewards=data.rewards.map(r=>({...r,conditions:r.conditions.filter(c=>c.rank==='master')})).filter(r=>r.conditions.length);
    }
   }
  }else if(e.game==='wilds'){
   url='https://wilds.mhdb.io/en/monsters';const source=wilds.find(x=>key(x.name)===key(e.name));if(!source)throw Error('Wilds record missing');
   const rewards=source.rewards.map(r=>({item:r.item.name,itemId:String(r.item.id),source:url,iconSource:wildIcons.get(key(r.item.name))||null,conditions:r.conditions.map(c=>({type:c.kind,rank:rank(c.rank),chance:c.chance,quantity:c.quantity,part:c.part}))}));data={rewards,ranks:[...new Set(rewards.flatMap(r=>r.conditions.map(c=>c.rank)).filter(Boolean))]};
  }else{
   url='https://github.com/gatheringhallstudios/MHGenDatabase';
   const source=guMonsters.find(x=>key(x.name)===key(e.name));
   if(!source){if(e.name==='Ahtal-Neset'){data={rewards:[],ranks:['master']};url='https://mhgu.kiranico.com/monster/'+e.id.replace('mhgu-','');}else throw Error('MHGU record missing: '+e.name);}
   else {const questRanks=db.prepare('SELECT DISTINCT q.rank FROM quests q JOIN monster_to_quest mq ON mq.quest_id=q._id WHERE mq.monster_id=?').all(source._id).map(x=>rank(x.rank)).filter(Boolean);
    const rows=db.prepare('SELECT i.name,i._id AS item_id,i.icon_name,i.icon_color,h.condition,h.rank,h.stack_size,h.percentage FROM hunting_rewards h JOIN items i ON i._id=h.item_id WHERE h.monster_id=?').all(source._id);
    const ranks=questRanks.length?questRanks:[...new Set(rows.map(r=>rank(r.rank)).filter(Boolean))];
    data={ranks,rewards:grouped(rows.filter(r=>ranks.includes(rank(r.rank))).map(r=>({item:r.name,itemId:String(r.item_id),iconSource:guIcons.get(r.icon_name)||null,iconColorId:r.icon_color,source:url,conditions:[{...method(r.condition),rank:rank(r.rank),quantity:r.stack_size,chance:r.percentage}]})))};
   }
  }
  if(!data.ranks.length)throw Error('No confirmed ranks');
  const oldRanks=e.ranks;const oldCount=e.rewards.length;const oldRankData=e.rankData||{};
  e.rewards=data.rewards;e.ranks=['low','high','master'].filter(r=>data.ranks.includes(r));
  e.rankData=Object.fromEntries(e.ranks.map(r=>[r,{rewards:data.rewards.map(x=>({...x,conditions:x.conditions.filter(c=>c.rank===r)})).filter(x=>x.conditions.length),healthProfiles:oldRankData[r]?.healthProfiles||[]} ]));
  e.rewardAudit={source:url,sources:[...new Set(data.rewards.map(reward=>reward.source).filter(Boolean))],checkedAt:report.checkedAt,ranks:e.ranks,method:e.game==='mhgu'?'quest rank and hunting_rewards join':'explicit reward rank sections'};
  e.availability.rewards=e.rewards.length>0;
  report.entries.push({id:e.id,name:e.name,game:e.game,source:url,oldRanks,ranks:e.ranks,oldItems:oldCount,items:e.rewards.length,conditions:e.rewards.reduce((n,r)=>n+r.conditions.length,0),missingIcons:e.rewards.filter(r=>!r.iconSource).map(r=>r.item)});
 }catch(error){report.failures.push({id:e.id,name:e.name,error:error.message});}completed++;if(completed%25===0)console.log('Revalidated '+completed+'/'+catalog.entries.length);}}));
 // Store the audit before downloading any icons or replacing the catalog.
 fs.writeFileSync(path.join(cache,'report.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(cache,'candidate.json'),JSON.stringify(catalog,null,2));
 console.log(JSON.stringify({checked:report.entries.length,failures:report.failures,missingIcons:report.entries.filter(e=>e.missingIcons.length).map(e=>({id:e.id,count:e.missingIcons.length}))}));
 if(report.failures.length){process.exitCode=1;return;}
 if(process.argv.includes('--apply')){
  const assetDir=path.join(root,'src/assets/item-icons');fs.mkdirSync(assetDir,{recursive:true});
  const sources=[...new Set(catalog.entries.flatMap(e=>e.rewards.map(r=>r.iconSource).filter(Boolean)))];
  const iconMap=new Map(),errors=[],pending=[...sources];let done=0;
  await Promise.all(Array.from({length:12},async()=>{while(pending.length){const source=pending.shift();try{
   const bytes=await get(source,true);
   const ext=source.match(/\.(png|webp|svg)(?:\?|$)/i)?.[1]?.toLowerCase()||'png';
   const valid=ext==='svg'?bytes.toString('utf8',0,150).includes('<svg'):ext==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString('ascii',0,4)==='RIFF';
   if(!valid)throw Error('Invalid '+ext+' image');
   const file=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,20)+'.'+ext;
   fs.writeFileSync(path.join(assetDir,file),bytes);
   iconMap.set(source,'assets/item-icons/'+file);
  }catch(error){errors.push({source,error:error.message});}done++;if(done%100===0)console.log('Icons '+done+'/'+sources.length);}}));
  if(errors.length){fs.writeFileSync(path.join(cache,'icon-errors.json'),JSON.stringify(errors,null,2));console.error('Icon download failures:',errors.length);process.exitCode=1;return;}
  for(const e of catalog.entries){for(const reward of e.rewards)reward.iconAsset=iconMap.get(reward.iconSource)||null;
   for(const r of e.ranks)for(const reward of e.rankData[r].rewards)reward.iconAsset=iconMap.get(reward.iconSource)||null;
  }
  const overlay=Object.fromEntries(catalog.entries.map(e=>[e.id,{name:e.name,game:e.game,ranks:e.ranks,rewards:e.rewards,rewardAudit:e.rewardAudit}]));
  fs.writeFileSync(path.join(root,'src/data/reward-audit.v1.json'),JSON.stringify({schema:'reward-audit.v1',checkedAt:report.checkedAt,entries:overlay},null,2)+'\n');
  const json=path.join(root,'src/data/monster-catalog.v1.json');
  fs.writeFileSync(json,JSON.stringify(catalog,null,2)+'\n');
  fs.writeFileSync(path.join(root,'src/data/monster-catalog.v1.js'),'window.monsterCatalog = '+JSON.stringify(catalog)+';\n');
  console.log('Applied verified rewards and '+new Set(iconMap.values()).size+' local game icons.');
 }
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={clean,rank,worldRewards,riseRewards,grouped,get};
