const {__t}=require('./.test-build/t.cjs');
const {P,gate,runPost,calcPower,CATS,CAT,FILTERS,KEYSPECS,PLATFORM}=__t;
let bad=0; const err=m=>{bad++;console.log('  ✗ '+m);};
const of=c=>P.filter(p=>p.cat===c);
const B=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,(Array.isArray(v)?v:[v])]));

console.log('=== 1. Coherencia de plataformas ===');
const sockets=[...new Set(of('cpu').map(p=>p.socket))].filter(x=>x!=='DIP16');
for(const sk of sockets){
  const cpus=of('cpu').filter(p=>p.socket===sk);
  const mbos=of('mbo').filter(p=>p.socket===sk);
  const cool=of('cooler').filter(p=>p.sockets?.includes(sk));
  if(!mbos.length) err(`socket ${sk}: ${cpus.length} CPU pero 0 placas`);
  if(!cool.length) err(`socket ${sk}: sin ningún disipador compatible`);
  // la memoria que declara la CPU debe coincidir con la de sus placas
  const mboMem=[...new Set(mbos.map(m=>m.memType))];
  for(const c of cpus){
    if(!c.mem?.length) continue;
    if(!c.mem.some(m=>mboMem.includes(m)))
      err(`${c.name} (${sk}) pide ${c.mem} y sus placas dan ${mboMem}`);
    const decl=PLATFORM[sk]?.mem||[];
    if(decl.length && !c.mem.every(m=>decl.includes(m)))
      err(`${c.name}: mem ${c.mem} fuera de PLATFORM[${sk}]=${decl}`);
  }
  console.log(`  ${sk.padEnd(12)} ${String(cpus.length).padStart(2)} CPU · ${String(mbos.length).padStart(2)} placas · ${String(cool.length).padStart(2)} disipadores · ${mboMem.join("/")}`);
}

console.log('\n=== 2. Toda memoria de placa tiene módulos ===');
for(const mt of [...new Set(of('mbo').map(m=>m.memType))]){
  const n=of('ram').filter(r=>r.memType===mt).length;
  if(!n) err(`no hay módulos ${mt} para las placas que la usan`);
  else console.log(`  ${mt.padEnd(12)} ${n} kits`);
}

console.log('\n=== 3. Cada CPU puede montarse de verdad ===');
let sinMontaje=0;
for(const c of of('cpu')){
  if(c.socket==='DIP16'||c.museum) continue;
  const b1=B({cpu:c});
  const mbo=of('mbo').find(m=>!gate(m,b1).blocked);
  if(!mbo){ err(`${c.name}: ninguna placa compatible`); continue; }
  const b2=B({cpu:c,mbo});
  const cool=of('cooler').find(k=>!gate(k,b2).blocked);
  if(!cool){ err(`${c.name}: ningún disipador aguanta ${c.ppt||c.tdp} W en ${c.socket}`); sinMontaje++; continue; }
  const ram=of('ram').find(r=>!gate(r,B({cpu:c,mbo,cooler:cool})).blocked);
  if(!ram){ err(`${c.name} + ${mbo.name} + ${cool.name}: ninguna RAM compatible`); continue; }
  const b3=B({cpu:c,mbo,ram,cooler:cool});
  const cs=of('case').find(x=>!gate(x,b3).blocked);
  if(!cs){ err(`${c.name}: ninguna caja admite ${mbo.form} + ese disipador`); continue; }
  const gpu=c.igpu?null:of('gpu').find(g=>!gate(g,B({case:cs})).blocked);
  const b4=B({cpu:c,mbo,ram,cooler:cool,case:cs,storage:of('storage').find(s=>!gate(s,B({mbo}))?.blocked)});
  if(gpu) b4.gpu=[gpu];
  const pw=calcPower(b4);
  const psu=of('psu').find(u=>!gate(u,b4).blocked&&u.watt>=pw.rec&&(!gpu||!gpu.conn8||u.pcie8>=gpu.conn8+(gpu.conn6||0)));
  if(!psu){ err(`${c.name}: ninguna fuente de ${pw.rec} W entra en ${cs.name}`); continue; }
  const post=runPost({...b4,psu:[psu]},calcPower({...b4,psu:[psu]}));
  const f=post.filter(l=>l.lvl==='fail');
  if(f.length) err(`${c.name}: montaje automático con fallos -> ${f.map(x=>x.id+': '+x.msg).join(' | ')}`);
}
console.log(`  ${of('cpu').length-1} CPU comprobadas de extremo a extremo`);

console.log('\n=== 4. Gráficas: conectores y coherencia ===');
for(const g of of('gpu')){
  const n=(g.conn8||0)+(g.conn6||0);
  if(/Sin conector/.test(g.power) && n>0) err(`${g.name}: dice sin conector pero declara ${n}`);
  if(!/Sin conector/.test(g.power) && n===0 && !g.hpwr) err(`${g.name}: declara "${g.power}" pero 0 conectores`);
  if(g.tbp>75 && n===0 && !g.hpwr) err(`${g.name}: ${g.tbp} W sin conector (la ranura da 75 W)`);
  // una tarjeta de 75 W puede llevar conector por margen (Arc A380): no es error
  if(g.psuMin<g.tbp) err(`${g.name}: fuente mínima ${g.psuMin} < TBP ${g.tbp}`);
  if(!g.len||!g.slots||!g.vram) err(`${g.name}: faltan cotas`);
}
// una fuente sin 12V-2x6 debe avisar, no fallar, con una tarjeta hpwr
const hp=of('gpu').find(g=>g.hpwr), old=of('psu').find(u=>u.pcie5===0&&u.watt>=1000);
const lg=runPost(B({gpu:hp,psu:old}),calcPower(B({gpu:hp,psu:old})));
if(!lg.some(l=>l.id==='PSU_CONN'&&l.lvl==='warn')) err('fuente sin 12V-2×6 + tarjeta hpwr: no avisa');
// GT 710 en fuente pequeña: debe pasar limpio
const gt=of('gpu').find(g=>g.name.includes('GT 710'));
const l2=runPost(B({gpu:gt,psu:of('psu').find(u=>u.watt===500)}),calcPower(B({gpu:gt,psu:of('psu').find(u=>u.watt===500)})));
if(l2.some(l=>l.lvl==='fail')) err('GT 710 marcada como incompatible: '+JSON.stringify(l2.filter(l=>l.lvl==='fail')));
console.log(`  ${of('gpu').length} gráficas · conectores y potencias coherentes`);

