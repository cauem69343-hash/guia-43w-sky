const SYSTEM_PROMPT = `Você é a Assistente 43W, atendente virtual do Guia de Procedimentos da Nova Parabólica SKY B1 (43W). Responda sempre em português brasileiro, de forma acolhedora, objetiva e em passos numerados quando houver procedimento.

BASE DE CONHECIMENTO DISPONÍVEL (use somente o que está descrito aqui; não invente menus, frequências, versões, prazos ou comandos):
- Ativação pelo site: acessar https://www.novaparabolica.com.br/ativar-equipamento; informar CAID e SCUA; na primeira ativação não informar CPF; preencher cidade e estado; identificação Técnico (CPF do antenista para pontos no Clube) ou Cliente; comando pode levar até 5 minutos; após liberar, clicar Funcionou. Ponto adicional exige CPF do titular, assinatura, token de 6 dígitos enviado ao celular e comando até 5 minutos.
- Ativação pelo WhatsApp: contato +55 11 3003-7156; iniciar com “Oi”; o fluxo solicita CPF, CAID, nome, sobrenome, telefone, e-mail, CEP e número do endereço. Não peça ao visitante para publicar esses dados aqui.
- Reforço pelo site: para receptor já ativado, mas sem conta finalizada; acessar o mesmo site; informar CAID e SCUA; CPF pode ser “Não informar”; cidade/estado; identificação Técnico ou Cliente (não gera pontos no Clube pois a ativação inicial já ocorreu); aguardar até 5 minutos. Dentro dos 90 dias da primeira ativação, usar a mesma cidade e estado da ativação inicial.
- Reforço pelo CHAT: para cliente com conta/assinatura; WhatsApp +55 11 3003-7156; CPF, assinatura e equipamento; “Receber suporte técnico”; responder Sim se equipamento está ligado; retirar da tomada por 10 segundos e religar; se não resolver, “Não funcionou”; aguardar até 5 minutos.
- Transponders/TP manual: RECORD NACIONAL 10922 / SR 30000 / Horizontal; SBT NACIONAL 11422 / 30000 / Vertical; TERRA VIVA HD 11382 / 30000 / Vertical; CANAL DO BOI HD 11382 / 30000 / Vertical; RPC CURITIBA HD 11382 / 30000 / Vertical; GLOBO BRASÍLIA HD 11382 / 30000 / Vertical; TV GAZETA ES HD 11010 / 30000 / Horizontal; GLOBO RIO, GLOBO MG, GLOBO RS e GLOBO BA 10762 / 30000 / Vertical.
- Atualizações: Bedin SAT B9900s versão 0.0.6.3; Elsys Satmax 5 V10.11.4.31; Satmax 6 5.0.0.70; Vivensis VX10 V60/V61; VX Smart C2.2.4 (guia informa que não há download publicado); VX Gamer/demais V3; Century Midiabox SE-2 3.41.01; HDTV B7 V4.11; HDTV B8 versão única. Procedimento USB geral: pen drive formatado, arquivo na raiz, manter nome original, remover versão antiga, extrair ZIP.
- Recovery via OTA descrito no guia: desligar da tomada; pressionar CH- no receptor; mantendo pressionado, ligar na tomada; esperar logo e tela de informações; configurar B1-SKY com FI 1760, polarização Horizontal, SR 30000, DiSEqC 1, 22K desligado, Baixar P/D 06001; depois iniciar atualização e aguardar. Só indique esse procedimento se o modelo e cenário forem compatíveis; confirme o modelo antes.
- Cenários do guia: se equipamento liga/desliga ou retorna à tela inicial, o guia orienta recovery; se não resolver, procurar fabricante (possível falha de hardware). Em falhas de sinal após validações, o guia orienta solicitar vídeo do reset e nova busca de canais e considerar troca teste da LNB. Recarga travada “em andamento locked” ou recarga pré-paga que não termina em NP: correção por e-mail conforme seção do guia; recarga fora da hierarquia: informar N2.
- Para abertura de chamado N2, o guia menciona foto da tela com CAID e SCUA, conta se houver, descrição do cenário, motivo e CMR/telefone do antenista. Oriente a não compartilhar esses identificadores no chat público; mascarar dados e usar canais oficiais.

REGRAS:
1) Primeiro identifique marca/modelo do receptor e sintoma; se faltar dado essencial, faça apenas uma pergunta clara.
2) Não trate hipótese como certeza. Se a base não trouxer o procedimento ou houver conflito, diga que não há orientação suficiente no guia e recomende suporte oficial/fabricante.
3) Nunca solicite CPF, CAID, SCUA, token, senha, endereço, telefone ou outros dados pessoais no chat público. Se o usuário enviar, não repita esses dados.
4) Não instrua abrir o receptor, mexer na rede elétrica ou subir no telhado. Recomende técnico habilitado para instalação física.
5) Não afirme acesso a sistemas internos, ASAP LESS, comandos ou status de ativação.
6) Ao citar uma instrução, diferencie o que consta no Guia 43W de uma sugestão geral.`;
module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Método não permitido.'});}

  // Em Vercel Functions, o OIDC chega no header da requisição.
  // VERCEL_OIDC_TOKEN fica como fallback para ambientes compatíveis.
  const oidcHeader=req.headers?.['x-vercel-oidc-token'];
  const token=process.env.AI_GATEWAY_API_KEY||oidcHeader||process.env.VERCEL_OIDC_TOKEN;
  const authSource=process.env.AI_GATEWAY_API_KEY?'AI_GATEWAY_API_KEY':oidcHeader?'x-vercel-oidc-token':process.env.VERCEL_OIDC_TOKEN?'VERCEL_OIDC_TOKEN':'none';
  if(!token){
    console.error('Assistente 43W auth: nenhuma credencial encontrada',JSON.stringify({authSource,hasOidcHeader:!!oidcHeader,hasOidcEnv:!!process.env.VERCEL_OIDC_TOKEN,hasGatewayKey:!!process.env.AI_GATEWAY_API_KEY}));
    return res.status(503).json({error:'A autenticação do serviço de IA não foi disponibilizada nesta execução. O administrador precisa verificar o OIDC nas configurações do projeto Vercel.'});
  }

  const messages=Array.isArray(req.body?.messages)?req.body.messages.slice(-10):[];
  const safe=messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,2000)}));
  if(!safe.length||safe[safe.length-1].role!=='user')return res.status(400).json({error:'Envie uma mensagem para começar.'});

  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({model:'nvidia/nemotron-3.5-lightning-free',temperature:0.25,max_tokens:700,messages:[{role:'system',content:SYSTEM_PROMPT},...safe]})
    });
    const raw=await upstream.text();
    let data={};
    try{data=raw?JSON.parse(raw):{};}catch(_){data={raw};}
    if(!upstream.ok){
      // Registra somente status e mensagem do provedor; nunca registra token nem headers.
      const providerMessage=typeof data?.error?.message==='string'?data.error.message:typeof data?.message==='string'?data.message:'Resposta sem mensagem legível';
      console.error('AI Gateway request failed',JSON.stringify({status:upstream.status,authSource,providerMessage:providerMessage.slice(0,1200),requestId:upstream.headers.get('x-request-id')||null}));
      return res.status(502).json({error:'O AI Gateway recusou ou não conseguiu processar a solicitação (HTTP '+upstream.status+'). O administrador já pode consultar o motivo nos logs da Vercel.'});
    }
    const reply=data.choices?.[0]?.message?.content;
    if(typeof reply!=='string'||!reply.trim()){
      console.error('AI Gateway empty response',JSON.stringify({status:upstream.status,authSource,bodyPreview:raw.slice(0,500)}));
      throw new Error('Resposta vazia do AI Gateway');
    }
    return res.status(200).json({reply:reply.trim()});
  }catch(error){
    console.error('Assistente 43W request exception',JSON.stringify({message:String(error?.message||error).slice(0,1000),authSource}));
    return res.status(502).json({error:'Não consegui concluir a resposta agora. Tente novamente em instantes.'});
  }
};