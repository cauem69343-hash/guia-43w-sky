const tabs=[...document.querySelectorAll('.tab')];
const panels=[...document.querySelectorAll('.panel')];
const search=document.getElementById('search');
const empty=document.getElementById('empty');
const select=document.getElementById('selectTab');

function activate(id){
  tabs.forEach(t=>t.classList.toggle('active',t.dataset.target===id));
  panels.forEach(p=>p.classList.toggle('active',p.id===id));
  if(select) select.value=id;
  window.scrollTo({top:0,behavior:'smooth'});
}
tabs.forEach(t=>t.addEventListener('click',()=>activate(t.dataset.target)));

panels.forEach(p=>{
  const tab=tabs.find(t=>t.dataset.target===p.id);
  const opt=document.createElement('option');
  opt.value=p.id;
  opt.textContent=tab?.innerText.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'')||p.querySelector('h2').innerText;
  select?.appendChild(opt);
});
select?.addEventListener('change',e=>activate(e.target.value));

function filter(){
  const q=search.value.toLowerCase().trim();
  let shown=0;
  panels.forEach(p=>{
    const ok=p.innerText.toLowerCase().includes(q);
    p.dataset.match=ok?'1':'0';
    if(ok) shown++;
  });
  if(!q){
    tabs.forEach(t=>t.style.display='flex');
    empty.style.display='none';
    activate(panels[0].id);
    return;
  }
  tabs.forEach(t=>{
    const p=document.getElementById(t.dataset.target);
    t.style.display=(p?.dataset.match==='1')?'flex':'none';
  });
  const first=panels.find(p=>p.dataset.match==='1');
  panels.forEach(p=>p.classList.remove('active'));
  if(first) first.classList.add('active');
  empty.style.display=shown?'none':'block';
}
search.addEventListener('input',filter);
activate(panels[0].id);

/* Interações da aba Script de atendimento */
const scNameInput=document.getElementById('sc-nome');
if(scNameInput){
  scNameInput.addEventListener('input',()=>{
    const value=scNameInput.value.trim()||'[nome do atendente]';
    document.querySelectorAll('#sec14 .sc-nm').forEach(el=>el.textContent=value);
  });
}
document.querySelectorAll('#sec14 .sc-copy').forEach(button=>{
  button.addEventListener('click',async()=>{
    const card=button.closest('.sc-script');
    const text=[...card.querySelectorAll('p')].map(p=>p.textContent.trim()).filter(Boolean).join('\n\n');
    try{
      if(navigator.clipboard&&window.isSecureContext){
        await navigator.clipboard.writeText(text);
      }else{
        const area=document.createElement('textarea');
        area.value=text;
        area.style.position='fixed';
        area.style.opacity='0';
        document.body.appendChild(area);
        area.select();
        const copied=document.execCommand('copy');
        area.remove();
        if(!copied) throw new Error('Falha ao copiar');
      }
      button.textContent='✓ Copiado!';
      button.classList.add('ok');
      setTimeout(()=>{button.textContent='Copiar';button.classList.remove('ok');},1800);
    }catch(error){
      button.textContent='Selecione e copie (Ctrl+C)';
      setTimeout(()=>{button.textContent='Copiar';},2500);
    }
  });
});

/* Copiar passo a passo dos procedimentos de ativação */
document.querySelectorAll('#sec8 .activation-copy').forEach(button=>{
  button.addEventListener('click',async()=>{
    const block=button.closest('.activation-block');
    const heading=block.querySelector('.activation-label strong')?.textContent.trim()||'Procedimento de ativação';
    const intro=block.querySelector('.activation-instruction')?.innerText.trim();
    const steps=[...block.querySelectorAll('.activation-steps li')].map((li,i)=>`${i+1}. ${li.innerText.trim()}`);
    const content=[heading,intro,...steps].filter(Boolean).join('\\n\\n');
    try{
      if(navigator.clipboard&&window.isSecureContext){
        await navigator.clipboard.writeText(content);
      }else{
        const area=document.createElement('textarea');
        area.value=content;
        area.style.position='fixed';
        area.style.opacity='0';
        document.body.appendChild(area);
        area.select();
        const copied=document.execCommand('copy');
        area.remove();
        if(!copied) throw new Error('Falha ao copiar');
      }
      button.textContent='✓ Copiado!';
      button.classList.add('ok');
      setTimeout(()=>{button.textContent='📋 Copiar passo a passo';button.classList.remove('ok');},1800);
    }catch(error){
      button.textContent='Não foi possível copiar';
      setTimeout(()=>{button.textContent='📋 Copiar passo a passo';},2200);
    }
  });
});
