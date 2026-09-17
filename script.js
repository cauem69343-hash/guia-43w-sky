
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

/* ===== Grade de canais ===== */
(() => {
  const gradeData = {"tvro": [["TV MANÁ", "10"], ["TV PADRE CÍCERO", "12"], ["CNT RIO DE JANEIRO", "15"], ["ISTV", "18"], ["TV FELIZ", "20"], ["PLAYTV+", "21"], ["WOOHOO ESPORTES", "22"], ["YPÊ TV", "23"], ["TV INFINITO", "24"], ["VIVAX TV", "25"], ["TV PARANÁ TURISMO", "27"], ["TV MEIO NORTE", "29"], ["RBTV", "32"], ["BRASIL NEWS", "33"], ["TV HORIZONTE", "74"], ["TV VERDADE", "76"], ["BOA VONTADE TV", "77"], ["REDE GÊNESIS", "78"], ["SBN", "82"], ["REDE SUPER", "83"], ["TV IMACULADA", "84"], ["TV CRISTÃ MARANATA", "87"], ["TV DIÁRIO FORTALEZA", "100"], ["TV CENTRO SUL CEARÁ", "101"], ["CANAL 26", "102"], ["GAZIN", "111"], ["ULTRAFARMA", "112"], ["AGROPLUS TV", "119"], ["TV MILAGRO", "125"], ["TV CULTURA", "2"], ["REDE MUNDIAL", "68"], ["RIT", "67"], ["GLOBO", "5"], ["REDE VIDA", "6"], ["RECORD TV", "7"], ["CANÇÃO NOVA", "69"], ["SBT", "4"], ["TV APARECIDA", "70"], ["BAND", "13"], ["CNT HD", "14"], ["REDE TV", "9"], ["XSPORTS TV", "16"], ["REDE BRASIL", "34"], ["TV PAI ETERNO", "72"], ["SBT NEWS HD", "96"], ["RECORD NEWS HD", "97"], ["RBI", "8"], ["CANAL EDUCAÇÃO", "57"], ["TV CÂMARA", "134"], ["TV BRASIL", "30"], ["TV JUSTIÇA", "135"], ["CANAL GOV", "136"], ["TV SENADO", "137"], ["TV NOVO TEMPO HD", "73"], ["FUTURA HD", "3"], ["UNIVESP TV", "59"], ["TV ARTES", "58"], ["CANAL UOL", "26"], ["CENTRAL TV", "17"], ["AGRO CANAL", "121"], ["CNBC", "104"], ["CANAL RURAL", "124"], ["CANAL DO BOI HD", "122"], ["CANAL DO CRIADOR", "123"], ["C3 TV", "31"], ["TERRA VIVA HD", "120"], ["TV GAZETA", "11"], ["JOVEM PAN NEWS HD", "98"], ["CNN BRASIL HD", "99"], ["CGTN HD", "103"], ["FONTE TV", "86"], ["TV EVANGELIZAR", "80"], ["CANAL 21 HD", "19"], ["RÁDIO JOVEM PAN NEWS", "144"], ["RÁDIO JOVEM PAN FM", "145"], ["RÁDIO RFI", "146"], ["RÁDIO ITATIAIA AM/FM", "147"], ["RÁDIO VERDES MARES", "148"], ["RÁDIO NERY FM", "156"], ["RÁDIO CLUBE FM", "149"], ["RÁDIO BANDNEWS", "150"], ["RÁDIO BAND FM", "151"], ["RÁDIO BANDEIRANTES", "152"], ["RÁDIO NATIVA", "153"], ["RÁDIO EVANGELIZAR POP", "154"], ["RÁDIO EVANGELIZAR MAIS", "155"]], "pop": [["TV MANÁ", "10"], ["TV PADRE CÍCERO", "12"], ["CNT RIO DE JANEIRO", "15"], ["ISTV", "18"], ["TV FELIZ", "20"], ["PLAYTV+", "21"], ["WOOHOO ESPORTES", "22"], ["YPÊ TV", "23"], ["TV INFINITO", "24"], ["VIVAX TV", "25"], ["TV PARANÁ TURISMO", "27"], ["CÂMARA LEGISLATIVA DO DF", "28"], ["TV MEIO NORTE", "29"], ["RBTV", "432"], ["BRASIL NEWS", "433"], ["TV HORIZONTE", "74"], ["TV VERDADE", "76"], ["BOA VONTADE TV", "77"], ["REDE GÊNESIS", "78"], ["SBN", "82"], ["REDE SUPER", "83"], ["TV IMACULADA", "84"], ["TV CRISTÃ MARANATA", "587"], ["TV DIÁRIO FORTALEZA", "100"], ["TV CENTRO SUL CEARÁ", "101"], ["CANAL 26", "102"], ["GAZIN", "111"], ["ULTRAFARMA", "112"], ["AGROPLUS TV", "119"], ["TV MILAGRO", "125"], ["TV CULTURA", "402"], ["REDE MUNDIAL", "585"], ["RIT", "403"], ["GLOBO", "404/405/410/412"], ["REDE VIDA", "406"], ["RECORD TV", "407"], ["CANÇÃO NOVA", "408"], ["SBT", "409"], ["TV APARECIDA", "411"], ["BAND", "413"], ["CNT HD", "414"], ["REDE TV", "415"], ["XSPORTS TV", "416"], ["REDE BRASIL", "417"], ["TV PAI ETERNO", "418"], ["SBT NEWS HD", "580"], ["RECORD NEWS HD", "419"], ["RBI", "420"], ["CANAL EDUCAÇÃO", "421"], ["TV CÂMARA", "422"], ["TV BRASIL", "423"], ["TV JUSTIÇA", "424"], ["CANAL GOV", "425"], ["TV SENADO", "426"], ["TV COMUNITARIA", "428"], ["TV NOVO TEMPO HD", "431"], ["FUTURA HD", "434"], ["GE TV HD", "436"], ["UNIVESP TV", "475"], ["TV ARTES", "482"], ["CANAL UOL", "488"], ["CENTRAL TV", "553"], ["AGRO CANAL", "554"], ["CNBC", "562"], ["CANAL RURAL", "564"], ["CANAL DO BOI HD", "565"], ["CANAL DO CRIADOR", "566"], ["C3 TV", "570"], ["TERRA VIVA HD", "563"], ["TV GAZETA", "575"], ["JOVEM PAN NEWS HD", "576"], ["CNN BRASIL HD", "577"], ["CGTN HD", "578"], ["FONTE TV", "584"], ["TV EVANGELIZAR", "586"], ["CANAL 21 HD", "611"], ["RÁDIO CBN", "776"], ["RÁDIO CBN RJ", "777"], ["RÁDIO CBN BSB", "778"], ["RÁDIO CBN BH", "779"], ["RÁDIO BH FM", "782"], ["RÁDIO JOVEM PAN NEWS", "783"], ["RÁDIO JOVEM PAN FM", "784"], ["RÁDIO GAÚCHA", "785"], ["RÁDIO RFI", "786"], ["RÁDIO GLOBO RJ", "787"], ["RÁDIO ITATIAIA AM/FM", "789"], ["RÁDIO VERDES MARES", "790"], ["RÁDIO NERY FM", "791"], ["RÁDIO CLUBE FM", "792"], ["RÁDIO BANDNEWS", "793"], ["RÁDIO BAND FM", "794"], ["RÁDIO BANDEIRANTES", "795"], ["RÁDIO NATIVA", "796"], ["RÁDIO EVANGELIZAR POP", "797"], ["RÁDIO EVANGELIZAR MAIS", "798"]], "super": [["SBT", "409"], ["TV APARECIDA", "411"], ["BAND", "413"], ["CNT HD", "414"], ["REDE TV", "415"], ["XSPORTS TV", "416"], ["REDE BRASIL", "417"], ["TV PAI ETERNO", "418"], ["SBT NEWS HD", "580"], ["RECORD NEWS HD", "419"], ["RBI", "420"], ["CANAL EDUCAÇÃO", "421"], ["TV CÂMARA", "422"], ["TV BRASIL", "423"], ["TV JUSTIÇA", "424"], ["CANAL GOV", "425"], ["TV SENADO", "426"], ["TV COMUNITARIA", "428"], ["TV NOVO TEMPO HD", "431"], ["FUTURA HD", "434"], ["GE TV HD", "436"], ["SPORTV 2 HD", "438"], ["GLOBONEWS HD", "440"], ["GNT HD", "441"], ["MULTISHOW HD", "442"], ["GLOBOPLAY NOVELAS HD", "443"], ["MODO VIAGEM HD", "444"], ["DISCOVERY KIDS HD", "450"], ["GLOOB HD", "456"], ["BOX KIDS HD", "458"], ["CARTOON NETWORK HD", "460"], ["DISCOVERY CHANNEL HD", "470"], ["UNIVESP TV", "475"], ["TV ARTES", "482"], ["TRAVEL BOX BRAZIL HD", "483"], ["CANAL UOL", "488"], ["MEGAPIX HD", "507"], ["TNT HD", "508"], ["CANAL BRASIL HD", "513"], ["SONY CHANNEL HD", "537"], ["WARNER CHANNEL HD", "539"], ["UNIVERSAL CHANNEL HD", "540"], ["CENTRAL TV", "553"], ["AGRO CANAL", "554"], ["PRIME BOX BRAZIL", "557"], ["PLAY TV", "561"], ["CNBC", "562"], ["CANAL RURAL", "564"], ["CANAL DO BOI HD", "565"], ["CANAL DO CRIADOR", "566"], ["FISH TV", "567"], ["C3 TV", "570"], ["TERRA VIVA HD", "563"], ["TV GAZETA", "575"], ["JOVEM PAN NEWS HD", "576"], ["CNN BRASIL HD", "577"], ["CGTN HD", "578"], ["FONTE TV", "584"], ["TV EVANGELIZAR", "586"], ["CANAL 21 HD", "611"], ["ÁUDIO KIDS", "701"], ["ÁUDIO MPB", "702"], ["ÁUDIO SOFT HITS", "703"], ["ÁUDIO FORRÓ", "704"], ["ÁUDIO SAMBA E PAGODE", "705"], ["ÁUDIO ANOS 2000", "706"], ["ÁUDIO SERTANEJO", "707"], ["ÁUDIO DISCO", "708"], ["ÁUDIO ROCK CLÁSSICO", "709"], ["ÁUDIO LOUNGE", "710"], ["ÁUDIO ROCK", "711"], ["ÁUDIO ANOS 80", "712"], ["ÁUDIO ELETRÔNICA", "713"], ["ÁUDIO FESTA", "714"], ["ÁUDIO POP HITS", "715"], ["ÁUDIO ANOS 60", "716"], ["ÁUDIO ANOS 70", "717"], ["ÁUDIO ANOS 90", "718"], ["ÁUDIO SERTANEJO UNIVERSITÁRIO", "719"], ["ÁUDIO REGGAE", "720"], ["ÁUDIO BLACK", "721"], ["ÁUDIO BLUES", "722"], ["ÁUDIO ROMÂNTICAS", "723"], ["ÁUDIO TELETEMA", "724"], ["ÁUDIO ESPECIAL", "725"], ["ÁUDIO GOSPEL", "726"], ["ÁUDIO TRILHA SONORA", "727"], ["ÁUDIO FUNK E RAP", "728"], ["ÁUDIO JAZZ", "729"], ["ÁUDIO METAL", "730"], ["ÁUDIO ROCK BRASIL", "731"], ["ÁUDIO MÚSICA CLÁSSICA", "732"], ["RÁDIO CBN", "776"], ["RÁDIO CBN RJ", "777"], ["RÁDIO CBN BSB", "778"], ["RÁDIO CBN BH", "779"], ["RÁDIO BH FM", "782"], ["RÁDIO JOVEM PAN NEWS", "783"], ["RÁDIO JOVEM PAN FM", "784"], ["RÁDIO GAÚCHA", "785"], ["RÁDIO RFI", "786"], ["RÁDIO GLOBO RJ", "787"], ["RÁDIO ITATIAIA AM/FM", "789"], ["RÁDIO VERDES MARES", "790"], ["RÁDIO NERY FM", "791"], ["RÁDIO CLUBE FM", "792"], ["RÁDIO BANDNEWS", "793"], ["RÁDIO BAND FM", "794"], ["RÁDIO BANDEIRANTES", "795"], ["RÁDIO NATIVA", "796"], ["RÁDIO EVANGELIZAR POP", "797"], ["RÁDIO EVANGELIZAR MAIS", "798"]], "top": [["TV MANÁ", "10"], ["TV PADRE CÍCERO", "12"], ["CNT RIO DE JANEIRO", "15"], ["ISTV", "18"], ["TV FELIZ", "20"], ["PLAYTV+", "21"], ["WOOHOO ESPORTES", "22"], ["YPÊ TV", "23"], ["TV INFINITO", "24"], ["VIVAX TV", "25"], ["TV PARANÁ TURISMO", "27"], ["CÂMARA LEGISLATIVA DO DF", "28"], ["TV MEIO NORTE", "29"], ["RBTV", "432"], ["BRASIL NEWS", "433"], ["TV HORIZONTE", "74"], ["TV VERDADE", "76"], ["BOA VONTADE TV", "77"], ["REDE GÊNESIS", "78"], ["SBN", "82"], ["REDE SUPER", "83"], ["TV IMACULADA", "84"], ["TV CRISTÃ MARANATA", "587"], ["TV DIÁRIO FORTALEZA", "100"], ["TV CENTRO SUL CEARÁ", "101"], ["CANAL 26", "102"], ["GAZIN", "111"], ["ULTRAFARMA", "112"], ["AGROPLUS TV", "119"], ["TV MILAGRO", "125"], ["TV CULTURA", "402"], ["REDE MUNDIAL", "585"], ["RIT", "403"], ["GLOBO", "404/405/410/412"], ["REDE VIDA", "406"], ["RECORD TV", "407"], ["CANÇÃO NOVA", "408"], ["SBT", "409"], ["TV APARECIDA", "411"], ["BAND", "413"], ["CNT HD", "414"], ["REDE TV", "415"], ["XSPORTS TV", "416"], ["REDE BRASIL", "417"], ["TV PAI ETERNO", "418"], ["SBT NEWS HD", "580"], ["RECORD NEWS HD", "419"], ["RBI", "420"], ["CANAL EDUCAÇÃO", "421"], ["TV CÂMARA", "422"], ["TV BRASIL", "423"], ["TV JUSTIÇA", "424"], ["CANAL GOV", "425"], ["TV SENADO", "426"], ["TV COMUNITARIA", "428"], ["TV NOVO TEMPO HD", "431"], ["FUTURA HD", "434"], ["GE TV HD", "436"], ["SPORTV 2 HD", "438"], ["GLOBONEWS HD", "440"], ["GNT HD", "441"], ["MULTISHOW HD", "442"], ["GLOBOPLAY NOVELAS HD", "443"], ["MODO VIAGEM HD", "444"], ["DISCOVERY KIDS HD", "450"], ["GLOOB HD", "456"], ["BOX KIDS HD", "458"], ["CARTOON NETWORK HD", "460"], ["DISCOVERY CHANNEL HD", "470"], ["UNIVESP TV", "475"], ["TV ARTES", "482"], ["TRAVEL BOX BRAZIL HD", "483"], ["CANAL UOL", "488"], ["MEGAPIX HD", "507"], ["TNT HD", "508"], ["CANAL BRASIL HD", "513"], ["SONY CHANNEL HD", "537"], ["WARNER CHANNEL HD", "539"], ["UNIVERSAL CHANNEL HD", "540"], ["CENTRAL TV", "553"], ["AGRO CANAL", "554"], ["PRIME BOX BRAZIL", "557"], ["PLAY TV", "561"], ["CNBC", "562"], ["CANAL RURAL", "564"], ["CANAL DO BOI HD", "565"], ["CANAL DO CRIADOR", "566"], ["FISH TV", "567"], ["C3 TV", "570"], ["TERRA VIVA HD", "563"], ["TV GAZETA", "575"], ["JOVEM PAN NEWS HD", "576"], ["CNN BRASIL HD", "577"], ["CGTN HD", "578"], ["FONTE TV", "584"], ["TV EVANGELIZAR", "586"], ["CANAL 21 HD", "611"], ["ÁUDIO KIDS", "701"], ["ÁUDIO MPB", "702"], ["ÁUDIO SOFT HITS", "703"], ["ÁUDIO FORRÓ", "704"], ["ÁUDIO SAMBA E PAGODE", "705"], ["ÁUDIO ANOS 2000", "706"], ["ÁUDIO SERTANEJO", "707"], ["ÁUDIO DISCO", "708"], ["ÁUDIO ROCK CLÁSSICO", "709"], ["ÁUDIO LOUNGE", "710"], ["ÁUDIO ROCK", "711"], ["ÁUDIO ANOS 80", "712"], ["ÁUDIO ELETRÔNICA", "713"], ["ÁUDIO FESTA", "714"], ["ÁUDIO POP HITS", "715"], ["ÁUDIO ANOS 60", "716"], ["ÁUDIO ANOS 70", "717"], ["ÁUDIO ANOS 90", "718"], ["ÁUDIO SERTANEJO UNIVERSITÁRIO", "719"], ["ÁUDIO REGGAE", "720"], ["ÁUDIO BLACK", "721"], ["ÁUDIO BLUES", "722"], ["ÁUDIO ROMÂNTICAS", "723"], ["ÁUDIO TELETEMA", "724"], ["ÁUDIO ESPECIAL", "725"], ["ÁUDIO GOSPEL", "726"], ["ÁUDIO TRILHA SONORA", "727"], ["ÁUDIO FUNK E RAP", "728"], ["ÁUDIO JAZZ", "729"], ["ÁUDIO METAL", "730"], ["ÁUDIO ROCK BRASIL", "731"], ["ÁUDIO MÚSICA CLÁSSICA", "732"], ["RÁDIO CBN", "776"], ["RÁDIO CBN RJ", "777"], ["RÁDIO CBN BSB", "778"], ["RÁDIO CBN BH", "779"], ["RÁDIO BH FM", "782"], ["RÁDIO JOVEM PAN NEWS", "783"], ["RÁDIO JOVEM PAN FM", "784"], ["RÁDIO GAÚCHA", "785"], ["RÁDIO RFI", "786"], ["RÁDIO GLOBO RJ", "787"], ["RÁDIO ITATIAIA AM/FM", "789"], ["RÁDIO VERDES MARES", "790"], ["RÁDIO NERY FM", "791"], ["RÁDIO CLUBE FM", "792"], ["RÁDIO BANDNEWS", "793"], ["RÁDIO BAND FM", "794"], ["RÁDIO BANDEIRANTES", "795"], ["RÁDIO NATIVA", "796"], ["RÁDIO EVANGELIZAR POP", "797"], ["RÁDIO EVANGELIZAR MAIS", "798"]]};
  const gradeTabs = [...document.querySelectorAll('.channel-grade-tab')];
  const gradeContent = document.getElementById('channelGradeContent');
  if (!gradeContent || !gradeTabs.length) return;

  function renderGrade(key) {
    const rows = gradeData[key] || [];
    gradeContent.innerHTML = `<div class="channel-grade-table-wrap"><table class="channel-grade-table"><thead><tr><th>Canal</th><th>Nº</th></tr></thead><tbody>${rows.map(([name, num]) => `<tr><td>${name}</td><td>${num}</td></tr>`).join('')}</tbody></table></div>`;
    gradeTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.grade === key));
  }
  gradeTabs.forEach(btn => btn.addEventListener('click', () => renderGrade(btn.dataset.grade)));
  renderGrade('tvro');
})();
