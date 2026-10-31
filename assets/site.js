(()=>{
 'use strict';
 const M=globalThis.MSG_MODEL,S=globalThis.MSG_SITE_MODEL,products=globalThis.MSG_PRODUCTS,nf=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}),$=id=>document.getElementById(id),params=new URLSearchParams(location.search),page=document.body.dataset.page,category=document.body.dataset.category||'all';
 const names={square:'Труба профильная квадратная',rectangle:'Труба профильная прямоугольная',oval:'Труба профильная овальная'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const storageKey='msg-bishkek-cart-v1';let saved='[]';try{saved=localStorage.getItem(storageKey)||'[]';}catch{}
 let cart=S.restoreCart(params.has('cart')?params.get('cart'):saved,products),visible=12,timer;
 function links(){
  const packed=S.packCart(cart);
  document.querySelectorAll('a[href]').forEach(a=>{
   const raw=a.getAttribute('href');if(!raw||raw.startsWith('#')||raw.startsWith('tel:')||raw.startsWith('mailto:'))return;
   let u;try{u=new URL(raw,location.href);}catch{return;}
   if(u.origin!==location.origin||!u.pathname.endsWith('.html'))return;
   if(cart.length)u.searchParams.set('cart',packed);else u.searchParams.delete('cart');a.href=u.href;
  });
 }
 function save(){try{localStorage.setItem(storageKey,S.packCart(cart));}catch{}if($('header-cart-count')){$('header-cart-count').textContent=cart.length;$('header-cart-count').hidden=!cart.length;}links();}
 function notify(text){if(!$('toast'))return;$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('visible'),2600);}
 function closeMenu(){if($('mega-menu'))$('mega-menu').hidden=true;$('menu-toggle')?.setAttribute('aria-expanded','false');}
 $('menu-toggle')?.addEventListener('click',()=>{const open=$('mega-menu').hidden;$('mega-menu').hidden=!open;$('menu-toggle').setAttribute('aria-expanded',String(open));});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 document.querySelectorAll('.general-whatsapp').forEach(a=>a.href=M.whatsappUrl(M.buildMessage([])));
 $('search-form')?.addEventListener('submit',e=>{e.preventDefault();const url=new URL('catalog.html',location.href),query=$('search').value.trim();if(query)url.searchParams.set('q',query);if(cart.length)url.searchParams.set('cart',S.packCart(cart));url.hash='prices';location.href=url.href;});
 if($('search'))$('search').value=params.get('q')||'';
 document.querySelectorAll('[data-download-price]').forEach(b=>b.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([M.buildPriceCsv(products)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='МСГ-прайс-Бишкек.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}));
 if(page==='overview'&&params.get('q')){
  const route=S.resolveQuery(params.get('q'));
  if(route){const url=new URL(route.page,location.href);url.searchParams.set('q',params.get('q'));if(route.type)url.searchParams.set('type',route.type);if(cart.length)url.searchParams.set('cart',S.packCart(cart));location.replace(url.href);return;}
  if($('directory-search-empty')){$('directory-search-empty').hidden=false;$('directory-all').hidden=true;}
 }
 if(page==='enquiry'){
  const kind=$('request-type'),size=$('request-size'),quantity=$('request-quantity'),unit=$('request-unit'),note=$('request-note'),form=$('enquiry-form');
  const requested=params.get('type');if(requested&&Array.from(kind.options).some(o=>o.value===requested))kind.value=requested;
  if(params.get('q'))note.value='Поиск продукции: '+params.get('q').slice(0,300);
  quantity.addEventListener('input',()=>quantity.setCustomValidity(''));size.addEventListener('input',()=>size.setCustomValidity(''));
  form.addEventListener('submit',e=>{
   e.preventDefault();size.setCustomValidity(size.value.trim()?'':'Укажите размер, марку или характеристики.');const amount=M.parseMeters(quantity.value);quantity.setCustomValidity(amount===null?'Введите положительный объём до 100 000, не более двух знаков после запятой.':'');
   if(!form.reportValidity()||amount===null)return;
   const title=document.querySelector('h1').textContent;
   const message='Здравствуйте! Прошу рассчитать заказ МСГ в Бишкеке.\n\nРаздел: '+title+'\nПродукция: '+kind.value+'\nРазмеры и характеристики: '+size.value.trim()+'\nКоличество: '+nf.format(amount)+' '+unit.value+(note.value.trim()?'\nКомментарий: '+note.value.trim():'')+'\n\nПодтвердите, пожалуйста, наличие, актуальную цену и условия получения.';
   const url=M.whatsappUrl(message);$('request-fallback').href=url;$('request-fallback').hidden=false;window.open(url,'_blank','noopener,noreferrer');
  });
 }
 if(page==='catalog'){
  const keys=['width','height','thickness'];
  for(const key of keys){const el=$('filter-'+key),values=Array.from(new Set(products.filter(p=>category==='all'||p.category===category).map(p=>M.dimensions(p)[key]))).sort((a,b)=>a-b);el.innerHTML='<option value="">Все размеры</option>'+values.map(v=>`<option value="${v}">${String(v).replace('.',',')}</option>`).join('');const requested=params.get(key);if(requested&&values.some(v=>v===Number(requested.replace(',','.'))))el.value=requested.replace(',','.');}
  function render(){
   const filters=Object.fromEntries(keys.map(k=>[k,$('filter-'+k).value])),list=M.filterProducts(products,$('search').value,category,$('sort').value,filters);
   $('result-count').textContent=`Найдено ${list.length} из ${products.filter(p=>category==='all'||p.category===category).length} позиций`;
   $('product-rows').innerHTML=list.slice(0,visible).map(p=>`<tr><td><a class="product-name" href="${S.productPath(p.id)}"><strong>${names[p.category]} ${esc(p.name)}</strong><small>Бишкек · размер в мм</small></a></td><td class="length-cell">6–12</td><td class="price-cell">${p.price>0?nf.format(p.price):'<small class="price-on-request">По запросу</small>'}</td><td class="action-cell"><a class="add-button ${cart.some(r=>r.id===p.id)?'is-added':''}" href="${S.productPath(p.id)}" aria-label="Открыть и рассчитать трубу ${esc(p.name)}"><svg class="icon"><use href="#i-cart"/></svg></a></td></tr>`).join('');
   $('empty-search').hidden=list.length>0;$('load-more').hidden=list.length<=visible;$('load-more').innerHTML=`Показать ещё ${Math.min(12,Math.max(0,list.length-visible))} <span>↓</span>`;links();
  }
  $('search').addEventListener('input',()=>{visible=12;render();});$('sort').addEventListener('change',()=>{visible=12;render();});keys.forEach(k=>$('filter-'+k).addEventListener('change',()=>{visible=12;render();}));
  $('reset-search').addEventListener('click',()=>{$('search').value='';keys.forEach(k=>$('filter-'+k).value='');visible=12;render();});
  $('load-more').addEventListener('click',()=>{const previous=visible;visible+=12;render();$('product-rows').children[previous]?.querySelector('a')?.focus({preventScroll:true});});render();
 }
 if(page==='product'){
  const product=products.find(p=>p.id===params.get('id'));
  if(!product){$('product-main').hidden=true;$('product-missing').hidden=false;document.title='Товар не найден — МСГ';}
  else{
   const title=names[product.category]+' '+product.name,dimension=M.dimensions(product);
   document.title=title+' — цена в Бишкеке | МСГ';$('product-title').textContent=title;$('product-crumb').textContent=product.name;$('product-category').textContent={square:'Квадратный',rectangle:'Прямоугольный',oval:'Овальный'}[product.category];$('product-size').textContent=`${dimension.width} × ${dimension.height} мм`;$('product-wall').textContent=String(dimension.thickness).replace('.',',')+' мм';$('product-price').textContent=product.price>0?nf.format(product.price)+' сом / м':'Цена по запросу';$('product-drawing').innerHTML=`<svg viewBox="0 0 220 145" aria-hidden="true"><use href="#pipe-${product.category==='rectangle'?'rectangle':product.category==='oval'?'oval':'square'}"/></svg>`;
   $('product-meters').value=String(cart.find(r=>r.id===product.id)?.meters||6).replace('.',',');
   function update(){const meters=M.parseMeters($('product-meters').value);$('product-meters').setAttribute('aria-invalid',String(meters===null));$('product-error').textContent=meters===null?'Введите количество от 0,01 до 100 000 м, до двух знаков после запятой.':'';$('product-sum').textContent=meters===null?'—':product.price>0?nf.format(M.total([{...product,meters}]))+' сом':'По запросу';$('add-product').disabled=meters===null;$('add-product-label').textContent=cart.some(r=>r.id===product.id)?'Обновить количество':'Добавить в корзину';}
   $('product-meters').addEventListener('input',update);$('add-product').addEventListener('click',()=>{const meters=M.parseMeters($('product-meters').value);if(meters===null)return;cart=S.putCart(cart,product.id,meters,products);save();update();$('product-added').hidden=false;notify('Количество сохранено в корзине');});update();
   $('product-question').href=M.whatsappUrl(`Здравствуйте! Интересует ${title}, Бишкек. Подтвердите, пожалуйста, цену, наличие и условия получения.`);
  }
 }
 if(page==='cart'){
  function total(){const inputs=Array.from(document.querySelectorAll('[data-cart-meters]')),invalid=inputs.some(input=>M.parseMeters(input.value)===null),disabled=invalid||cart.length===0;const send=$('send-cart');$('cart-total').textContent=M.quoteLabel(cart);$('cart-known-total').textContent=cart.some(p=>p.price<=0)&&M.total(cart)>0?'Позиции с указанной ценой: '+nf.format(M.total(cart))+' сом. Остальные — по запросу.':'';$('cart-error').textContent=invalid?'Исправьте метраж выделенных товаров перед отправкой заявки.':'';send.setAttribute('aria-disabled',String(disabled));if(disabled){send.removeAttribute('href');send.setAttribute('tabindex','-1');}else{send.href=M.whatsappUrl(M.buildMessage(cart));send.removeAttribute('tabindex');}}
  function render(){
   $('cart-empty').hidden=cart.length>0;$('cart-filled').hidden=!cart.length;
   $('cart-lines').innerHTML=cart.map(p=>`<div class="cart-page-line"><div class="cart-page-product"><a class="product-name" href="${S.productPath(p.id)}"><strong>${names[p.category]} ${esc(p.name)}</strong><small>${p.price>0?nf.format(p.price)+' сом / м':'Цена по запросу'}</small></a></div><label class="cart-meter-label"><span class="sr-only">Количество трубы ${esc(p.name)}, м</span><input type="text" inputmode="decimal" required value="${String(p.meters).replace('.',',')}" data-cart-meters="${p.id}"><span>м</span></label><output id="line-${p.id}">${p.price>0?nf.format(M.total([p]))+' сом':'По запросу'}</output><button data-remove="${p.id}" class="cart-remove" aria-label="Убрать трубу ${esc(p.name)}">×</button></div>`).join('');save();total();
  }
  $('cart-lines').addEventListener('input',e=>{const input=e.target.closest('[data-cart-meters]');if(!input)return;const meters=M.parseMeters(input.value),item=cart.find(p=>p.id===input.dataset.cartMeters);input.setAttribute('aria-invalid',String(meters===null));if(meters!==null){cart=S.putCart(cart,item.id,meters,products);$('line-'+item.id).textContent=item.price>0?nf.format(M.total([{...item,meters}]))+' сом':'По запросу';save();}else $('line-'+item.id).textContent='—';total();});
  $('cart-lines').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;const label=cart.find(p=>p.id===b.dataset.remove)?.name;cart=cart.filter(p=>p.id!==b.dataset.remove);render();notify(`Труба ${label} удалена из корзины`);document.querySelector('[data-cart-meters]')?.focus();});
  $('clear-cart').addEventListener('click',()=>{cart=[];render();notify('Корзина очищена');});render();
 }
 save();
})();
