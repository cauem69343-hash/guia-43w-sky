
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


/* ===== Minigame NP - Tetris 43W ===== */
(() => {
  const canvas = document.getElementById('npTetris');
  const nextCanvas = document.getElementById('npNext');
  if (!canvas || !nextCanvas) return;
  const ctx = canvas.getContext('2d');
  const nextCtx = nextCanvas.getContext('2d');
  const scoreEl = document.getElementById('npScore');
  const linesEl = document.getElementById('npLines');
  const levelEl = document.getElementById('npLevel');
  const messageEl = document.getElementById('npMessage');
  const startBtn = document.getElementById('npStart');

  const COLS=10, ROWS=20, CELL=30;
  const brands=[
    {name:'Bedin SAT', short:'BEDIN', body:'#f06a00', top:'#ff9b55', trim:'#ffd6bd'},
    {name:'Elsys', short:'ELSYS', body:'#0e6ea8', top:'#3e9fd1', trim:'#ccecff'},
    {name:'Vivensis', short:'VIVENSIS', body:'#16834b', top:'#45b878', trim:'#d1f4e1'},
    {name:'Century', short:'CENTURY', body:'#6c4aa0', top:'#9c79cf', trim:'#eadffd'}
  ];
  // Tetromino shapes. Every cell is rendered as a mini receiver.
  const SHAPES=[
    [[1,1,1,1]],
    [[1,0,0],[1,1,1]],
    [[0,0,1],[1,1,1]],
    [[1,1],[1,1]],
    [[0,1,1],[1,1,0]],
    [[0,1,0],[1,1,1]],
    [[1,1,0],[0,1,1]]
  ];
  let board, current, nextPiece, score=0, lines=0, level=1, dropCounter=0, lastTime=0, running=false, gameOver=false, raf=0;

  function emptyBoard(){return Array.from({length:ROWS},()=>Array(COLS).fill(null));}
  function clone(m){return m.map(r=>r.slice());}
  function rotate(m){return m[0].map((_,i)=>m.map(row=>row[i]).reverse());}
  function randomPiece(){
    const shape=clone(SHAPES[Math.floor(Math.random()*SHAPES.length)]);
    return {shape, brand:Math.floor(Math.random()*brands.length), x:Math.floor((COLS-shape[0].length)/2), y:0};
  }
  function collides(p,ox=0,oy=0,shape=p.shape){
    for(let y=0;y<shape.length;y++) for(let x=0;x<shape[y].length;x++) if(shape[y][x]){
      const bx=p.x+x+ox, by=p.y+y+oy;
      if(bx<0||bx>=COLS||by>=ROWS) return true;
      if(by>=0 && board[by][bx]) return true;
    }
    return false;
  }
  function merge(){
    for(let y=0;y<current.shape.length;y++) for(let x=0;x<current.shape[y].length;x++) if(current.shape[y][x]){
      if(current.y+y>=0) board[current.y+y][current.x+x]=current.brand;
    }
  }
  function clearLines(){
    let cleared=0;
    outer: for(let y=ROWS-1;y>=0;y--){
      for(let x=0;x<COLS;x++) if(board[y][x]===null) continue outer;
      board.splice(y,1); board.unshift(Array(COLS).fill(null)); cleared++; y++;
    }
    if(cleared){
      lines+=cleared;
      score += [0,100,300,500,800][cleared]*level;
      level=Math.floor(lines/10)+1;
      updateStats();
    }
  }
  function spawn(){
    current=nextPiece||randomPiece(); nextPiece=randomPiece();
    if(collides(current)) endGame();
    drawNext();
  }
  function lock(){merge();clearLines();spawn();dropCounter=0;}
  function drop(){
    if(!running) return;
    if(!collides(current,0,1)) current.y++;
    else lock();
  }
  function hardDrop(){
    if(!running) return;
    let n=0; while(!collides(current,0,1)){current.y++;n++;}
    score+=n*2; updateStats(); lock();
  }
  function move(dx){if(running&&!collides(current,dx,0)) current.x+=dx;}
  function turn(){
    if(!running) return;
    const r=rotate(current.shape), oldX=current.x;
    for(const kick of [0,-1,1,-2,2]){current.x=oldX+kick;if(!collides(current,0,0,r)){current.shape=r;return;}}
    current.x=oldX;
  }
  function updateStats(){scoreEl.textContent=score;linesEl.textContent=lines;levelEl.textContent=level;}
  function receiver(ctx2,x,y,size,brandIndex,alpha=1){
    const b=brands[brandIndex]; const pad=Math.max(2,size*.08), w=size-pad*2, h=size*.72;
    ctx2.save();ctx2.globalAlpha=alpha;
    ctx2.fillStyle='rgba(0,0,0,.18)';ctx2.fillRect(x+pad+2,y+size*.12,w,h);
    ctx2.fillStyle=b.body;ctx2.strokeStyle='rgba(255,255,255,.35)';ctx2.lineWidth=1;
    ctx2.beginPath();ctx2.roundRect(x+pad,y+size*.08,w,h,Math.max(2,size*.08));ctx2.fill();ctx2.stroke();
    ctx2.fillStyle=b.top;ctx2.fillRect(x+pad+2,y+size*.10,w-4,Math.max(3,size*.12));
    ctx2.fillStyle=b.trim;ctx2.fillRect(x+pad+size*.13,y+size*.40,w-size*.26,Math.max(2,size*.07));
    ctx2.fillStyle='#fff';ctx2.font=`900 ${Math.max(5,size*.17)}px Arial`;ctx2.textAlign='center';ctx2.fillText(b.short,x+size/2,y+size*.58);
    ctx2.fillStyle='#dce8f0';ctx2.beginPath();ctx2.arc(x+pad+w-size*.13,y+size*.58,Math.max(1.3,size*.035),0,Math.PI*2);ctx2.fill();
    ctx2.restore();
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#102b45';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;
    for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,canvas.height);ctx.stroke();}
    for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(canvas.width,y*CELL);ctx.stroke();}
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(board[y][x]!==null) receiver(ctx,x*CELL,y*CELL,CELL,board[y][x]);
    if(current){for(let y=0;y<current.shape.length;y++) for(let x=0;x<current.shape[y].length;x++) if(current.shape[y][x]) receiver(ctx,(current.x+x)*CELL,(current.y+y)*CELL,CELL,current.brand,.94);}
    if(gameOver){ctx.fillStyle='rgba(8,22,35,.78)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 26px Arial';ctx.fillText('FIM DE JOGO',canvas.width/2,canvas.height/2-10);ctx.font='600 14px Arial';ctx.fillText('Clique em Novo jogo',canvas.width/2,canvas.height/2+20);}
  }
  function drawNext(){
    nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);nextCtx.fillStyle='#fff8f3';nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
    const p=nextPiece;if(!p)return;
    const size=30,w=p.shape[0].length*size,h=p.shape.length*size;
    const ox=(nextCanvas.width-w)/2,oy=(nextCanvas.height-h)/2;
    for(let y=0;y<p.shape.length;y++)for(let x=0;x<p.shape[y].length;x++)if(p.shape[y][x]) receiver(nextCtx,ox+x*size,oy+y*size,size,p.brand);
  }
  function endGame(){running=false;gameOver=true;messageEl.textContent='Fim de jogo. Clique em “Novo jogo” para tentar novamente.';}
  function loop(time=0){
    const dt=time-lastTime;lastTime=time;
    if(running){dropCounter+=dt;const speed=Math.max(400,1400-(level-1)*100);if(dropCounter>speed)drop();draw();raf=requestAnimationFrame(loop);} else draw();
  }
  function start(){
    cancelAnimationFrame(raf);board=emptyBoard();score=0;lines=0;level=1;gameOver=false;running=true;nextPiece=randomPiece();spawn();updateStats();messageEl.textContent='Use as setas para jogar. Boa sorte!';lastTime=performance.now();dropCounter=0;raf=requestAnimationFrame(loop);
  }
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('sec13')?.classList.contains('active')) return;
    if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowDown'){drop();score+=1;updateStats();}else if(e.key==='ArrowUp')turn();else if(e.key===' ')hardDrop();
  });
  startBtn.addEventListener('click',start);
  board=emptyBoard();current=null;nextPiece=randomPiece();drawNext();draw();
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
