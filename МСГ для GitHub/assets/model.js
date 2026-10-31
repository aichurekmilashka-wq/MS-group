(function(root){
 'use strict';
 const nf=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2});
 const normalize=value=>String(value).toLowerCase().replace(/[х×*]/g,'x').replace(/,/g,'.').replace(/\s/g,'');
 function dimensions(product){const m=String(product.name).match(/^(\d+)[хx×](\d+)[хx×]([\d,.]+)/i);return m?{width:Number(m[1]),height:Number(m[2]),thickness:Number(m[3].replace(',','.'))}:{width:0,height:0,thickness:0};}
 function filterProducts(products,query='',category='all',sort='default',filters={}){
  const q=String(query).toLowerCase();
  const inferred=/прямоуголь/.test(q)?'rectangle':/квадрат/.test(q)?'square':/овал/.test(q)?'oval':null;
  const term=normalize(q.replace(/прямоуголь[а-я]*|квадрат[а-я]*|[а-я/]*овал[а-я.]*|профильн[а-я]*|труб[а-я]*|металлопрокат|мм/gi,''));
  const result=products.filter(p=>{
   if(category!=='all'&&p.category!==category||inferred&&p.category!==inferred||!normalize(p.name).includes(term))return false;
   const d=dimensions(p);return Object.entries(filters).every(([key,value])=>value===''||value==null||Math.abs(d[key]-Number(String(value).replace(',','.')))<1e-8);
  });
  if(sort==='price'||sort==='price-desc')result.sort((a,b)=>{if(a.price<=0)return b.price<=0?0:1;if(b.price<=0)return -1;return sort==='price'?a.price-b.price:b.price-a.price;});return result;
 }
 function parseMeters(value){const t=String(value).trim().replace(',','.');if(!/^\d+(\.\d{1,2})?$/.test(t))return null;const n=Number(t);return n>0&&n<=100000?n:null;}
 const quoteLabel=rows=>rows.some(r=>r.price<=0)?'Стоимость уточняется':nf.format(total(rows))+' сом';
 const total=rows=>Math.round(rows.reduce((sum,r)=>sum+r.price*Math.round(r.meters*100),0))/100;
 function buildMessage(rows){if(!rows.length)return 'Здравствуйте! Интересует металлопрокат МСГ в Бишкеке. Помогите подобрать размер и рассчитать заказ.';return 'Здравствуйте! Прошу уточнить наличие и стоимость заказа МСГ в Бишкеке:\n\n'+rows.map((r,i)=>r.price>0?`${i+1}. Труба ${r.name} мм — ${nf.format(r.meters)} м × ${nf.format(r.price)} сом/м = ${nf.format(total([r]))} сом`:`${i+1}. Труба ${r.name} мм — ${nf.format(r.meters)} м; цена по запросу`).join('\n')+`\n\nПредварительная сумма: ${quoteLabel(rows)}.${rows.some(r=>r.price<=0)?` Сумма позиций с известной ценой: ${nf.format(total(rows))} сом.`:''}\nПодтвердите, пожалуйста, цены, условия оплаты и получения.`;}
 const whatsappUrl=message=>'https://wa.me/996503030997?text='+encodeURIComponent(message);
 function buildPriceCsv(products){const cell=v=>'"'+String(v).replace(/"/g,'""')+'"';const labels={square:'Квадратная труба',rectangle:'Прямоугольная труба',oval:'Овальная труба'};return '\ufeff'+[['Продукция','Размер, мм','Длина по прайсу, м','Цена, сом/м'],...products.map(p=>[labels[p.category],p.name,'6–12',p.price>0?p.price:'По запросу'])].map(r=>r.map(cell).join(';')).join('\r\n');}
 const model={normalize,dimensions,filterProducts,parseMeters,total,buildMessage,whatsappUrl,buildPriceCsv,quoteLabel};root.MSG_MODEL=model;if(typeof module!=='undefined'&&module.exports)module.exports=model;
})(globalThis);
