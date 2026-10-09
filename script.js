
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


/* ===== Minigame NP - Jogo da Forca 43W ===== */
(() => {
  const wordEl=document.getElementById('npHangWord');
  const keyboardEl=document.getElementById('npHangKeyboard');
  const newBtn=document.getElementById('npHangNew');
  const messageEl=document.getElementById('npHangMessage');
  const categoryEl=document.getElementById('npHangCategory');
  const errorsEl=document.getElementById('npHangErrors');
  const hintEl=document.getElementById('npHangHint');
  const winsEl=document.getElementById('npHangWins');
  const lossesEl=document.getElementById('npHangLosses');
  const streakEl=document.getElementById('npHangStreak');
  if(!wordEl||!keyboardEl||!newBtn) return;

  // Palavras baseadas nos assuntos, equipamentos, procedimentos e grades presentes no HTML do guia.
  const words=[
    ['NOVA PARABOLICA','Guia'],['PARABOLICA','Guia'],['SATELITE','Guia'],['SKY','Guia'],['QUARENTA E TRES W','43W'],
    ['RECEPTOR','Equipamentos'],['BEDIN SAT','Equipamentos'],['ELSYS','Equipamentos'],['VIVENSIS','Equipamentos'],['CENTURY','Equipamentos'],
    ['SOFTWARE','Procedimentos'],['ATUALIZACAO','Procedimentos'],['PEN DRIVE','Procedimentos'],['RECOVERY','Procedimentos'],['OTA','Procedimentos'],
    ['ATIVACAO','Procedimentos'],['SINAL','Procedimentos'],['CAID','Ativação'],['SCUA','Ativação'],['RECARGA','Recargas'],
    ['TVRO','Grade de canais'],['POP','Grade de canais'],['SUPER','Grade de canais'],['TOP','Grade de canais'],['CANAL','Grade de canais'],
    ['GLOBO','Grade de canais'],['RECORD TV','Grade de canais'],['SBT','Grade de canais'],['BAND','Grade de canais'],['REDE TV','Grade de canais'],
    ['JOVEM PAN NEWS','Grade de canais'],['CNN BRASIL','Grade de canais'],['TV BRASIL','Grade de canais'],['CANAL RURAL','Grade de canais'],
    ['TELECINE','Recargas'],['PREMIERE','Recargas'],['COMBATE','Recargas'],['SPORTV','Grade de canais'],['FUTURA','Grade de canais'],
    ['SUGESTOES','Guia']
  ];
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let current=null, guessed=new Set(), errors=0, running=false;
  let wins=0, losses=0, streak=0;

  const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  function masked(){
    return [...current.word].map(ch=>ch===' ' ? '•' : guessed.has(normalize(ch)) ? ch : '_').join(' ');
  }
  function renderWord(){wordEl.textContent=masked();}
  function renderKeyboard(){
    keyboardEl.innerHTML='';
    for(const letter of alphabet){
      const b=document.createElement('button');
      b.type='button'; b.className='hangman-key'; b.textContent=letter;
      const used=guessed.has(letter);
      b.disabled=!running||used;
      if(used) b.classList.add(current.wordNormalized.includes(letter)?'correct':'wrong');
      b.addEventListener('click',()=>guess(letter));
      keyboardEl.appendChild(b);
    }
  }
  function updateDrawing(){
    const parts=['.hg-head','.hg-body','.hg-arm-left','.hg-arm-right','.hg-leg-left','.hg-leg-right'];
    parts.forEach((sel,i)=>{const el=document.querySelector(sel);if(el) el.style.opacity=errors>i?'1':'0';});
  }
  function updateStats(){winsEl.textContent=wins;lossesEl.textContent=losses;streakEl.textContent=streak;}
  function isComplete(){return [...current.wordNormalized].filter(c=>/[A-Z]/.test(c)).every(c=>guessed.has(c));}
  function finish(win){
    running=false;
    if(win){wins++;streak++;messageEl.textContent=`🎉 Parabéns! Você descobriu “${current.word}”.`;}
    else {losses++;streak=0;messageEl.textContent=`❌ Fim de jogo! A palavra era “${current.word}”.`;}
    updateStats();renderWord();renderKeyboard();updateDrawing();
  }
  function guess(letter){
    if(!running||guessed.has(letter)) return;
    guessed.add(letter);
    if(!current.wordNormalized.includes(letter)) errors++;
    renderWord();renderKeyboard();updateDrawing();errorsEl.textContent=errors;
    if(isComplete()) return finish(true);
    if(errors>=6) return finish(false);
    messageEl.textContent=current.wordNormalized.includes(letter)?'✅ Boa! Essa letra faz parte da palavra.':'❌ Essa letra não aparece na palavra.';
  }
  function newWord(){
    const available=words.filter(w=>!current||w[0]!==current.word);
    const pick=available[Math.floor(Math.random()*available.length)];
    current={word:pick[0],category:pick[1],wordNormalized:normalize(pick[0])};
    guessed=new Set();errors=0;running=true;
    categoryEl.textContent=`Categoria: ${current.category}`;
    hintEl.textContent=current.word.length>10?'expressão do guia':'palavra-chave';
    errorsEl.textContent='0';messageEl.textContent='Sua vez! Escolha uma letra.';
    renderWord();renderKeyboard();updateDrawing();
  }
  newBtn.addEventListener('click',newWord);
  updateStats();renderKeyboard();updateDrawing();
})();

/* Grade de canais: os PDFs são apresentados diretamente no HTML. */

/* ===== Área exclusiva com senha ===== */
(() => {
  const lockBtn = document.getElementById('exclusiveLock');
  const modal = document.getElementById('passwordModal');
  const closeBtn = document.getElementById('passwordClose');
  const passwordInput = document.getElementById('exclusivePassword');
  const enterBtn = document.getElementById('passwordEnter');
  const errorEl = document.getElementById('passwordError');
  const panel = document.getElementById('exclusivePanel');
  const logoutBtn = document.getElementById('exclusiveLogout');
  if(!lockBtn || !modal || !passwordInput || !enterBtn || !panel) return;

  const PASSWORD = '1597';

  function openModal(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    passwordInput.value='';
    errorEl.textContent='';
    setTimeout(()=>passwordInput.focus(),50);
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }
  function unlock(){
    if(passwordInput.value === PASSWORD){
      sessionStorage.setItem('npExclusiveUnlocked','1');
      panel.classList.add('unlocked');
      panel.setAttribute('aria-hidden','false');
      closeModal();
      panel.scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      errorEl.textContent='Senha incorreta. Tente novamente.';
      passwordInput.select();
    }
  }
  function lock(){
    sessionStorage.removeItem('npExclusiveUnlocked');
    panel.classList.remove('unlocked');
    panel.setAttribute('aria-hidden','true');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  lockBtn.addEventListener('click',()=>{
    if(sessionStorage.getItem('npExclusiveUnlocked')==='1'){
      panel.classList.add('unlocked');
      panel.setAttribute('aria-hidden','false');
      panel.scrollIntoView({behavior:'smooth',block:'start'});
    }else openModal();
  });
  closeBtn.addEventListener('click',closeModal);
  enterBtn.addEventListener('click',unlock);
  passwordInput.addEventListener('keydown',e=>{if(e.key==='Enter') unlock(); if(e.key==='Escape') closeModal();});
  modal.addEventListener('click',e=>{if(e.target===modal) closeModal();});
  logoutBtn?.addEventListener('click',lock);
})();
