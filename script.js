
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
    if(running){dropCounter+=dt;const speed=Math.max(90,850-(level-1)*70);if(dropCounter>speed)drop();draw();raf=requestAnimationFrame(loop);} else draw();
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
