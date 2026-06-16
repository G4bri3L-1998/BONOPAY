import { supabase } from './supabase.js'

// ── HELPERS ──
const $=id=>document.getElementById(id)
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CL')
const pc=(a,b)=>b===0?0:Math.abs(a-b)/b*100
const MAX={tn:25,td:8,fe:15,am:5}

const CARGOS={
  PMC:['CHOQUERO','CONDUCTOR PROF','EMBARCADOR','PATERO','AY. DE CHOFER','SUPERVISOR','PORTALONERO','RECEPCIONISTA DE CARGA','RECEPCIONISTA DE CARGA Y CONTROL DE SINIESTROS','ASISTENTE DOCUMENTAL'],
  UCO:['JEFE TERMINAL UCO','AGENCIA UCO','SUPERVISOR UCO'],
  NAT:['JEFE DE TERMINAL NAT','AGENCIA NAT','JEFE DE TURNO','TRACTORISTA NAT','EMBARCADOR']
}

const REAL={
  Marzo_2026:{1:135168,2:384568,3:386568,4:161568,5:370068,6:463769,7:334801,8:410468,9:468801,10:330301,11:434369,12:313296,13:135168,14:418096,15:444497,16:448497,17:378068,19:126720,20:126720,21:104400,22:179400,24:60000,25:225000,26:215000,27:225000},
  Abril_2026:{1:130944,2:416568,3:414568,4:130944,5:431469,6:411568,7:392701,8:419068,9:391201,10:392201,11:413844,12:336836,13:130944,14:446137,15:552237,16:578637,17:414568,19:126720,20:135168,21:59400,22:59400,24:80000,25:245000,26:245000,27:245000},
  Mayo_2026:{1:130944,2:508469,3:421168,4:130944,5:411668,6:385668,7:335301,8:458169,9:333301,10:332801,11:457669,12:347352,13:130944,14:476997,15:637593,16:638093,17:454169,19:126720,20:135168,21:0,22:41400,24:70000,25:235000,26:235000,27:235000}
}

const NOSIND_IDS=new Set([7,9,10,12,14,15,16])
const RECEP=new Set([1,4,13])
const SUPS=new Set([7,9,10])

// ── NÓMINA BASE ──
const WORKERS_BASE=[
  {id:1,n:'AGUILAR ANTIÑANCO, MARCOS RENE',rut:'17.035.309-9',cargo:'RECEPCIONISTA DE CARGA',p:'PMC',t:'SIND'},
  {id:2,n:'ASENCIO OYARZO, MARIO ALEXIS',rut:'18735118-9',cargo:'CHOQUERO',p:'PMC',t:'SIND'},
  {id:3,n:'BARRIENTOS OJEDA, JORGE',rut:'17891731-5',cargo:'CHOQUERO',p:'PMC',t:'SIND'},
  {id:4,n:'BUSTAMANTE MONTIEL, DIEGO',rut:'20.065.669-5',cargo:'RECEPCIONISTA DE CARGA Y CONTROL DE SINIESTROS',p:'PMC',t:'SIND'},
  {id:5,n:'CARCAMO VARGAS, WALTER',rut:'7562044-6',cargo:'AY. DE CHOFER',p:'PMC',t:'SIND'},
  {id:6,n:'CARRIL, BAYRON',rut:'18726077-9',cargo:'CHOQUERO',p:'PMC',t:'SIND'},
  {id:7,n:'HIDALGO ALDO',rut:'17742905-8',cargo:'SUPERVISOR',p:'PMC',t:'NOSIND'},
  {id:8,n:'LEAL REYES, JOEL OSVALDO',rut:'15295474-3',cargo:'CHOQUERO',p:'PMC',t:'SIND'},
  {id:9,n:'LIGNAY ANGEL MARCELO',rut:'12750742-2',cargo:'SUPERVISOR',p:'PMC',t:'NOSIND'},
  {id:10,n:'MIRANDA JOSE',rut:'17629990-8',cargo:'SUPERVISOR',p:'PMC',t:'NOSIND'},
  {id:11,n:'SOLDAN CLOIHUEQUE MARCELO',rut:'11917309-4',cargo:'CHOQUERO',p:'PMC',t:'SIND'},
  {id:12,n:'SOTO JOSE MIGUEL',rut:'20065161-8',cargo:'PORTALONERO',p:'PMC',t:'NOSIND'},
  {id:13,n:'TOLEDO TRECAÑANCO, PATRICIO',rut:'21.188.749-4',cargo:'RECEPCIONISTA DE CARGA',p:'PMC',t:'SIND'},
  {id:14,n:'VARGAS AGUERO, PATRICIO ARMANDO',rut:'10771605-K',cargo:'EMBARCADOR',p:'PMC',t:'NOSIND'},
  {id:15,n:'VARGAS SANTANA, JOSE ANTONIO',rut:'13849047-5',cargo:'CONDUCTOR PROF',p:'PMC',t:'NOSIND'},
  {id:16,n:'VARGAS SANTANA, RICARDO ROSAMEL',rut:'12011722-K',cargo:'CONDUCTOR PROF',p:'PMC',t:'NOSIND'},
  {id:17,n:'VILLAROEL TELLEZ, ANDRES EDUARDO',rut:'16312409-2',cargo:'EMBARCADOR',p:'PMC',t:'SIND'},
  {id:18,n:'RUPERTUS CEA, CARLOS',rut:'11654555-1',cargo:'JEFE TERMINAL UCO',p:'UCO',t:'NOSIND'},
  {id:19,n:'GAETE MIÑO, GALVARINO JESUS',rut:'14485934-0',cargo:'AGENCIA UCO',p:'UCO',t:'NOSIND'},
  {id:20,n:'ARZA MILLALONCO, LUIS',rut:'18.218.092-0',cargo:'SUPERVISOR UCO',p:'UCO',t:'SIND'},
  {id:21,n:'MIGUEL INOSTROZA',rut:'-',cargo:'JEFE DE TERMINAL NAT',p:'NAT',t:'NOSIND'},
  {id:22,n:'JOSE IGNACIO SILVA',rut:'-',cargo:'AGENCIA NAT',p:'NAT',t:'NOSIND'},
  {id:23,n:'EDGARD RIQUELME',rut:'-',cargo:'EMBARCADOR',p:'NAT',t:'NOSIND'},
  {id:24,n:'MANUEL FERNANDEZ',rut:'-',cargo:'JEFE DE TURNO',p:'NAT',t:'NOSIND'},
  {id:25,n:'SUAREZ OLAVARRIA, LEONARDO',rut:'-',cargo:'TRACTORISTA NAT',p:'NAT',t:'NOSIND'},
  {id:26,n:'RUIZ MAYORGA, VICTOR',rut:'-',cargo:'TRACTORISTA NAT',p:'NAT',t:'NOSIND'},
  {id:27,n:'PARDO OJEDA, PATRICIO',rut:'-',cargo:'TRACTORISTA NAT',p:'NAT',t:'NOSIND'}
]

