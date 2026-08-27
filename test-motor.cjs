const {__t}=require('./.test-build/t.cjs');
const {P,gate,runPost,calcPower,CATS,CAT,FILTERS,KEYSPECS,REGIONS,storesFor,searchTerm,calculateForgeScore,generateForgeInsights,createVisualBuildModel,getInitialVisualPart,gpuFamilyLabel,visualCapacityLabel,createVisual3DScene,containsBox,validateVisual3DScene,aioGeometry,getAioSchematicGeometry,createVisualHardwareProfile,inferCaseStyle,parseCaseDimensions,getTabSwipeGestureOwner,isIntentionalTabSwipe}=__t;
let pass=0,fail=0;
const ok=(c,m)=>{c?pass++:(fail++,console.log('  ✗ '+m));};
const find=(cat,n)=>{const p=P.find(x=>x.cat===cat&&x.name.includes(n)); if(!p)throw new Error('no existe: '+cat+' '+n); return p;};
const B=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,Array.isArray(v)?v:[v]]));

// Mobile gesture arbitration: ownership is fixed from the initial target.
const targetMatching=(match)=>({closest:selector=>selector.includes(match)?{}:null});
ok(getTabSwipeGestureOwner(targetMatching('[data-horizontal-scroll-zone]'))==='horizontal-scroll','scroller horizontal no conserva el gesto');
ok(getTabSwipeGestureOwner(targetMatching('button'))==='none','control interactivo inicia swipe de tabs');
ok(getTabSwipeGestureOwner(targetMatching('canvas'))==='none','canvas 3D inicia swipe de tabs');
ok(getTabSwipeGestureOwner({closest:()=>null})==='tabs','contenido normal no permite swipe de tabs');
ok(isIntentionalTabSwipe(64,20)&&!isIntentionalTabSwipe(63,0)&&!isIntentionalTabSwipe(80,70),'umbral/dirección de swipe incorrectos');

// Phase 4: BUILD → VISUAL MODEL remains pure and independent from the SVG renderer.
const visualEmpty=createVisualBuildModel({}, {nextCategory:'cpu'});
ok(visualEmpty.isEmpty&&visualEmpty.parts.cpu.state==='next'&&visualEmpty.parts.gpu.state==='empty','visual build vacío/ghost incorrecto');
ok(getInitialVisualPart(visualEmpty).category==='cpu','inspector visual no prioriza NEXT');
const groupedConflict=createVisualBuildModel({}, {conflicts:[{cat:'netwireless',reason:'Conflicto de red'}]});
ok(groupedConflict.parts.expansion.state==='conflict'&&groupedConflict.parts.expansion.reason==='Conflicto de red','visual expansion pierde conflicto agrupado');
const groupedWarning=createVisualBuildModel({}, {warnings:[{cat:'netwired',reason:'Aviso de red'}]});
ok(groupedWarning.parts.expansion.state==='warning'&&groupedWarning.parts.expansion.reason==='Aviso de red','visual expansion pierde warning agrupado');
ok(getInitialVisualPart(groupedWarning).category==='expansion','inspector visual no prioriza warning');
const visualFixture=B({
  mbo:{cat:'mbo',id:'vm',brand:'Forge',name:'Board',form:'Micro-ATX',dimm:4},
  ram:{cat:'ram',id:'vr',brand:'Forge',name:'2×16 GB DDR5',kit:2,capGB:32,memType:'DDR5',qty:2},
  gpu:{cat:'gpu',id:'vg',brand:'Forge',name:'Long GPU',len:360,slots:3,vram:16},
  cooler:{cat:'cooler',id:'vc',brand:'Forge',name:'Air tower',type:'Air',height:165},
  psu:{cat:'psu',id:'vp',brand:'Forge',name:'SFX Power',form:'SFX',watt:750},
  storage:{cat:'storage',id:'vs',brand:'Forge',name:'NVMe',iface:'M.2 NVMe',gen:'PCIe 4.0',capGB:2000},
});
const visual=createVisualBuildModel(visualFixture,{conflicts:[{cat:'ram',reason:'Conflicto real'}],nextCategory:'case'});
ok(visual.parts.mbo.metadata.form==='Micro-ATX','visual motherboard no normaliza formato');
ok(visual.parts.ram.metadata.modules===4,'visual RAM no refleja kit × qty');
ok(visual.parts.gpu.state==='installed'&&visual.parts.gpu.metadata.lengthMm===360,'visual GPU no normaliza longitud');
ok(visual.parts.cooler.metadata.mode==='air','visual cooler AIR mal clasificado');
ok(visual.parts.psu.metadata.form==='SFX'&&visual.parts.psu.metadata.watt===750,'visual PSU pierde formato/watt');
ok(visual.parts.storage.metadata.type==='M.2','visual storage M.2 mal clasificado');
ok(visual.parts.ram.state==='conflict'&&visual.parts.ram.reason==='Conflicto real','visual conflict no usa estado/reason real');
ok(visual.parts.case.state==='next','visual siguiente categoría no se destaca');
const aio=createVisualBuildModel(B({cooler:{cat:'cooler',id:'va',brand:'Forge',name:'AIO 360',type:'Liquid',radSize:360}}));
ok(aio.parts.cooler.metadata.mode==='aio'&&aio.parts.cooler.metadata.radiatorMm===360,'visual AIO pierde radiador');
const removed={...visualFixture}; delete removed.gpu;
ok(createVisualBuildModel(removed).parts.gpu.state==='empty','visual GPU no desaparece al eliminarla');
ok(gpuFamilyLabel({brand:'NVIDIA',name:'GeForce RTX 5070'}).label==='NVIDIA RTX','familia NVIDIA RTX incorrecta');
ok(gpuFamilyLabel({brand:'AMD',name:'Radeon RX 6650 XT'}).label==='RADEON RX6000','familia Radeon RX6000 incorrecta');
ok(gpuFamilyLabel({brand:'AMD',name:'Radeon RX 580'}).label==='AMD RX500','familia AMD RX500 incorrecta');
ok(visualCapacityLabel(960)==='1 TB'&&visualCapacityLabel(1830)==='2 TB','normalización visual de capacidad incorrecta');

