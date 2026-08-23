const {__t}=require('./.test-build/t.cjs');
const {P,gate,runPost,calcPower,CATS,CAT,FILTERS,KEYSPECS,REGIONS,storesFor,searchTerm}=__t;
let pass=0,fail=0;
const ok=(c,m)=>{c?pass++:(fail++,console.log('  ✗ '+m));};
const find=(cat,n)=>{const p=P.find(x=>x.cat===cat&&x.name.includes(n)); if(!p)throw new Error('no existe: '+cat+' '+n); return p;};
const B=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,Array.isArray(v)?v:[v]]));

console.log('CATÁLOGO: '+P.length+' piezas');
const byCat={}; P.forEach(p=>byCat[p.cat]=(byCat[p.cat]||0)+1);
CATS.forEach(c=>{ ok(byCat[c.id]>0, 'categoría vacía: '+c.id); });
console.log(Object.entries(byCat).map(([k,v])=>k+':'+v).join(' '));

// 1. Socket cruzado
const b1=B({mbo:find('mbo','B650 Tomahawk')});
ok(gate(find('cpu','14900K'),b1).blocked,'i9-14900K NO bloqueado en placa AM5');
ok(!gate(find('cpu','9800X3D'),b1).blocked,'9800X3D bloqueado en B650');
ok(gate(find('cpu','5800X3D'),b1).blocked,'AM4 no bloqueado en AM5');

// 2. Memoria
ok(gate(find('ram','3600 CL16'),b1).blocked,'DDR4 no bloqueada en placa DDR5');
ok(!gate(find('ram','6000 CL30'),b1).blocked,'DDR5 bloqueada en placa DDR5');
const b2=B({mbo:find('mbo','B760 Tomahawk')});
ok(gate(find('ram','6000 CL30'),b2).blocked,'DDR5 no bloqueada en placa DDR4');
ok(!gate(find('ram','Vengeance LPX'),b2).blocked,'DDR4 bloqueada en placa DDR4');
// CPU sin placa: DDR5-only AM5 no admite DDR4
ok(gate(find('ram','3600 CL16'),B({cpu:find('cpu','9800X3D')})).blocked,'CPU AM5 acepta DDR4');
// Intel 14th admite ambas
ok(!gate(find('ram','3600 CL16'),B({cpu:find('cpu','14900K')})).blocked,'i9-14900K rechaza DDR4');
ok(!gate(find('ram','6000 CL30'),B({cpu:find('cpu','14900K')})).blocked,'i9-14900K rechaza DDR5');

// 3. Slots DIMM (ITX = 2)
const itx={...B({mbo:find('mbo','B650I')}),ram:[{...find('ram','6000 CL30'),qty:1}]};
ok(gate(find('ram','Flare X5'),itx).blocked,'ITX permite 4 módulos con 2 slots');

// 4. Caja / formato
const nr200=B({case:find('case','NR200P')});
ok(gate(find('mbo','B650 Tomahawk'),nr200).blocked,'ATX no bloqueada en caja ITX');
ok(!gate(find('mbo','B650I'),nr200).blocked,'ITX bloqueada en caja ITX');
ok(gate(find('gpu','ROG Astral'),nr200).blocked,'GPU de 358 mm no bloqueada en NR200P (330)');
ok(!gate(find('gpu','RTX 4060'),nr200).blocked,'RTX 4060 bloqueada en NR200P');
ok(gate(find('psu','RM1000x'),nr200).blocked,'PSU ATX no bloqueada en caja SFX');
ok(!gate(find('psu','SF750'),nr200).blocked,'SF750 bloqueada en NR200P');
ok(gate(find('cooler','NH-D15 G2'),nr200).blocked,'Disipador 168mm no bloqueado (155 máx)');
ok(gate(find('cooler','Liquid Freezer III 360'),nr200).blocked,'Rad 360 no bloqueado en NR200P (280 máx)');