let workers=[...WORKERS_BASE]
let mesData={},viajes=[],bonos={},nid=100
let currentUser=null

// ── AUTENTICACIÓN ──
window.iniciarSesion=async()=>{
  const email=$('login-email').value.trim()
  const pass=$('login-pass').value
  $('login-error').style.display='none'
  const {data,error}=await supabase.auth.signInWithPassword({email,password:pass})
  if(error){
    $('login-error').style.display='block'
    return
  }
  currentUser=data.user
  mostrarApp()
}

window.cerrarSesion=async()=>{
  await supabase.auth.signOut()
  $('login-screen').style.display='flex'
  $('app-screen').style.display='none'
}

async function mostrarApp(){
  $('login-screen').style.display='none'
  $('app-screen').style.display='flex'
  await cargarWorkers()
  await cargarValores()
  onMesCambio(true)
  renderWorkers()
  updateDash()
  cargarHistorial()
}

// ── SUPABASE: WORKERS ──
async function cargarWorkers(){
  try{
    const {data}=await supabase.from('workers').select('*').order('id')
    if(data&&data.length>0){
      workers=data.map(w=>({...w,id:Number(w.id)}))
    }
  }catch(e){console.log('Usando nómina base')}
}

async function guardarWorkerDB(w){
  mostrarGuardando()
  try{
    await supabase.from('workers').upsert({...w})
  }catch(e){console.error(e)}
  ocultarGuardando()
}

async function eliminarWorkerDB(id){
  try{await supabase.from('workers').delete().eq('id',id)}catch(e){console.error(e)}
}

// ── SUPABASE: MES DATA ──
async function cargarMesDB(mes){
  try{
    const {data}=await supabase.from('mes_data').select('*').eq('mes',mes).single()
    if(data){
      mesData=JSON.parse(data.mes_data||'{}')
      viajes=(JSON.parse(data.viajes||'[]')).map(v=>({...v,participantes:new Set(v.participantes||[])}))
      return true
    }
  }catch(e){}
  return false
}

async function guardarMesDB(){
  const mes=$('mes-sel').value
  mostrarGuardando()
  try{
    const viajesSerial=viajes.map(v=>({...v,participantes:[...v.participantes]}))
    await supabase.from('mes_data').upsert({
      mes,
      mes_data:JSON.stringify(mesData),
      viajes:JSON.stringify(viajesSerial),
      user_id:currentUser?.id,
      updated_at:new Date().toISOString()
    },{onConflict:'mes'})
  }catch(e){console.error(e)}
  ocultarGuardando()
}

async function guardarBonoDB(bonos_calc){
  const mes=$('mes-sel').value
  const totPMC=workers.filter(w=>w.p==='PMC').reduce((s,w)=>(bonos_calc[w.id]||{total:0}).total+s,0)
  const totUCO=workers.filter(w=>w.p==='UCO').reduce((s,w)=>(bonos_calc[w.id]||{total:0}).total+s,0)
  const totNAT=workers.filter(w=>w.p==='NAT').reduce((s,w)=>(bonos_calc[w.id]||{total:0}).total+s,0)
  try{
    await supabase.from('historial').upsert({
      mes,
      total_pmc:totPMC,
      total_uco:totUCO,
      total_nat:totNAT,
      total_general:totPMC+totUCO+totNAT,
      bonos:JSON.stringify(bonos_calc),
      user_id:currentUser?.id,
      created_at:new Date().toISOString()
    },{onConflict:'mes'})
  }catch(e){console.error(e)}
}

async function cargarValores(){
  try{
    const {data}=await supabase.from('valores_base').select('*').single()
    if(data){
      const v=JSON.parse(data.valores||'{}')
      Object.entries(v).forEach(([k,val])=>{const el=$(k);if(el)el.value=val})
    }
  }catch(e){}
}

window.guardarValores=async()=>{
  const v={}
  ;['v-tn','v-td','v-am','v-fe','v-ks','v-kn','v-ch','v-em','v-pa','v-po','v-fs','v-pp','v-b1s','v-b1n','v-b2s','v-b2n','v-nd','v-na','v-ku','v-ku2'].forEach(id=>{const el=$(id);if(el)v[id]=+el.value})
  mostrarGuardando()
  try{
    await supabase.from('valores_base').upsert({id:1,valores:JSON.stringify(v),updated_at:new Date().toISOString()})
    toast('Valores guardados en la nube.','s')
  }catch(e){toast('Error al guardar.','w')}
  ocultarGuardando()
}

async function cargarHistorial(){
  try{
    const {data}=await supabase.from('historial').select('*').order('mes',{ascending:false})
    if(!data||data.length===0){$('hist-rows').innerHTML='<div class="empty-state">Sin historial aún.</div>';return}
    $('hist-rows').innerHTML=data.map(h=>`
      <div class="hist-row">
        <span style="font-weight:500">${h.mes.replace('_',' ')}</span>
        <span>${fmt(h.total_pmc)}</span>
        <span>${fmt(h.total_uco)}</span>
        <span>${fmt(h.total_nat)}</span>
        <span style="text-align:right;font-weight:600">${fmt(h.total_general)}</span>
      </div>`).join('')
  }catch(e){$('hist-rows').innerHTML='<div class="empty-state">Error cargando historial.</div>'}
}