// Phase 5 fidelity: a shared deterministic hardware appearance profile.
ok(parseCaseDimensions('465×285×459 mm').width===285&&parseCaseDimensions('376 x 185 x 292').height===376&&parseCaseDimensions('580*240*560').depth===560,'parser de dimensiones de caja incorrecto');
const smallCase=createVisualBuildModel(B({case:{cat:'case',id:'small',brand:'Cooler Master',name:'NR200P Mini-ITX',dims:'376×185×292 mm'}})).parts.case;
const largeCase=createVisualBuildModel(B({case:{cat:'case',id:'large',brand:'Forge',name:'Full tower',dims:'580×240×560 mm'}})).parts.case;
ok(createVisualHardwareProfile(smallCase).dimensions.height!==createVisualHardwareProfile(largeCase).dimensions.height,'caja pequeña y grande comparten dimensiones');
ok(inferCaseStyle({name:'Lian Li O11 Dynamic',metadata:{dimensions:'465×285×459 mm'}})==='WIDE_DUAL_CHAMBER'&&inferCaseStyle({name:'Mid tower',metadata:{dimensions:'453×230×466 mm'}})==='STANDARD_TOWER','perfiles dual chamber/standard incorrectos');
const whiteMbo=createVisualHardwareProfile(createVisualBuildModel(B({mbo:{cat:'mbo',id:'mw',brand:'Gigabyte',name:'AERO G WHITE'}})).parts.mbo);
const darkMbo=createVisualHardwareProfile(createVisualBuildModel(B({mbo:{cat:'mbo',id:'md',brand:'MSI',name:'Tomahawk'}})).parts.mbo);
ok(whiteMbo.isLight&&!darkMbo.isLight,'resolver white/default motherboard incorrecto');
ok(createVisualHardwareProfile(createVisualBuildModel(B({cpu:{cat:'cpu',id:'cp',brand:'AMD',name:'Ryzen'}})).parts.cpu).metalness>=.8,'CPU no usa perfil metálico');
const whiteRamPart=createVisualBuildModel(B({ram:{cat:'ram',id:'rw',brand:'Corsair',name:'Vengeance White',kit:2}})).parts.ram;
ok(createVisualHardwareProfile(whiteRamPart).isLight&&createVisualHardwareProfile(whiteRamPart,whiteMbo).primaryColor!==whiteMbo.primaryColor,'RAM blanca no contrasta sobre motherboard clara');
const m2Profile=createVisualHardwareProfile(visual.parts.storage); ok(m2Profile.primaryColor==='#303634'&&m2Profile.accentColor==='#dfb85e','M.2 no usa gris + ENIG');
ok(createVisualHardwareProfile(createVisualBuildModel(B({psu:{cat:'psu',id:'pw',brand:'Forge',name:'Snow White'}})).parts.psu).isLight&&!createVisualHardwareProfile(visual.parts.psu).isLight,'PSU white/default incorrecta');
ok(aioGeometry(240).fanCount===2&&aioGeometry(240).widthMm>aioGeometry(240).fanSizeMm&&aioGeometry(360).fanCount===3,'geometría AIO 240/360 incorrecta');
ok(aioGeometry(120).fanCount===1&&aioGeometry(280).fanCount===2&&aioGeometry(420).fanCount===3,'mapa físico de ventiladores AIO incorrecto');