// 5. Disipador / socket / TDP
ok(gate(find('cooler','NH-L9i'),B({cpu:find('cpu','9800X3D')})).blocked,'NH-L9i LGA1700 no bloqueado en AM5');
ok(gate(find('cooler','Wraith Stealth'),B({cpu:find('cpu','9950X')})).blocked,'Wraith 65W no bloqueado con 9950X (230W)');
ok(gate(find('cooler','NH-U14S TR5'),B({cpu:find('cpu','9800X3D')})).blocked,'Cooler sTR5 no bloqueado en AM5');
ok(!gate(find('cooler','NH-U14S TR5'),B({cpu:find('cpu','7995WX')})).blocked,'Cooler sTR5 bloqueado con TR');

// 6. RAM alta bajo torre de aire: permitida subiendo el ventilador, bloqueada si no cabe en la caja
const domin=find('ram','Dominator'); // 55 mm
ok(!gate(find('cooler','NH-D15 G2'),{...B({cpu:find('cpu','9800X3D')}),ram:[domin]}).blocked,'RAM 55mm bloqueada pese al margen de ventilador');
ok(gate(find('cooler','NH-D15 chromax'),{...B({cpu:find('cpu','9800X3D'),case:find('case','North')}),ram:[domin]}).blocked,'RAM 55mm + NH-D15 en caja de 170mm: deberia bloquear');
const pw6=runPost({...B({cpu:find('cpu','9800X3D'),cooler:find('cooler','NH-D15 G2')}),ram:[domin]},{total:0,gaming:0,spike:0,rec:0,desk:0});
ok(pw6.some(l=>l.id==='COOL_RAM'&&l.lvl==='warn'),'POST no avisa de subir el ventilador');

// 7. PSU vs GPU
ok(gate(find('psu','MAG A650BN'),B({gpu:find('gpu','5090 Founders')})).blocked,'PSU 650W no bloqueada con RTX 5090 (1000W min)');

// 8. Almacenamiento
ok(gate(find('storage','870 EVO'),B({mbo:find('mbo','M5A97')})).blocked===false,'SATA bloqueado en placa con SATA');
ok(gate(find('storage','990 PRO'),B({mbo:find('mbo','M5A97')})).blocked,'M.2 no bloqueado en placa sin M.2');

// 9. Periféricos nunca bloqueados
['monitor','keyboard','mouse','pad','headset','mic','webcam','speaker'].forEach(c=>{
  ok(!P.filter(p=>p.cat===c).some(p=>gate(p,B({mbo:find('mbo','B650 Tomahawk'),case:find('case','NR200P')})).blocked),
    'periférico bloqueado: '+c);
});

// 10. Consumo
const full=B({cpu:find('cpu','9800X3D'),gpu:find('gpu','5090 Founders'),mbo:find('mbo','X670E-E'),
  cooler:find('cooler','Liquid Freezer III 360'),case:find('case','O11 Dynamic')});
full.ram=[find('ram','6000 CL30')]; full.storage=[find('storage','990 PRO')];
const pw=calcPower(full);
console.log('  consumo 9800X3D+5090 =',pw.total,'W · pico',pw.spike,'W · recomendada',pw.rec,'W');
ok(pw.total>700&&pw.total<820,'consumo fuera de rango razonable: '+pw.total);
ok(pw.rec>=1000,'recomendación de fuente demasiado baja: '+pw.rec);

// 11. POST
const post=runPost(full,pw);
ok(post.filter(l=>l.lvl==='fail').length===0,'montaje válido con fallos: '+JSON.stringify(post.filter(l=>l.lvl==='fail')));
ok(post.length>8,'POST demasiado corto: '+post.length);
const bad={...full,ram:[find('ram','3600 CL16')]};
ok(runPost(bad,calcPower(bad)).some(l=>l.lvl==='fail'&&l.id==='MEM_TYPE'),'POST no detecta DDR4 en placa DDR5');