function mostrarGuardando(){$('saving-ind').classList.add('show')}
function ocultarGuardando(){setTimeout(()=>$('saving-ind').classList.remove('show'),800)}

// ── GETTERS ──
function getV(){return{tn:+$('v-tn').value||1000,td:+$('v-td').value||1500,am:+$('v-am').value||7857,fe:+$('v-fe').value||26400,ks:+$('v-ks').value||42240,kn:+$('v-kn').value||36960,ch:+$('v-ch').value||210000,em:+$('v-em').value||210000,pa:+$('v-pa').value||200000,po:+$('v-po').value||150000,fs:+$('v-fs').value||1.5,pp:+$('v-pp').value||105600,b1s:+$('v-b1s').value||26400,b1n:+$('v-b1n').value||24024,b2s:+$('v-b2s').value||33000,b2n:+$('v-b2n').value||29040,nd:+$('v-nd').value||45000,na:+$('v-na').value||120000,ku:+$('v-ku').value||42240,ku2:+$('v-ku2').value||42240}}

function calcBA(cargo,v){
  const c=cargo.toLowerCase()
  if(c.includes('supervisor')&&!c.includes('uco')) return 0
  if(c.includes('choquero')||c.includes('conductor prof')) return v.ch
  if(c.includes('embarcador')) return v.em
  if(c.includes('patero')||c.includes('ay. de chofer')) return v.pa
  if(c.includes('portalonero')||c.includes('asistente')) return v.po
  return 0
}

function setD(id,key,val){mesData[id]=mesData[id]||{};mesData[id][key]=val}
function bonoViaje(tipo,es_sind,v){if(tipo===0)return 0;if(tipo===1)return es_sind?v.b1s:v.b1n;return es_sind?v.b2s:v.b2n}

window.aplicarIPC=()=>{
  const pct=+$('ipc-pct').value
  if(!pct||pct<=0||pct>10){alert('% inválido.');return}
  const f=1+pct/100
  ;['v-tn','v-td','v-am','v-fe','v-ks','v-kn','v-ch','v-em','v-pa','v-po','v-pp','v-b1s','v-b1n','v-b2s','v-b2n','v-nd','v-na','v-ku','v-ku2'].forEach(id=>{const el=$(id);if(el)el.value=Math.round(+el.value*f)})
  $('ipc-preview').innerHTML=`<span style="color:#0F6E56">✓ ${pct}% aplicado.</span>`
  toast(`Reajuste IPC ${pct}% aplicado.`,'s')
}

// ── RENDER INGRESO ──
function renderIngreso(){
  const v=getV()
  $('pmc-inputs').innerHTML=workers.filter(w=>w.p==='PMC').map(w=>{
    const d=mesData[w.id]||{}
    const camps=[['tn',MAX.tn],['td',MAX.td],['fe',MAX.fe],['am',MAX.am]]
    const inps=camps.map(([c,mx])=>`<input type="number" value="${d[c]||0}" min="0" class="${(d[c]||0)>mx?'warn':''}" oninput="setD(${w.id},'${c}',+this.value);this.className=+this.value>${mx}?'warn':''">`).join('')
    return`<div class="wir"><span style="font-size:11px">${w.n.split(',')[0]}</span>${inps}<span style="font-size:9px;color:var(--color-text-secondary)">${w.cargo.substring(0,14)}</span><button class="btn sm warn" onclick="elimWorker(${w.id})"><i class="ti ti-trash"></i></button></div>`
  }).join('')

  $('uco-inputs').innerHTML=workers.filter(w=>w.p==='UCO').map(w=>{
    const d=mesData[w.id]||{}
    const camps=[['tn',MAX.tn],['td',MAX.td],['fe',MAX.fe],['am',MAX.am]]
    const inps=camps.map(([c,mx])=>`<input type="number" value="${d[c]||0}" min="0" oninput="setD(${w.id},'${c}',+this.value)">`).join('')
    return`<div class="ucor"><span style="font-size:11px">${w.n}<br><span style="font-size:9px;color:var(--color-text-secondary)">${w.cargo}</span></span>${inps}<span style="font-size:9px;color:var(--color-text-secondary)">${w.cargo.substring(0,14)}</span><button class="btn sm warn" onclick="elimWorker(${w.id})"><i class="ti ti-trash"></i></button></div>`
  }).join('')

  $('nat-inputs').innerHTML=workers.filter(w=>w.p==='NAT').map(w=>{
    const d=mesData[w.id]||{}
    const c=w.cargo.toLowerCase()
    const et=c.includes('tractorista'),ej=c.includes('jefe de turno')
    const cd=d.cd!==undefined?d.cd:true
    return`<div class="nat-row">
      <span style="font-size:11px">${w.n}<br><span style="font-size:9px;color:var(--color-text-secondary)">${w.cargo}</span></span>
      <div style="text-align:center"><input type="checkbox" ${d.opera!==false?'checked':''} onchange="setD(${w.id},'opera',this.checked)"></div>
      <input type="number" value="${d.rend||0}" min="0" ${!et&&!ej?'disabled style="opacity:.4"':''} oninput="setD(${w.id},'rend',+this.value)">
      <div>${et?`<div class="radio-group">
        <label><input type="radio" name="cd${w.id}" ${cd?'checked':''} onchange="setD(${w.id},'cd',true)"> <span style="color:#0F6E56">Sin daños</span></label>
        <label><input type="radio" name="cd${w.id}" ${!cd?'checked':''} onchange="setD(${w.id},'cd',false)"> <span style="color:#A32D2D">Con daños</span></label>
      </div>`:'—'}</div>
      <input type="number" value="${d.otros||0}" min="0" ${et?'disabled style="opacity:.4"':''} oninput="setD(${w.id},'otros',+this.value)">
    </div>`
  }).join('')
}

