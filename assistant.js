(function(){
  const root=document.createElement('div');
  root.id='assistant43w';
  root.innerHTML=`
    <button class="assistant-launcher" id="assistantLauncher" aria-label="Abrir assistente 43W" aria-expanded="false">
      <span class="assistant-avatar-mini"><svg viewBox="0 0 100 100" role="img" aria-label="Assistente 43W"><circle cx="50" cy="50" r="49" fill="#fff0e8"/><path d="M16 94c2-22 14-31 34-31s32 9 34 31" fill="#ff741c"/><path d="M29 40c-5-25 10-34 23-34 20 0 29 14 23 38l-5 18H31z" fill="#34231f"/><ellipse cx="51" cy="39" rx="21" ry="25" fill="#c9825d"/><path d="M30 34c2-24 34-31 47-8-9-7-17-9-25-7-8 2-13 9-22 15" fill="#34231f"/><circle cx="43" cy="40" r="2" fill="#30211e"/><circle cx="59" cy="40" r="2" fill="#30211e"/><path d="M44 51q7 6 14 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M25 31q-7 3-5 15M77 31q7 3 5 15" fill="none" stroke="#26374a" stroke-width="5" stroke-linecap="round"/><path d="M26 72h48l8 22H18z" fill="#ff741c"/><text x="50" y="86" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">43W</text></svg></span>
      <span class="assistant-launcher-label">Precisa de ajuda?</span>
    </button>
    <section class="assistant-window" id="assistantWindow" aria-label="Chat com a assistente 43W" hidden>
      <header class="assistant-header"><div class="assistant-header-avatar">43W</div><div><strong>Assistente 43W</strong><small>Suporte Nova Parabólica</small></div><button id="assistantClose" aria-label="Fechar conversa">×</button></header>
      <div class="assistant-messages" id="assistantMessages" aria-live="polite"><div class="assistant-msg assistant-bot">Olá! 😊 Sou a assistente 43W. Conte o que está acontecendo com o receptor e vou ajudar você a encontrar o procedimento adequado.</div></div>
      <form class="assistant-form" id="assistantForm"><textarea id="assistantInput" rows="2" maxlength="2000" placeholder="Descreva o problema do equipamento..." required></textarea><button type="submit" id="assistantSend">Enviar</button></form>
      <p class="assistant-privacy">Não envie CPF, CAID, SCUA, senhas ou dados pessoais.</p>
    </section>`;
  document.body.appendChild(root);
  const win=root.querySelector('#assistantWindow'), launcher=root.querySelector('#assistantLauncher'), messages=root.querySelector('#assistantMessages'), input=root.querySelector('#assistantInput'), form=root.querySelector('#assistantForm'), send=root.querySelector('#assistantSend');
  const history=[];
  function open(){win.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();}
  function close(){win.hidden=true;launcher.setAttribute('aria-expanded','false');}
  launcher.addEventListener('click',()=>win.hidden?open():close());
  root.querySelector('#assistantClose').addEventListener('click',close);
  document.getElementById('assistantOpenInline')?.addEventListener('click',open);
  function bubble(text,who){const el=document.createElement('div');el.className='assistant-msg '+(who==='user'?'assistant-user':'assistant-bot');el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;}
  form.addEventListener('submit',async e=>{
    e.preventDefault();const text=input.value.trim();if(!text||send.disabled)return;
    bubble(text,'user');history.push({role:'user',content:text});input.value='';send.disabled=true;send.textContent='...';
    const pending=bubble('Estou analisando o cenário...','assistant');
    try{
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-10)})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível responder agora.');
      pending.textContent=data.reply;history.push({role:'assistant',content:data.reply});
    }catch(err){pending.textContent=err.message||'Tive um problema ao responder. Tente novamente em instantes.';}
    finally{send.disabled=false;send.textContent='Enviar';input.focus();}
  });
  launcher.title='Conversar com a assistente 43W';
})();