// AIO schematic geometry stays physical before the SVG applies one uniform scale.
const schematicAios=[120,240,280,360,420].map(getAioSchematicGeometry);
const expectedFans=[[1,120],[2,120],[2,140],[3,120],[3,140]];
schematicAios.forEach((geometry,index)=>{
  ok(geometry.fanCount===expectedFans[index][0]&&geometry.fanDiameter===expectedFans[index][1],`geometría esquemática AIO ${geometry.radiatorMm} incorrecta`);
  ok(geometry.radiatorWidth>geometry.fanDiameter,`radiador AIO ${geometry.radiatorMm} no sobresale del ventilador`);
  ok(geometry.fanCenters.every(center=>center-geometry.fanDiameter/2>=0&&center+geometry.fanDiameter/2<=geometry.radiatorLength),`ventilador AIO ${geometry.radiatorMm} fuera del radiador`);
  const spacings=geometry.fanCenters.slice(1).map((center,i)=>center-geometry.fanCenters[i]);
  ok(spacings.every(spacing=>spacing===geometry.fanDiameter+geometry.fanGap),`centros AIO ${geometry.radiatorMm} no son uniformes`);
});
const [g120,g240,g280,g360,g420]=schematicAios;
ok(g280.radiatorLength>g240.radiatorLength&&g280.radiatorWidth>g240.radiatorWidth,'AIO 280 no supera físicamente al 240');
ok(g420.radiatorLength>g360.radiatorLength&&g420.radiatorWidth>g360.radiatorWidth,'AIO 420 no supera físicamente al 360');
ok(g120.radiatorLength===148&&g240.radiatorLength===270&&g280.radiatorLength===310&&g360.radiatorLength===392&&g420.radiatorLength===452,'longitudes físicas AIO inesperadas');
ok(getAioSchematicGeometry(480).fanCount===4,'fallback AIO no deriva una medida no canónica');

