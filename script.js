
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

panels.forEach((p,i)=>{
  const opt=document.createElement('option');
  opt.value=p.id;
  opt.textContent=tabs[i]?.innerText.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'')||p.querySelector('h2').innerText;
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
