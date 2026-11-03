(() => {
  'use strict';
  const dados = Array.isArray(window.regionalDados) ? window.regionalDados : [];
  const uf = document.getElementById('regionalUF');
  const cidade = document.getElementById('regionalCidade');
  const sugestoes = document.getElementById('regionalSugestoes');
  const resultado = document.getElementById('regionalResultado');
  const naoEncontrado = document.getElementById('regionalNaoEncontrado');
  const consultarBtn = document.getElementById('regionalConsultar');
  const tbody = document.getElementById('regionalDados');

  if (!uf || !cidade || !sugestoes || !resultado || !naoEncontrado || !consultarBtn || !tbody) return;

  const norm = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleUpperCase('pt-BR');

  [...new Set(dados.map(item => item.UF).filter(Boolean))]
    .sort()
    .forEach(estado => {
      const option = document.createElement('option');
      option.value = estado;
      option.textContent = estado;
      uf.appendChild(option);
    });

  function limparResultado() {
    resultado.style.display = 'none';
    naoEncontrado.style.display = 'none';
    tbody.replaceChildren();
  }

  function atualizarSugestoes() {
    const estado = uf.value;
    const termo = norm(cidade.value);
    sugestoes.replaceChildren();
    if (!estado) return;

    dados
      .filter(item => item.UF === estado && (!termo || norm(item.CIDADE).includes(termo)))
      .slice(0, 100)
      .forEach(item => {
        const option = document.createElement('option');
        option.value = item.CIDADE;
        sugestoes.appendChild(option);
      });
  }

  function consultar() {
    const item = dados.find(registro =>
      registro.UF === uf.value && norm(registro.CIDADE) === norm(cidade.value)
    );
    tbody.replaceChildren();

    if (!item) {
      resultado.style.display = 'none';
      naoEncontrado.style.display = 'block';
      return;
    }

    const row = document.createElement('tr');
    [
      'Regional/Regionalizado',
      'Globo C/ Recarga',
      'Globo S/ Recarga',
      'SEAC e TVRO',
      'SEAC e TVRO3',
      'SEAC e TVRO4'
    ].forEach(campo => {
      const cell = document.createElement('td');
      cell.textContent = item[campo] || '—';
      row.appendChild(cell);
    });

    tbody.appendChild(row);
    document.getElementById('regionalTituloResultado').textContent = `${item.CIDADE} / ${item.UF}`;
    document.getElementById('regionalQuantidade').textContent = '1 município encontrado';
    resultado.style.display = 'block';
    naoEncontrado.style.display = 'none';
  }

  uf.addEventListener('change', () => {
    cidade.value = '';
    cidade.disabled = !uf.value;
    consultarBtn.disabled = !uf.value;
    limparResultado();
    atualizarSugestoes();
    if (uf.value) cidade.focus();
  });

  cidade.addEventListener('input', () => {
    atualizarSugestoes();
    limparResultado();
  });
  cidade.addEventListener('keydown', event => {
    if (event.key === 'Enter') consultar();
  });
  consultarBtn.addEventListener('click', consultar);
})();