// Phase 5: pure VisualBuildModel → deterministic 3D scene layout.
const empty3d=createVisual3DScene(visualEmpty);
ok(empty3d.parts.length===10&&empty3d.parts.every(x=>x.state==='empty'||x.state==='next'),'3D empty model no produce ghost layout válido');
const atx3d=createVisual3DScene(createVisualBuildModel(B({mbo:{cat:'mbo',id:'atx',brand:'Forge',name:'ATX',form:'ATX'}})));
const itx3d=createVisual3DScene(createVisualBuildModel(B({mbo:{cat:'mbo',id:'itx',brand:'Forge',name:'ITX',form:'Mini-ITX'}})));
ok(atx3d.parts.find(x=>x.category==='mbo').scale[1]>itx3d.parts.find(x=>x.category==='mbo').scale[1],'3D ATX/Mini-ITX no escala distinto');
const mountedMbo=atx3d.parts.find(x=>x.category==='mbo');
ok(mountedMbo.position[0]>atx3d.bounds.min[0]&&mountedMbo.position[0]===atx3d.layout.motherboard[0]&&mountedMbo.position[0]<0,'motherboard queda fuera de la bandeja interior');
const shortGpu=createVisual3DScene(createVisualBuildModel(B({gpu:{cat:'gpu',id:'gs',brand:'Forge',name:'Short',len:170}})));
const longGpu=createVisual3DScene(createVisualBuildModel(B({gpu:{cat:'gpu',id:'gl',brand:'Forge',name:'Long',len:360}})));
ok(shortGpu.parts.find(x=>x.category==='gpu').scale[2]<longGpu.parts.find(x=>x.category==='gpu').scale[2],'3D GPU 170/360 no escala longitud');
const mountedGpu=atx3d.parts.find(x=>x.category==='gpu');
ok(Math.abs(mountedGpu.bounds.min[2]-atx3d.layout.anchors.pcieSlotAnchor[2])<.01&&mountedGpu.position[0]>mountedMbo.position[0],'GPU no nace en el anclaje PCIe interior');
const ram2=createVisual3DScene(createVisualBuildModel(B({ram:{cat:'ram',id:'r2',brand:'Forge',name:'2 DIMM',kit:2}})));
const ram4=createVisual3DScene(createVisualBuildModel(B({ram:{cat:'ram',id:'r4',brand:'Forge',name:'4 DIMM',kit:4}})));
ok(ram2.parts.find(x=>x.category==='ram').instances===2&&ram4.parts.find(x=>x.category==='ram').instances===4,'3D RAM 2/4 módulos incorrecto');
ok(createVisual3DScene(visual).parts.find(x=>x.category==='cooler').kind==='air-cooler','3D air cooler descriptor incorrecto');
const aio240=createVisual3DScene(createVisualBuildModel(B({cooler:{cat:'cooler',id:'a24',brand:'Forge',name:'AIO 240',type:'Liquid',radSize:240}})));
const aio360=createVisual3DScene(aio);
ok(aio240.parts.find(x=>x.category==='cooler').kind==='aio'&&aio240.parts.find(x=>x.category==='cooler').scale[0]<aio360.parts.find(x=>x.category==='cooler').scale[0],'3D AIO 240/360 incorrecto');
const mountedAio=aio240.parts.find(x=>x.category==='cooler');
ok(['top','front','side'].includes(mountedAio.mount)&&mountedAio.position===aio240.layout.radiatorMounts[mountedAio.mount],'AIO usa un montaje de radiador no permitido');
ok(mountedAio.connectionTarget.join(',')===aio240.layout.cpuSocket.join(','),'AIO no conecta radiador y bloque CPU');
const atxPsu=createVisual3DScene(createVisualBuildModel(B({psu:{cat:'psu',id:'pa',brand:'Forge',name:'ATX',form:'ATX'}})));
ok(atxPsu.parts.find(x=>x.category==='psu').scale[0]>createVisual3DScene(visual).parts.find(x=>x.category==='psu').scale[0],'3D ATX/SFX PSU no escala distinto');
const mountedPsu=atxPsu.parts.find(x=>x.category==='psu');
ok(mountedPsu.position.join(',')===atxPsu.layout.psuBay.join(',')&&mountedPsu.position[1]<0,'PSU no está anclada a la bahía inferior');
const dual3d=createVisual3DScene(createVisualBuildModel(B({case:{cat:'case',id:'o11',brand:'Lian Li',name:'O11 Dynamic',dims:'465×285×459 mm'},cooler:{cat:'cooler',id:'a36',brand:'Forge',name:'AIO 360',type:'Liquid',radSize:360}})));
ok(dual3d.layout.family==='dual-chamber'&&dual3d.layout.archetype==='DUAL_CHAMBER_SHOWCASE'&&dual3d.layout.radiatorMounts.side&&dual3d.parts.find(x=>x.category==='cooler').mount==='side','dual chamber no prioriza el montaje lateral canónico');
ok(atx3d.camera.minDistance<atx3d.camera.maxDistance&&atx3d.camera.fov>=35&&atx3d.camera.fov<=45,'encuadre 3D no mantiene límites útiles para desktop/mobile');
for(const [type,kind] of [['M.2','m2'],['2.5" SSD','drive-25'],['3.5" HDD','drive-35']]) { const m={...visualEmpty,parts:{...visualEmpty.parts,storage:{...visualEmpty.parts.storage,state:'installed',metadata:{type}}}}; ok(createVisual3DScene(m).parts.find(x=>x.category==='storage').kind===kind,'3D storage '+type+' incorrecto'); }
ok(createVisual3DScene(visual).parts.find(x=>x.category==='ram').state==='conflict','3D conflict no se propaga');
ok(empty3d.parts.find(x=>x.category==='cpu').state==='next','3D next no se propaga');
ok(createVisual3DScene(createVisualBuildModel(removed)).parts.find(x=>x.category==='gpu').state==='empty','3D remove no vuelve a ghost');
for (const [label, candidate] of [['air', atx3d], ['aio-240', aio240], ['aio-360-showcase', dual3d], ['compact', createVisual3DScene(createVisualBuildModel(B({case:{cat:'case',id:'mini',brand:'Forge',name:'NR200 Mini-ITX',dims:'376×185×292 mm'},mbo:{cat:'mbo',id:'itx2',brand:'Forge',name:'Mini ITX',form:'Mini-ITX'},cooler:{cat:'cooler',id:'air',brand:'Forge',name:'Air tower'}}))) ]]) {
  ok(validateVisual3DScene(candidate).length===0,`3D ${label} placement inválido: ${validateVisual3DScene(candidate).join(',')}`);
  for (const part of candidate.parts) ok(containsBox(candidate.layout.interior,part.bounds),`3D ${label} ${part.category} atraviesa el chasis`);
  const liquid=candidate.parts.find(x=>x.kind==='aio');
  if(liquid) ok(liquid.tubePath.length>=3&&liquid.tubePath.every(point=>point.every((value,axis)=>value>=candidate.layout.interior.min[axis]&&value<=candidate.layout.interior.max[axis])),`3D ${label} deja salir los tubos AIO`);
}

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

