import {tasteProducts} from '../data/taste';
import {projects,notes,lensInfo,aiWritingIds} from '../data/space';
import {localizedNote} from '../data/space-i18n';

export const artworkIds=Object.fromEntries(tasteProducts.map(product=>[product.id,product.works.map(work=>work.id)]));
const validItem=(items,key,value,fallback)=>items.some(item=>item[key]===value)?value:fallback;

export function routePath(route,locale='en'){
  const prefix=locale==='zh'?'/zh':'';
  let path='/';
  switch(route.view){
    case 'lens': path=`/lens/${route.arg}/`;break;
    case 'projects':path=route.item?`/work/${route.item}/`:'/projects/';break;
    case 'notes':path=route.item?`/notes/${route.arg==='ai'?'ai':'online'}/${route.item}/`:'/notes/';break;
    case 'taste':path=`/taste/${route.arg}/${artworkIds[route.arg]?.[route.work||0]||'qiwu'}/`;break;
    case 'about':path='/about/';break;
  }
  if(['projects','about'].includes(route.view)&&['online','taste','ai','execution'].includes(route.arg))path+=`?from=${route.arg}`;
  if(route.view==='notes'&&['memory','context','agents','ai'].includes(route.topic))path+=`?topic=${route.topic}`;
  return prefix+path;
}

export function canonicalPath(route,locale='en'){
  const primary=route.view==='notes'&&aiWritingIds.includes(route.item)?{...route,arg:'ai'}:route;
  return routePath(primary,locale).split('?')[0];
}

export function parseRoute(url){
  const parts=url.pathname.replace(/^\/zh(?=\/|$)/,'').split('/').filter(Boolean);
  const from=['online','taste','ai','execution'].includes(url.searchParams.get('from'))?url.searchParams.get('from'):'home';
  const home={view:'home',arg:''};
  if(parts[0]==='lens')return lensInfo[parts[1]]?{view:'lens',arg:parts[1]}:home;
  if(parts[0]==='taste')return artworkIds[parts[1]]?.includes(parts[2])?{view:'taste',arg:parts[1],work:artworkIds[parts[1]].indexOf(parts[2])}:home;
  if(parts[0]==='work'&&parts[1])return {view:'projects',arg:from,item:validItem(projects,'slug',parts[1],'script-weaver')};
  if(parts[0]==='projects')return {view:'projects',arg:from,item:validItem(projects,'slug',decodeHash(url),'script-weaver')};
  if(parts[0]==='notes'){
    const id=validItem(notes,'id',parts[2]||decodeHash(url).replace(/^note-/,''),'goal');
    return {view:'notes',arg:parts[1]==='ai'||!parts[1]&&aiWritingIds.includes(id)?'ai':'online',item:id,...(['memory','context','agents','ai'].includes(url.searchParams.get('topic'))?{topic:url.searchParams.get('topic')}: {})};
  }
  if(parts[0]==='about')return {view:'about',arg:from};
  return home;
}
function decodeHash(url){try{return decodeURIComponent(url.hash.slice(1));}catch{return '';}}

export function spaceEntries(){
  return [
    ...Object.keys(lensInfo).map(id=>({path:`lens/${id}`,route:{view:'lens',arg:id}})),
    ...projects.map(p=>({path:`work/${p.slug}`,route:{view:'projects',arg:'home',item:p.slug}})),
    ...notes.map(n=>({path:`notes/${n.primary}/${n.id}`,route:{view:'notes',arg:n.primary,item:n.id}})),
    // The complete Notes archive can keep its tuner surface while visiting AI selections.
    ...notes.filter(n=>n.primary==='ai').map(n=>({path:`notes/online/${n.id}`,route:{view:'notes',arg:'online',item:n.id}})),
    ...Object.entries(artworkIds).flatMap(([product,ids])=>ids.map((id,index)=>({path:`taste/${product}/${id}`,route:{view:'taste',arg:product,work:index}})))
  ];
}

export function routeTitle(route,locale){
  const note=notes.find(n=>n.id===route.item);
  const name=route.view==='home'?'Kenny Wu':route.view==='lens'?lensInfo[route.arg]?.name:route.view==='projects'?projects.find(p=>p.slug===route.item)?.name||(locale==='zh'?'作品台':'Projects'):route.view==='notes'?(note?localizedNote(note,locale).title:locale==='zh'?'观察档案':'Notes'):route.view==='taste'?'Taste':locale==='zh'?'关于 Kenny':'About Kenny';
  return route.view==='home'?name:`${name} · Kenny Wu`;
}