function renderCierre(){
  const ops=workers.filter(w=>w.p==='PMC'&&!SUPS.has(w.id)&&!RECEP.has(w.id))
  const sups=workers.filter(w=>SUPS.has(w.id))
  $('dano-list-pmc').innerHTML=ops.map(w=>{
    const d=mesData[w.id]||{};const fd=d.fd!==undefined?d.fd:1.2
    return`<div class="dano-row"><span style="flex:1;font-size:12px">${w.n.split(',')[0]}</span>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="d${w.id}" ${fd===1.2?'checked':''} onchange="setD(${w.id},'fd',1.2)"> Sin daños</label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="d${w.id}" ${fd===1.1?'checked':''} onchange="setD(${w.id},'fd',1.1)"> Daño leve</label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="d${w.id}" ${fd===0?'checked':''} onchange="setD(${w.id},'fd',0)"> Con daños</label>
    </div>`
  }).join('')
  $('sup-extra-list').innerHTML=sups.map(w=>{
    const d=mesData[w.id]||{}
    return`<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:0.5px solid var(--color-border-tertiary)">
      <span style="font-size:12px;flex:1">${w.n}</span>
      <span style="font-size:11px;color:var(--color-text-secondary)">Bono adicional ($)</span>
      <input type="number" value="${d.sup_extra||0}" min="0" style="width:130px" oninput="setD(${w.id},'sup_extra',+this.value)">
    </div>`
  }).join('')
}

window.guardarIngreso=async()=>{
  $('m-ing').textContent=Object.values(mesData).filter(d=>(d.tn||0)+(d.td||0)+(d.fe||0)>0||d.opera!==false||d.rend>0).length
  $('pd1').className='pd done';$('pl1').className='pl'
  $('pd2').className='pd active';$('pl2').className='pl active'
  await guardarMesDB()
  toast('Datos guardados en la nube.','s')
}

window.cerrarMesYCalcular=()=>{
  const s=document.querySelector('input[name="siniestro"]:checked')?.value||'parcial'
  $('pd3').className='pd done';$('pl3').className='pl'
  $('pd4').className='pd active';$('pl4').className='pl active'
  calcularBonos(s==='completo'?3.2:3.1)
}

// ── CALCULAR ──
window.calcularBonos=(recepF)=>{
  const v=getV()
  if(recepF===undefined){const s=document.querySelector('input[name="siniestro"]:checked')?.value||'parcial';recepF=s==='completo'?3.2:3.1}
  const danoUCO=document.querySelector('input[name="dano-uco"]:checked')?.value||'sin'
  const arza_kpi=danoUCO==='con'?(1+1+0+1):(1+1+1.2+0)
  bonos={}

  workers.forEach(w=>{
    const c=w.cargo.toLowerCase()
    const d=mesData[w.id]||{}
    const es_sind=!NOSIND_IDS.has(w.id)&&w.t==='SIND'
    let nat=0
    viajes.forEach(vj=>{if(vj.participantes?.has(w.id)) nat+=bonoViaje(vj.tipo,es_sind,v)})

    if(w.p==='PMC'){
      const kb=NOSIND_IDS.has(w.id)?v.kn:v.ks
      const bt=(d.tn||0)*v.tn+(d.td||0)*v.td
      const ba=calcBA(w.cargo,v)
      const bfe=(d.fe||0)*v.fe
      const bam=(d.am||0)*v.am
      if(SUPS.has(w.id)){
        const cumpl=v.fs*v.pp,resp=v.fs*v.pp,sup_extra=d.sup_extra||0
        bonos[w.id]={bt,ba:0,nat,fe:0,am:0,kpi:0,cumpl,resp,sup_extra,total:Math.round(bt+nat+cumpl+resp+sup_extra)}
      } else if(RECEP.has(w.id)){
        const kpi=recepF*kb
        bonos[w.id]={bt:0,ba:0,nat:0,fe:bfe,am:0,kpi,cumpl:0,resp:0,sup_extra:0,total:Math.round(kpi+bfe)}
      } else {
        const fd=d.fd!==undefined?d.fd:1.2
        const kpi=(1+1+fd+0)*kb
        bonos[w.id]={bt,ba,nat,fe:bfe,am:bam,kpi,cumpl:0,resp:0,sup_extra:0,total:Math.round(bt+ba+nat+bfe+bam+kpi)}
      }
    } else if(w.p==='UCO'){
      if(c.includes('jefe terminal')){bonos[w.id]={total:0,kpi:0,nat:0};return}
      const ku=w.t==='SIND'?v.ku:v.ku2
      const kpi=c.includes('agencia uco')?(1+1+0+1)*ku:arza_kpi*ku
      bonos[w.id]={total:Math.round(kpi+nat),kpi,nat}
    } else {
      const et=c.includes('tractorista nat'),ej=c.includes('jefe de turno'),eo=!et&&!ej&&w.id!==23
      if(et){const op=d.opera!==false;const rend=op?(d.rend||0):0;const nd=op&&d.cd!==false?v.nd:0;const na2=op?v.na:0;bonos[w.id]={bt:rend,ba:0,nat:nd,fe:na2,total:rend+nd+na2}}
      else if(ej){const r=d.opera!==false?(d.rend||0):0;bonos[w.id]={bt:r,total:r}}
      else if(eo){bonos[w.id]={ba:d.otros||0,total:d.otros||0}}
      else{bonos[w.id]={total:0}}
    }
  })

  renderBonos()
  updateDash()
  $('pd4').className='pd done';$('pl4').className='pl'
  $('bonos-mes').textContent=$('mes-sel').value.replace('_',' ')
  guardarBonoDB(bonos)
  cargarHistorial()
  toast('Bonificaciones calculadas y guardadas.','s')
  nav('bonos',document.querySelectorAll('.nav')[4])
}