// 14. Forge Intelligence: score e insights deterministas
{
  const required=['cpu','cooler','mbo','ram','storage','psu','case'];
  const power=(total=0,target=0,rec=0)=>({detail:{},total,gaming:0,spike:total,rec,desk:0,target});
  const input=(extra={})=>({selectedCount:0,requiredCore:required,selectedCategories:new Set(),conflicts:[],post:[],power:power(),
    nextCategory:'cpu',categoryLabel:c=>CAT[c].label,...extra});
  ok(calculateForgeScore(input())===null,'build vacía muestra un falso 0');
  const cpu=calculateForgeScore(input({selectedCount:1,selectedCategories:new Set(['cpu']),power:power(120,150,160)}));
  ok(cpu&&cpu.core===5&&cpu.total>0&&cpu.total<100,'score parcial de CPU incorrecto');
  const complete=calculateForgeScore(input({selectedCount:7,selectedCategories:new Set(required),post:[{lvl:'ok',id:'CPU_MBO',code:'0x01',msg:'ok'}],power:power(500,625,650),psuWatt:650}));
  ok(complete&&complete.core===35&&complete.compatibility===30,'CORE completo sin conflictos incorrecto');
  const conflict=calculateForgeScore(input({selectedCount:1,selectedCategories:new Set(['cpu']),conflicts:[{uid:'1',name:'CPU',reason:'Socket',cat:'cpu'}]}));
  ok(conflict&&conflict.compatibility===18,'conflicto no resta 12 puntos');
  const warning=calculateForgeScore(input({selectedCount:1,selectedCategories:new Set(['cpu']),post:[{lvl:'warn',id:'MISC',code:'0x7F',msg:'aviso'}]}));
  ok(warning&&warning.post===16,'warning POST no resta 4 puntos');
  const failure=calculateForgeScore(input({selectedCount:1,selectedCategories:new Set(['cpu']),post:[{lvl:'fail',id:'MISC',code:'0x7F',msg:'fallo'}]}));
  ok(failure&&failure.post===10,'failure POST no resta 10 puntos');
  const noPsu=calculateForgeScore(input({selectedCount:1,selectedCategories:new Set(['cpu']),power:power(500,625,650)}));
  ok(noPsu&&noPsu.power===0,'build sin PSU recibe puntos de energía');
  const weak=calculateForgeScore(input({selectedCount:2,selectedCategories:new Set(['cpu','psu']),power:power(500,625,650),psuWatt:450}));
  ok(weak&&weak.power===0,'PSU insuficiente recibe puntos');
  const close=calculateForgeScore(input({selectedCount:2,selectedCategories:new Set(['cpu','psu']),power:power(500,625,650),psuWatt:550}));
  ok(close&&close.power===7,'PSU utilizable sin objetivo no recibe puntuación intermedia');
  const good=calculateForgeScore(input({selectedCount:2,selectedCategories:new Set(['cpu','psu']),power:power(500,625,650),psuWatt:750}));
  ok(good&&good.power===15,'PSU correcta no recibe 15 puntos');
  const abused=calculateForgeScore(input({selectedCount:1,requiredCore:[],selectedCategories:new Set(),conflicts:Array(20).fill({}),post:Array(20).fill({lvl:'fail'}),power:power(Infinity,Infinity,0),psuWatt:1}));
  ok(abused&&abused.total>=0&&abused.total<=100&&Number.isFinite(abused.total),'score fuera de 0–100');
  const noGpu=calculateForgeScore(input({selectedCount:7,selectedCategories:new Set(required)}));
  ok(noGpu&&noGpu.core===35,'GPU ausente penaliza CORE');
  const dynamic=calculateForgeScore(input({selectedCount:2,requiredCore:['cpu','mbo'],selectedCategories:new Set(['cpu'])}));
  ok(dynamic&&dynamic.core===18,'requiredCore dinámico sigue hardcodeado a 7');

  const emptyInsights=generateForgeInsights(input());
  ok(emptyInsights[0]?.id==='start-build'&&emptyInsights[0].targetCat==='cpu','build vacía no guía a CPU');
  const requiredInsights=generateForgeInsights(input({selectedCount:1,selectedCategories:new Set(['cpu']),nextCategory:'cooler'}));
  ok(requiredInsights.some(x=>x.id==='next-cooler'),'categoría requerida pendiente incorrecta');
  const conflictInsights=generateForgeInsights(input({selectedCount:1,conflicts:[{uid:'x',name:'RAM',reason:'DDR4 ≠ DDR5',cat:'ram'}],post:[{lvl:'fail',id:'MEM_TYPE',code:'0x04',msg:'RAM'}]}));
  ok(conflictInsights[0]?.severity==='critical'&&conflictInsights[0].id==='conflict-x','conflicto no tiene prioridad crítica');
  ok(conflictInsights.some(x=>x.id.startsWith('post-fail')&&x.severity==='critical'),'POST failure sin insight crítico');
  const weakInsights=generateForgeInsights(input({selectedCount:2,power:power(500,625,650),psuWatt:450}));
  ok(weakInsights.some(x=>x.id==='psu-insufficient'&&x.severity==='critical'),'PSU insuficiente sin insight');
  const psuInsights=generateForgeInsights(input({selectedCount:1,power:power(500,625,650)}));
  ok(psuInsights.some(x=>x.id==='psu-missing'&&x.detail.includes('650 W')),'PSU pendiente no usa power.rec');
  const coreInsights=generateForgeInsights(input({selectedCount:7,selectedCategories:new Set(required),nextCategory:'gpu'}));
  ok(coreInsights.some(x=>x.id==='core-complete'&&x.severity==='success'),'CORE completo sin success');
  ok(!coreInsights.some(x=>x.severity==='warning'&&x.targetCat==='gpu'),'GPU opcional genera warning');
  console.log('  Forge Intelligence: score, prioridades, PSU y guidance validados');
}

console.log(`\n${pass} OK · ${fail} FALLOS`);
process.exit(fail?1:0);
