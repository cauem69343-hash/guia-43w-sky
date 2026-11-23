(function(){
 const grids=window.NP_CHANNEL_GRIDS||{};
 const select=document.getElementById('npGradeSelect');
 const search=document.getElementById('npChannelSearch');
 const rows=document.getElementById('npChannelRows');
 const summary=document.getElementById('npChannelSummary');
 const empty=document.getElementById('npChannelEmpty');
 if(!select||!search||!rows||!summary)return;
 Object.keys(grids).forEach((name,index)=>{
   const option=document.createElement('option');option.value=name;option.textContent=name;select.appendChild(option);
 });
 function normalize(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
 function render(){
   const name=select.value;
   const channels=grids[name]||[];
   const query=normalize(search.value.trim());
   const filtered=channels.filter(([channel,number])=>!query||normalize(channel).includes(query)||normalize(number).includes(query));
   rows.innerHTML='';
   filtered.forEach(([channel,number])=>{
     const tr=document.createElement('tr');
     const numberCell=document.createElement('td');numberCell.className='np-channel-number';numberCell.textContent=number;
     const channelCell=document.createElement('td');channelCell.className='np-channel-name';channelCell.textContent=channel;
     const typeCell=document.createElement('td');
     const type=document.createElement('span');type.className='np-channel-type';
     type.textContent=/^RÁDIO\b/i.test(channel)?'Rádio':/^ÁUDIO\b/i.test(channel)?'Áudio':'TV';
     typeCell.appendChild(type);
     tr.append(numberCell,channelCell,typeCell);rows.appendChild(tr);
   });
   summary.innerHTML='';
   const count=document.createElement('strong');count.textContent=filtered.length;
   const label=document.createElement('span');label.textContent=filtered.length===1?'canal encontrado':'canais encontrados';
   const grade=document.createElement('span');grade.className='np-channel-grade-label';grade.textContent=name;
   summary.append(count,label,grade);
   empty.hidden=filtered.length!==0;
 }
 select.addEventListener('change',render);
 search.addEventListener('input',render);
 render();
})();