function renderBonos(){
  let tp=0,tu=0,tn2=0
  $('rows-pmc').innerHTML=workers.filter(w=>w.p==='PMC').map(w=>{
    const b=bonos[w.id]||{bt:0,ba:0,nat:0,fe:0,kpi:0,cumpl:0,resp:0,sup_extra:0,total:0}
    tp+=b.total
    const es_sup=SUPS.has(w.id),es_rec=RECEP.has(w.id)
    return`<div class="bono-pmc-row">
      <span style="font-size:10px">${w.n.split(',')[0]}${es_sup?'<span class="badge bgr" style="font-size:8px;margin-left:4px">SUP</span>':es_rec?'<span class="badge bb" style="font-size:8px;margin-left:4px">REC</span>':''}</span>
      <span style="text-align:right">${b.bt>0?fmt(b.bt):'—'}</span>
      <span style="text-align:right">${b.ba>0?fmt(b.ba):'—'}</span>
      <span style="text-align:right">${b.nat>0?fmt(b.nat):'—'}</span>
      <span style="text-align:right">${b.fe>0?fmt(b.fe):'—'}</span>
      <span style="text-align:right${es_rec?';color:#0C447C':''}">${b.kpi>0?fmt(b.kpi):'—'}${es_rec?'<div style="font-size:8px;color:#0C447C">rendimiento</div>':''}</span>
      <span style="text-align:right">${b.cumpl>0?fmt(b.cumpl):'—'}</span>
      <span style="text-align:right">${(b.resp||0)+(b.sup_extra||0)>0?fmt((b.resp||0)+(b.sup_extra||0)):'—'}</span>
      <span style="text-align:right;font-weight:600">${fmt(b.total)}</span>
    </div>`
  }).join('')
  $('tot-pmc').textContent=fmt(tp)

  $('rows-uco').innerHTML=workers.filter(w=>w.p==='UCO').map(w=>{
    const b=bonos[w.id]||{kpi:0,nat:0,total:0}
    tu+=b.total
    return`<div class="bono-row"><span style="font-size:10px">${w.n}</span><span>${b.kpi>0?fmt(b.kpi):'—'}</span><span style="color:#0C447C">${b.nat>0?fmt(b.nat):'—'}</span><span>—</span><span>—</span><span>—</span><span style="text-align:right;font-weight:500">${fmt(b.total)}</span></div>`
  }).join('')
  $('tot-uco').textContent=fmt(tu)

  $('rows-nat').innerHTML=workers.filter(w=>w.p==='NAT').map(w=>{
    const b=bonos[w.id]||{bt:0,ba:0,nat:0,fe:0,total:0}
    const c=w.cargo.toLowerCase()
    const et=c.includes('tractorista'),ej=c.includes('jefe de turno')
    tn2+=b.total
    return`<div class="bono-row"><span style="font-size:10px">${w.n}</span><span>${et||ej?fmt(b.bt||0):'—'}</span><span>${et?fmt(b.nat||0):'—'}</span><span>${et?fmt(b.fe||0):'—'}</span><span>${b.ba>0?fmt(b.ba):'—'}</span><span>—</span><span style="text-align:right;font-weight:500">${fmt(b.total)}</span></div>`
  }).join('')
  $('tot-nat').textContent=fmt(tn2)
  $('d-pmc').textContent=fmt(tp);$('d-uco').textContent=fmt(tu);$('d-nat').textContent=fmt(tn2)
  $('m-total').textContent=fmt(tp+tu+tn2)
}

// ── VERIFICACIÓN ──
window.verificar=()=>{
  if(!Object.keys(bonos).length) calcularBonos()
  const mes=$('mes-sel').value
  const real=REAL[mes]
  if(!real){$('verif-rows').innerHTML='<div class="empty-state">Sin datos de referencia. Disponible: Marzo, Abril y Mayo 2026.</div>';return}
  let ok=0,warn=0,err=0
  const rows=workers.map(w=>{
    const r=real[w.id]||0;if(r===0&&!(bonos[w.id]?.total>0)) return ''
    const c=(bonos[w.id]||{total:0}).total;const diff=c-r;const p=r>0?pc(c,r):0
    let col,ico,st
    if(p<0.5){col='#0F6E56';ico='ti-check';st='Correcto';ok++}
    else if(p<3){col='#633806';ico='ti-alert-triangle';st='Leve';warn++}
    else{col='#A32D2D';ico='ti-x';st='Revisar';err++}
    return`<div class="vrow"><span style="font-size:10px">${w.n.split(',')[0]}</span><span>${fmt(c)}</span><span>${fmt(r)}</span><span style="font-size:10px;color:${diff>=0?'#0F6E56':'#A32D2D'}">${diff>=0?'+':''}${fmt(diff)} (${p.toFixed(1)}%)</span><span style="color:${col};font-size:10px"><i class="ti ${ico}"></i> ${st}</span></div>`
  }).filter(Boolean).join('')
  $('verif-rows').innerHTML=rows||'<div class="empty-state">Sin datos.</div>'
  const tot=ok+warn+err;const pct=tot?Math.round(ok/tot*100):0
  $('verif-res').innerHTML=`<div class="alert ${err===0?'s':'w'}"><i class="ti ti-chart-bar"></i><div><strong>${pct}% de precisión</strong> — ${ok} correctos · ${warn} diferencia de $1 (redondeo) · ${err} revisar — ${tot} trabajadores.</div></div>`
}

// ── VIAJES ──
window.detectarNave=(val)=>{
  const v=val.trim().toUpperCase();const nums=v.replace(/[^0-9]/g,'')
  const el=$('vj-nave-display');let nave='none',label='<i class="ti ti-ship"></i> Ingresa el número'
  if(v.startsWith('EZ')||(!v.startsWith('DK')&&nums.length===3)){nave='ez';label=`<i class="ti ti-ship"></i> EZ ${nums} — <strong>Esperanza</strong> · PMC ↔ Puerto Natales`}
  else if(v.startsWith('DK')||nums.length===4){nave='dk';label=`<i class="ti ti-ship"></i> DK ${nums} — <strong>Dalka</strong> · PMC ↔ Puerto Chacabuco`}
  el.className='nave-display '+nave;el.innerHTML=label
}

