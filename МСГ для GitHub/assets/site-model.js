(function(root){
 'use strict';
 function restoreCart(raw,products){
  let entries=raw;if(typeof raw==='string'){try{entries=JSON.parse(raw);}catch{return[];}}
  if(!Array.isArray(entries))return[];
  const known=new Map(products.map(p=>[p.id,p])),cart=new Map();
  for(const entry of entries.slice(0,1000)){
   if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string')continue;
   const product=known.get(entry[0]),meters=root.MSG_MODEL.parseMeters(String(entry[1]));
   if(product&&meters!==null)cart.set(product.id,{...product,meters});
  }
  return Array.from(cart.values());
 }
 const packCart=rows=>JSON.stringify(rows.map(p=>[p.id,p.meters]));
 function putCart(rows,id,value,products){
  const product=products.find(p=>p.id===id),meters=root.MSG_MODEL.parseMeters(String(value));
  if(!product||meters===null)throw Error('Проверьте товар и метраж.');
  return[...rows.filter(p=>p.id!==id),{...product,meters}];
 }
 const productPath=id=>'product.html?id='+encodeURIComponent(id);
 function resolveQuery(query){
  const q=String(query).toLowerCase().trim();
  const route=(page,type)=>({page:page+'.html',type});
  if(/профнаст|профлист/.test(q))return route('krovelnye-materialy','Профнастил');
  if(/металлочереп|монтеррей/.test(q))return route('krovelnye-materialy','Металлочерепица');
  if(/добор|кон[её]к|ендов/.test(q))return route('krovelnye-materialy','Доборные элементы');
  if(/балк|двутавр/.test(q))return route('fasonnyy-prokat','Балки (двутавр)');
  if(/швеллер/.test(q))return route('fasonnyy-prokat','Швеллер');
  if(/уголок/.test(q))return route('fasonnyy-prokat','Уголок');
  if(/арматур|катанк/.test(q))return route('sortovoy-prokat','Арматура, катанка');
  if(/нержав/.test(q))return route('nerzhaveyushchaya-stal');
  if(/дуплекс/.test(q))return route('dupleksnaya-stal');
  if(/судов/.test(q))return route('sudovaya-stal');
  if(/мостов/.test(q))return route('mostovaya-stal');
  if(/гадфильд|износостой|высокопроч/.test(q))return route('iznosostoykaya-stal');
  if(/профильн|прямоугольн|овальн|квадратн.*труб|\d+\s*[хx×]\s*\d+|^\d/.test(q))return route('truby-profilnye');
  if(/труб|вгп|фланц|сгон|отвод/.test(q))return route('truby');
  if(/лист|рулон|пвл|просеч|рифл[её]н|оцинк/.test(q))return route('listovoy-prokat');
  if(/алюмин|дюрал|медь|меди|бронз|латун|олово|свинец|цинк|нихром|цветн/.test(q))return route('tsvetnye-metally');
  if(/подшипник/.test(q))return route('podshipniki');
  if(/инженер|фитинг|радиатор|водонагрев|фильтр|насос|коллектор|кипи|теплоизоляц/.test(q))return route('inzhenernye-sistemy');
  if(/электроинструмент|дрел|перфоратор|болгарк/.test(q))return route('elektroinstrumenty');
  if(/метиз|проволок|канат|креп[её]ж|гвозд|болт|цеп[ьи]|сетк|лент|электрод|серебрянк|калибровк/.test(q))return route('metizy');
  if(/инструментальн.*стал|конструкционн.*стал|поковк|качественн.*стал/.test(q))return route('kachestvennye-stali');
  if(/сортов|фасонн|круг|полос|квадрат/.test(q))return route('sortovoy-prokat');
  return null;
 }
 root.MSG_SITE_MODEL={restoreCart,packCart,putCart,productPath,resolveQuery};
})(globalThis);
