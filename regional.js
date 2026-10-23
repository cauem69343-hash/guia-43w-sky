(() => {
  const dados = window.regionalDados || [];
  const uf = document.getElementById('regionalUF');
  const cidade = document.getElementById('regionalCidade');
  const sugestoes = document.getElementById('regionalSugestoes');
  const resultado = document.getElementById('regionalResultado');
  const naoEncontrado = document.getElementById('regionalNaoEncontrado');
  const consultarBtn = document.getElementById('regionalConsultar');
  if (!uf || !cidade || !sugestoes || !resultado || !naoEncontrado || !consultarBtn) return;
  const campos = ['Globo C/ Recarga','Globo S/ Recarga','SEAC e TVRO','SEAC e TVRO3','SEAC e TVRO4'];
  const estados = [...new Set(dados.map(x => x.UF))].sort();
  estados.forEach(x => { const o=document.createElement('option'); o.value=x; o.textContent=x; uf.appendChild(o); });
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleUpperCase('pt-BR');
  function atualizarSugestoes(){
    const estado=uf.value, termo=norm(cidade.value);
    sugestoes.innerHTML='';
    if(!estado) return;
    dados.filter(x => x.UF===estado && (!termo || norm(x.CIDADE).includes(termo))).slice(0,80).forEach(x => { const o=document.createElement('option'); o.value=x.CIDADE; sugestoes.appendChild(o); });
  }
  function consultar(){
    const item=dados.find(x => x.UF===uf.value && norm(x.CIDADE)===norm(cidade.value));
    const tbody=document.getElementById('regionalDados'); tbody.innerHTML='';
    if(!item){ resultado.style.display='none'; naoEncontrado.style.display='block'; return; }
    const tr=document.createElement('tr');
    campos.forEach(c => { const td=document.createElement('td'); td.textContent=item[c] || '—'; tr.appendChild(td); });
    tbody.appendChild(tr);
    document.getElementById('regionalTituloResultado').textContent=item.CIDADE+' / '+item.UF;
    document.getElementById('regionalQuantidade').textContent='1 cidade encontrada';
    resultado.style.display='block'; naoEncontrado.style.display='none';
  }
  uf.addEventListener('change',()=>{cidade.value=''; atualizarSugestoes(); resultado.style.display='none'; naoEncontrado.style.display='none'; cidade.focus();});
  cidade.addEventListener('input',atualizarSugestoes);
  cidade.addEventListener('keydown',e=>{if(e.key==='Enter') consultar();});
  consultarBtn.addEventListener('click',consultar);
  // Exemplo inicial de Jaguariúna/SP, disponível na planilha.
  uf.value='SP'; cidade.value='JAGUARIUNA'; atualizarSugestoes(); consultar();
})();