console.log('\n=== 5. Integridad de campos y filtros ===');
for(const c of CATS){
  const items=of(c.id);
  for(const p of items){
    if(!p.brand||!p.name) err(`pieza sin marca/nombre en ${c.id}`);
    if(typeof p.price!=='number') err(`${p.name}: precio no numérico`);
    const ks=KEYSPECS[c.id](p);
    if(ks.some(x=>/undefined|NaN|null/.test(String(x)))) err(`${p.name}: specs rotas -> ${ks.join('|')}`);
  }
  for(const f of FILTERS[c.id]) if(!items.some(p=>p[f.k]!==undefined)) err(`filtro huérfano ${c.id}.${f.k}`);
}
// ids únicos
if(new Set(P.map(p=>p.id)).size!==P.length) err('ids duplicados');
// nombres duplicados dentro de categoría
for(const c of CATS){ const n=of(c.id).map(p=>p.brand+' '+p.name);
  const d=n.filter((x,i)=>n.indexOf(x)!==i); if(d.length) err(`duplicados en ${c.id}: ${[...new Set(d)]}`); }

console.log('\n=== 6. Cruces que no deben colarse ===');
const T=[
 ['Intel en placa AM5', 'cpu','14900K',{mbo:'B650 Tomahawk'},true],
 ['AMD en placa LGA1700','cpu','9800X3D',{mbo:'B760 Tomahawk'},true],
 ['LGA1151 en placa LGA1151v2','cpu','6700K',{mbo:'Z390'},true],
 ['LGA1151v2 en placa LGA1151','cpu','9700K',{mbo:'MAXIMUS VIII'},true],
 ['DDR3 en placa DDR4','ram','1600 CL9',{mbo:'B550 AORUS'},true],
 ['DDR4 en placa DDR3','ram','Ripjaws V 16 GB',{mbo:'Z97X'},true],
 ['DDR2 en placa DDR3','ram','XMS2',{mbo:'Z97X'},true],
 ['RAM de 44 mm bajo NH-D15 (con margen)','ram','Trident Z5 Neo',{cooler:'NH-D15 G2'},false],
 ['RAM de 33 mm: sube el ventilador','ram','Flare X5',{cooler:'NH-D15 G2'},false],
 ['RAM de 55 mm bajo NH-D15','ram','Dominator',{cooler:'NH-D15 G2'},false],
 ['RAM 55 mm + NH-D15 en caja de 170 mm','ram','Dominator',{cooler:'NH-D15 chromax',case:'North'},true],
 ['DDR5 en placa DDR4','ram','6000 CL30',{mbo:'B550 AORUS'},true],
 ['RDIMM en placa normal','ram','RDIMM 5600',{mbo:'B650 Tomahawk'},true],
 ['Disipador AM4 en LGA1155','cooler','Wraith Prism',{cpu:'i5-2500K'},true],
 ['Disipador universal en LGA1155','cooler','Hyper 212',{cpu:'i5-2500K'},false],
 ['AIO 420 en caja de 240','cooler','Freezer III Pro 420',{case:'4000D'},true],
 ['ROG Astral 5090 (358 mm) en ITX','gpu','ROG Astral',{case:'NR200P'},true],
 ['RTX 5090 FE (304 mm) en ITX','gpu','5090 Founders',{case:'NR200P'},false],
 ['GT 1030 en caja ITX','gpu','GT 1030',{case:'NR200P'},false],
 ['Fuente ATX en Ridge (SFX)','psu','RM1000x',{case:'Ridge'},true],
 ['Fuente SFX en Ridge','psu','SF750',{case:'Ridge'},false],
];
const F=(c,n)=>{const p=P.find(x=>x.cat===c&&(x.name.includes(n)||x.brand.includes(n))); if(!p)throw new Error(c+' '+n); return p;};
for(const [label,cat,name,ctx,shouldBlock] of T){
  const b=B(Object.fromEntries(Object.entries(ctx).map(([k,v])=>[k,F(k,v)])));
  const r=gate(F(cat,name),b);
  if(!!r.blocked!==shouldBlock) err(`${label}: esperaba ${shouldBlock?'bloqueo':'compatible'}, dio ${r.blocked?'bloqueo ('+r.reason+')':'compatible'}`);
  else console.log(`  ✓ ${label}${r.reason?' — '+r.reason:''}`);
}
console.log(bad?`\n✗ ${bad} PROBLEMAS`:'\n✓ CATÁLOGO ÍNTEGRO — 0 problemas');
process.exit(bad?1:0);