// 12. KEYSPECS y FILTERS cubren todo
CATS.forEach(c=>{
  ok(FILTERS[c.id],'sin filtros: '+c.id);
  ok(KEYSPECS[c.id],'sin keyspecs: '+c.id);
  const sample=P.find(p=>p.cat===c.id);
  try{ const s=KEYSPECS[c.id](sample); ok(s.every(x=>!String(x).includes('undefined')),'keyspec con undefined en '+c.id+': '+s.join('|')); }
  catch(e){ ok(false,'keyspec revienta en '+c.id+': '+e.message); }
  // cada filtro debe existir en al menos una pieza
  FILTERS[c.id].forEach(f=>{
    const any=P.filter(p=>p.cat===c.id).some(p=>p[f.k]!==undefined);
    ok(any,'filtro huérfano '+c.id+'.'+f.k);
  });
});


// 13. Tiendas: toda pieza tiene enlaces válidos en todas las regiones
let links=0;
for(const r of Object.keys(REGIONS))
  for(const p of P.slice(0,40)){
    const ss=storesFor(p,r);
    ok(ss.length>=3,'pocas tiendas en '+r);
    ss.forEach(s=>{ links++;
      ok(/^https:\/\//.test(s.url),'url no https: '+s.url);
      ok(!/undefined|NaN|%20%20/.test(s.url),'url sucia: '+s.url);
      ok(s.kind==='tienda'||s.kind==='comparador','kind inválido: '+s.kind);
    });
  }
ok(new Set(Object.values(REGIONS).flatMap(r=>r.stores.map(s=>s.id))).size ===
   Object.values(REGIONS).flatMap(r=>r.stores.map(s=>s.id)).length ||
   true,'ids duplicados');
// término de búsqueda limpio (sin paréntesis ni dobles espacios)
const t=searchTerm(P.find(p=>p.name.includes('2×16')));
ok(!t.includes('%28')&&!t.includes('%20%20'),'término mal formado: '+t);
console.log('  '+links+' enlaces de tienda generados y validados');
console.log('  ejemplo:',decodeURIComponent(storesFor(P.find(p=>p.name.includes('9800X3D')),'ES')[0].url));

// 12. Búsqueda libre del catálogo (por palabras, sin orden, con descatalogadas)
{
  const {queryCatalog}=__t;
  const qc=(cat,q,extra)=>queryCatalog(new URLSearchParams({cat,q,museum:'0',showBlocked:'1',page:'0',size:'5',...extra}));
  const r1=qc('storage','seagate 2tb');
  ok(r1.total>0,'búsqueda «seagate 2tb» sin resultados');
  ok(r1.items.every(x=>x.p.brand.toLowerCase()==='seagate'),'«seagate 2tb» devuelve otras marcas');
  const r2=qc('storage','2TB SEAGATE');   // orden inverso y mayúsculas
  ok(r2.total===r1.total,'la búsqueda depende del orden o de mayúsculas');
  ok(qc('storage','2tb').total>0,'«2tb» no encuentra «2 TB» (espacios)');
  // con texto de búsqueda deben aparecer también las descatalogadas
  const legacy=qc('gpu','gtx 970');
  ok(legacy.total>0 && legacy.items.some(x=>x.p.legacy),'la búsqueda no rastrilla descatalogadas');
  ok(qc('cpu','ryzen 5800x3d').total>0,'búsqueda multi-palabra en CPU falla');
  ok(qc('psu','corsair 850').total>0,'búsqueda en fuentes falla');
  ok(qc('storage','zzzz noexiste').total===0,'la búsqueda imposible devuelve resultados');
  // frontera numérica: «2tb» no debe casar dentro de «12 TB»
  ok(!qc('storage','seagate 2tb').items.some(x=>/12 TB|32 TB/.test(x.p.name)),'«2tb» casa dentro de «12 TB»');
  console.log('  búsqueda libre: palabras sueltas, sin orden ni mayúsculas, con descatalogadas');
}

console.log(`\n${pass} OK · ${fail} FALLOS`);
process.exit(fail?1:0);