window.actualizarBonoPrev=()=>{
  const v=getV();const tipo=+$('vj-tipo').value
  if(tipo===0){$('vj-prev-s').value='$0 — No cumple';$('vj-prev-n').value='$0 — No cumple'}
  else if(tipo===1){$('vj-prev-s').value=fmt(v.b1s);$('vj-prev-n').value=fmt(v.b1n)}
  else{$('vj-prev-s').value=fmt(v.b2s);$('vj-prev-n').value=fmt(v.b2n)}
}

window.abrirViaje=()=>{
  $('vj-fecha').value=new Date().toISOString().split('T')[0]
  $('vj-num').value='';$('vj-nave-display').className='nave-display none'
  $('vj-nave-display').innerHTML='<i class="ti ti-ship"></i> Ingresa el número'
  actualizarBonoPrev()
  const lista=workers.filter(w=>w.p==='PMC'||w.p==='UCO')
  $('vj-participantes').innerHTML=lista.map(w=>`
    <label style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;cursor:pointer;font-size:11px;">
      <input type="checkbox" id="vp${w.id}" onchange="actualizarCount()">
      <span>${w.n.split(',')[0]} <span style="font-size:9px;color:var(--color-text-secondary)">${w.p}·${w.t}</span></span>
    </label>`).join('')
  actualizarCount()
  $('modal-viaje').classList.add('open')
}

window.actualizarCount=()=>{const cnt=document.querySelectorAll('#vj-participantes input:checked').length;$('vj-count').textContent=cnt+' seleccionado'+(cnt===1?'':'s')}
window.selTodos=(v)=>{document.querySelectorAll('#vj-participantes input[type=checkbox]').forEach(cb=>{cb.checked=v;cb.parentElement.style.background=v?'#E1F5EE':''});actualizarCount()}

window.guardarViaje=async()=>{
  const num=$('vj-num').value.trim().toUpperCase();if(!num){alert('Ingresa el número de viaje.');return}
  const tipo=+$('vj-tipo').value;const v=getV()
  const part=new Set();document.querySelectorAll('#vj-participantes input:checked').forEach(cb=>{part.add(+cb.id.replace('vp',''))})
  const nums=num.replace(/[^0-9]/g,'')
  const nave=num.startsWith('EZ')||(!num.startsWith('DK')&&nums.length===3)?'EZ':'DK'
  const nombreBarco=nave==='EZ'?'Esperanza':'Dalka'
  const ruta=nave==='EZ'?'PMC ↔ Puerto Natales':'PMC ↔ Puerto Chacabuco'
  viajes.push({id:nid++,num,nave,nombreBarco,ruta,fecha:$('vj-fecha').value,tipo,bval_s:bonoViaje(tipo,true,v),bval_n:bonoViaje(tipo,false,v),unidades:+$('vj-unid').value,danos:+$('vj-danos').value,participantes:part})
  cerrarModal('viaje');renderViajes()
  $('m-ez').textContent=viajes.length
  $('pd2').className='pd done';$('pl2').className='pl'
  $('pd3').className='pd active';$('pl3').className='pl active'
  await guardarMesDB()
  toast(`${num} — ${nombreBarco} · ${part.size} participante(s).`,'s')
}

function renderViajes(){
  if(!viajes.length){$('lista-viajes').innerHTML='<div class="empty-state" style="padding:40px">Sin viajes registrados.</div>';return}
  $('lista-viajes').innerHTML=viajes.map(vj=>{
    const es_ez=vj.nave==='EZ'
    const tipo_label=vj.tipo===0?'No cumple':vj.tipo===1?'Bono 1':'Bono 2'
    const partic=workers.filter(w=>vj.participantes?.has(w.id))
    return`<div class="viaje-card">
      <div class="viaje-hdr">
        <div class="viaje-title">
          <span class="badge ${es_ez?'bg':'bb'}" style="font-size:12px;padding:3px 10px;font-weight:600">${vj.num}</span>
          <span style="font-size:13px;font-weight:500;color:${es_ez?'#085041':'#0C447C'}"><i class="ti ti-ship"></i> ${vj.nombreBarco}</span>
          <span style="font-size:11px;color:var(--color-text-secondary)">${vj.ruta}</span>
          <span style="font-size:11px;color:var(--color-text-secondary)">${vj.fecha}</span>
          <span class="badge ${vj.tipo===0?'bgr':vj.tipo===1?'ba':'bg'}">${tipo_label}</span>
          <span style="font-size:11px"><span style="color:#085041">${fmt(vj.bval_s)}</span> SIND · <span style="color:#0C447C">${fmt(vj.bval_n)}</span> NOSIND</span>
        </div>
        <button class="btn sm warn" onclick="elimViaje(${vj.id})"><i class="ti ti-trash"></i></button>
      </div>
      <div class="viaje-body">
        <div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:4px">${partic.length} participante(s):</div>
        <div>${partic.map(w=>`<span class="part-chip ${w.t==='SIND'?'sind':'nosind'}">${w.n.split(',')[0]} · ${w.t==='SIND'?fmt(vj.bval_s):fmt(vj.bval_n)}</span>`).join('')}${partic.length===0?'<span style="font-size:11px;color:var(--color-text-secondary);font-style:italic">Sin participantes</span>':''}</div>
      </div>
    </div>`
  }).join('')
}

window.elimViaje=async(id)=>{
  if(!confirm('¿Eliminar?'))return
  viajes=viajes.filter(v=>v.id!==id)
  renderViajes();$('m-ez').textContent=viajes.length
  await guardarMesDB()
}

// ── WORKERS ──
window.actualizarCargos=()=>{const p=$('w-pue').value;$('w-cargo').innerHTML=(CARGOS[p]||CARGOS.PMC).map(c=>`<option>${c}</option>`).join('');actualizarPreviewBA()}
window.actualizarPreviewBA=()=>{
  const v=getV();const cargo=$('w-cargo').value;const ba=calcBA(cargo,v)
  $('w-ba-preview').value=fmt(ba)
  const c=cargo.toLowerCase()
  $('w-preview-text').textContent=
    c.includes('supervisor')&&!c.includes('uco')?'Supervisor PMC — BT + Natales + Cumpl.Ppto + B.Responsabilidad':
    c.includes('recepcionista')?'Recepcionista — bono de rendimiento (KPI). Puede tener faenas extra.':
    c.includes('choquero')||c.includes('conductor')?'Choquero/Conductor — bono asistencia '+fmt(v.ch):
    c.includes('embarcador')?'Embarcador — bono asistencia '+fmt(v.em):
    c.includes('patero')||c.includes('ay.')?'Patero/Ay.chofer — bono asistencia '+fmt(v.pa):
    c.includes('portalonero')?'Portalonero — bono asistencia '+fmt(v.po):
    c.includes('tractorista')?'Tractorista NAT — rendimiento + cero daño + asistencia':'Sin bono de asistencia'
}
window.abrirWorker=()=>{$('w-nom').value='';$('w-rut').value='';$('w-nom-tip').textContent='';$('w-rut-tip').textContent='';actualizarCargos();$('modal-worker').classList.add('open')}
window.guardarWorker=async()=>{
  const nom=$('w-nom').value.trim();if(!nom){$('w-nom-tip').textContent='⚠ Obligatorio';return}
  const rut=$('w-rut').value.trim();if(!rut){$('w-rut-tip').textContent='⚠ Obligatorio';return}
  if(workers.find(w=>w.rut===rut&&rut!=='-')){if(!confirm(`Ya existe RUT ${rut}. ¿Agregar igual?`)) return}
  const nuevo={id:nid++,n:nom.toUpperCase(),rut,cargo:$('w-cargo').value,p:$('w-pue').value,t:$('w-tipo').value}
  workers.push(nuevo)
  cerrarModal('worker');renderWorkers();renderIngreso();renderCierre()
  $('m-trab').textContent=workers.length
  await guardarWorkerDB(nuevo)
  toast(`${nom.split(',')[0].trim()} agregado.`,'s')
}
function renderWorkers(){
  const v=getV()
  $('tabla-workers').innerHTML=workers.map(w=>`<tr><td style="font-size:11px">${w.n}</td><td style="font-size:11px">${w.rut}</td><td><span class="badge bgr" style="font-size:9px">${w.cargo.substring(0,16)}</span></td><td>${w.p==='PMC'?'Pto.Montt':w.p==='UCO'?'Chacabuco':'Natales'}</td><td><span class="badge ${w.t==='SIND'?'bg':'bb'}">${w.t==='SIND'?'Sindic.':'No sindic.'}</span></td><td>${fmt(calcBA(w.cargo,v))}</td><td><button class="btn sm warn" onclick="elimWorker(${w.id})"><i class="ti ti-trash"></i></button></td></tr>`).join('')
}
window.elimWorker=async(id)=>{
  if(!confirm('¿Eliminar?'))return
  workers=workers.filter(w=>w.id!==id);delete mesData[id]
  renderWorkers();renderIngreso();renderCierre()
  $('m-trab').textContent=workers.length
  await eliminarWorkerDB(id)
}

// ── EXPORTAR ──
window.exportarExcel=()=>{
  if(!Object.keys(bonos).length){alert('Primero calcula.');return}
  const mes=$('mes-sel').value.replace('_',' ')
  const XLSX=window.XLSX;const wb=XLSX.utils.book_new();const filas=[]
  filas.push([`BONIFICACIONES — ${mes}`,'','','','','','','','','','']);filas.push([])
  if(viajes.length){
    filas.push(['VIAJES DEL MES','','','','','','','','','',''])
    filas.push(['N° Viaje','Barco','Ruta','Fecha','Tipo','Bono SIND','Bono NOSIND','Participantes','','',''])
    viajes.forEach(vj=>{const p=workers.filter(w=>vj.participantes?.has(w.id)).map(w=>w.n.split(',')[0]).join(', ');filas.push([vj.num,vj.nombreBarco,vj.ruta,vj.fecha,vj.tipo===0?'No cumple':vj.tipo===1?'Bono 1':'Bono 2',vj.bval_s,vj.bval_n,p,'','',''])})
    filas.push([])
  }
  filas.push(['PUERTO MONTT','','','','','','','','','',''])
  filas.push(['Trabajador','Cargo','Bono Turno','Bono Asistencia','Bono Natales','Faena Extra','KPI/Rendimiento','Cumpl.Ppto Nave','Bono Responsabilidad','Bono Adicional','TOTAL'])
  workers.filter(w=>w.p==='PMC').forEach(w=>{const b=bonos[w.id]||{bt:0,ba:0,nat:0,fe:0,kpi:0,cumpl:0,resp:0,sup_extra:0,total:0};filas.push([w.n,w.cargo,b.bt||0,b.ba||0,b.nat||0,b.fe||0,b.kpi||0,b.cumpl||0,b.resp||0,b.sup_extra||0,b.total])})
  const totPMC=workers.filter(w=>w.p==='PMC').reduce((s,w)=>(bonos[w.id]||{total:0}).total+s,0)
  filas.push(['SUBTOTAL PUERTO MONTT','','','','','','','','','',totPMC]);filas.push([])
  filas.push(['PUERTO CHACABUCO','','','','','','','','','',''])
  filas.push(['Trabajador','Cargo','KPI/Rendimiento','Bono viaje','','','','','','','TOTAL'])
  workers.filter(w=>w.p==='UCO').forEach(w=>{const b=bonos[w.id]||{kpi:0,nat:0,total:0};filas.push([w.n,w.cargo,b.kpi||0,b.nat||0,'','','','','','',b.total])})
  const totUCO=workers.filter(w=>w.p==='UCO').reduce((s,w)=>(bonos[w.id]||{total:0}).total+s,0)
  filas.push(['SUBTOTAL PUERTO CHACABUCO','','','','','','','','','',totUCO]);filas.push([])
  filas.push(['PUERTO NATALES','','','','','','','','','',''])
  filas.push(['Trabajador','Cargo','Rendimiento','Cero Daño','Asistencia','Bono Otro','','','','','TOTAL'])
  workers.filter(w=>w.p==='NAT').forEach(w=>{const b=bonos[w.id]||{bt:0,nat:0,fe:0,ba:0,total:0};filas.push([w.n,w.cargo,b.bt||0,b.nat||0,b.fe||0,b.ba||0,'','','','',b.total])})
  const totNAT=workers.filter(w=>w.p==='NAT').reduce((s,w)=>(bonos[w.id]||{total:0}).total+s,0)
  filas.push(['SUBTOTAL PUERTO NATALES','','','','','','','','','',totNAT]);filas.push([])
  filas.push(['GRAN TOTAL','','','','','','','','','',totPMC+totUCO+totNAT])
  const ws=XLSX.utils.aoa_to_sheet(filas)
  ws['!cols']=[{wch:36},{wch:22},{wch:11},{wch:13},{wch:13},{wch:11},{wch:15},{wch:15},{wch:18},{wch:13},{wch:12}]
  const range=XLSX.utils.decode_range(ws['!ref'])
  for(let r=range.s.r;r<=range.e.r;r++)for(let c=2;c<=10;c++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&typeof cell.v==='number')cell.z='$#,##0'}
  XLSX.utils.book_append_sheet(wb,ws,'Resumen');XLSX.writeFile(wb,`bonificaciones_${mes.replace(' ','_')}.xlsx`)
  toast('Excel exportado.','s')
}

window.exportarTxt=()=>{
  const mes=$('mes-sel').value.replace('_',' ');let txt=`BONIFICACIONES ${mes}\n${'═'.repeat(60)}\n\n`
  if(viajes.length){txt+=`VIAJES DEL MES\n${'─'.repeat(50)}\n`;viajes.forEach(vj=>{const tipo=vj.tipo===0?'No cumple':vj.tipo===1?'Bono 1':'Bono 2';const p=workers.filter(w=>vj.participantes?.has(w.id)).length;txt+=`${vj.num} — ${vj.nombreBarco} · ${tipo} · ${p} participantes\n`});txt+='\n'}
  ;['PMC','UCO','NAT'].forEach(p=>{const pn=p==='PMC'?'PUERTO MONTT':p==='UCO'?'PUERTO CHACABUCO':'PUERTO NATALES';txt+=`${pn}\n${'─'.repeat(50)}\n`;workers.filter(w=>w.p===p).forEach(w=>{const b=bonos[w.id]||{total:0};txt+=`${w.n.padEnd(40)} ${fmt(b.total).padStart(12)}\n`});const tot=workers.filter(w=>w.p===p).reduce((s,w)=>(bonos[w.id]||{total:0}).total+s,0);txt+=`${'SUBTOTAL'.padEnd(40)} ${fmt(tot).padStart(12)}\n\n`})
  const blob=new Blob([txt],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bonificaciones_${mes.replace(' ','_')}.txt`;a.click()
  toast('Exportado.','s')
}

// ── UI ──
function updateDash(){
  $('m-trab').textContent=workers.length
  $('m-ing').textContent=Object.values(mesData).filter(d=>(d.tn||0)+(d.td||0)+(d.fe||0)>0||d.opera!==false||d.rend>0).length
  $('m-ez').textContent=viajes.length
}

window.onMesCambio=async(silent=false)=>{
  bonos={};mesData={};viajes=[]
  ;['m-total','d-pmc','d-uco','d-nat'].forEach(id=>$(id).textContent='—')
  $('bonos-mes').textContent=$('mes-sel').value.replace('_',' ')
  $('m-ing').textContent=0;$('m-ez').textContent=0
  ;['pd1','pd2','pd3','pd4'].forEach(id=>{$(id).className='pd pend'})
  ;['pl1','pl2','pl3','pl4'].forEach(id=>{$(id).className='pl pend'})
  $('pd1').className='pd active';$('pl1').className='pl active'
  // Cargar datos del mes desde Supabase
  const cargado=await cargarMesDB($('mes-sel').value)
  if(cargado){
    $('m-ing').textContent=Object.values(mesData).filter(d=>(d.tn||0)+(d.td||0)+(d.fe||0)>0||d.opera!==false||d.rend>0).length
    $('m-ez').textContent=viajes.length
    if(!silent) toast('Datos del mes cargados desde la nube.','s')
  }
  renderIngreso();renderCierre();renderViajes()
}

window.nav=(name,el)=>{
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'))
  document.querySelectorAll('.nav').forEach(n=>n.classList.remove('on'))
  $('sc-'+name).classList.add('on');if(el)el.classList.add('on')
  const t={dash:'Resumen del mes',ingreso:'Paso 1 — Ingresar datos',viajes:'Paso 2 — Viajes del mes',cierre:'Paso 3 — Cerrar mes',bonos:'Bonificaciones calculadas',historial:'Historial de meses',verif:'Verificación',workers:'Trabajadores',vals:'Valores base'}
  $('ptitle').textContent=t[name]||name
  if(name==='workers') renderWorkers()
  if(name==='ingreso') renderIngreso()
  if(name==='cierre') renderCierre()
  if(name==='viajes') renderViajes()
  if(name==='historial') cargarHistorial()
}

window.tabIng=(t,el)=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));el.classList.add('on');['pmc','uco','nat'].forEach(x=>$('ing-'+x).style.display='none');$('ing-'+t).style.display='block'}
window.tabBono=(t,el)=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));el.classList.add('on');['pmc','uco','nat'].forEach(x=>$('bono-'+x).style.display='none');$('bono-'+t).style.display='block'}
window.cerrarModal=(m)=>$('modal-'+m).classList.remove('open')

function toast(msg,type){
  const z=$('dash-alerts');const d=document.createElement('div')
  d.className='alert '+type;d.innerHTML=`<i class="ti ti-check-circle"></i>${msg}`
  z.appendChild(d);setTimeout(()=>d.remove(),4000)
}

document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}))
$('w-cargo').addEventListener('change',actualizarPreviewBA)
$('vj-tipo').addEventListener('change',actualizarBonoPrev)

// ── INICIO ──
actualizarCargos()
actualizarBonoPrev()

// Verificar sesión activa
supabase.auth.getSession().then(({data:{session}})=>{
  if(session){
    currentUser=session.user
    mostrarApp()
  }
})
