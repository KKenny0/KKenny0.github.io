import {tasteProducts} from '../data/taste';
import {projects,notes,lensInfo,aiWritingIds} from '../data/space';
import {localizedNote} from '../data/space-i18n';
import {routePath} from './space-routes';

// Prototype-only routing: mirrors lib/space-routes.js but everything lives under
// /prototype (or /zh/prototype) so the official site keeps its own paths untouched.
export const artworkIds=Object.fromEntries(tasteProducts.map(product=>[product.id,product.works.map(work=>work.id)]));
const validItem=(items,key,value,fallback)=>items.some(item=>item[key]===value)?value:fallback;
const homePath=locale=>`${locale==='zh'?'/zh':''}/workbench/`;

export function protoRoutePath(route,locale='en',space='prototype'){
  if(space==='formal')return routePath(route,locale);
  const base=`${locale==='zh'?'/zh':''}/${space}`;
  let path=`${base}/`;
  switch(route.view){
    case 'home':return space==='collage'?`${base}/`:homePath(locale);
    case 'lens':path=`${base}/lens/${route.arg}/`;break;
    case 'projects':path=route.item?`${base}/work/${route.item}/`:`${base}/projects/`;break;
    case 'notes':path=route.item?`${base}/notes/${route.arg==='ai'?'ai':'online'}/${route.item}/`:`${base}/notes/`;break;
    case 'taste':path=`${base}/taste/${route.arg}/${artworkIds[route.arg]?.[route.work||0]||'thousand-brains'}/`;break;
    case 'about':path=`${base}/about/`;break;
    case 'support':path=`${base}/support/`;break;
    case 'story':path=`${base}/projects/${route.arg}/`;break;
  }
  if(['projects','about'].includes(route.view)&&['online','taste','ai','execution'].includes(route.arg))path+=`?from=${route.arg}`;
  if(route.view==='notes'&&['memory','context','agents','ai'].includes(route.topic))path+=`?topic=${route.topic}`;
  return path;
}

export function protoParseRoute(url){
  const parts=url.pathname.replace(/^\/zh(?=\/|$)/,'').replace(/^\/(?:prototype|collage)(?=\/|$)/,'').split('/').filter(Boolean);
  const from=['online','taste','ai','execution'].includes(url.searchParams.get('from'))?url.searchParams.get('from'):'home';
  const topic=['memory','context','agents','ai'].includes(url.searchParams.get('topic'))?{topic:url.searchParams.get('topic')}: {};
  const home={view:'home',arg:''};
  if(parts[0]==='lens')return lensInfo[parts[1]]?{view:'lens',arg:parts[1]}:home;
  if(parts[0]==='taste')return artworkIds[parts[1]]?.includes(parts[2])?{view:'taste',arg:parts[1],work:artworkIds[parts[1]].indexOf(parts[2])}:home;
  if(parts[0]==='projects'&&['tracework','weave'].includes(parts[1]))return {view:'story',arg:parts[1]};
  if(parts[0]==='work'&&parts[1])return {view:'projects',arg:from,item:validItem(projects,'slug',parts[1],'script-weaver')};
  if(parts[0]==='projects')return {view:'projects',arg:from,item:validItem(projects,'slug',decodeHash(url),'script-weaver')};
  if(parts[0]==='notes'){
    const id=validItem(notes,'id',parts[2]||decodeHash(url).replace(/^note-/,''),'goal');
    return {view:'notes',arg:parts[1]==='ai'||!parts[1]&&aiWritingIds.includes(id)?'ai':'online',item:id,...topic};
  }
  if(parts[0]==='about')return {view:'about',arg:from};
  if(parts[0]==='support')return {view:'support',arg:''};
  return home;
}
function decodeHash(url){try{return decodeURIComponent(url.hash.slice(1));}catch{return '';}}

// Every prototype deep link is a real static page, generated for both locales.
export function protoEntries(){
  return [
    ...Object.keys(lensInfo).map(id=>({path:`lens/${id}`,route:{view:'lens',arg:id}})),
    {path:'projects',route:{view:'projects',arg:'home',item:'script-weaver'}},
    ...projects.map(p=>({path:`work/${p.slug}`,route:{view:'projects',arg:'home',item:p.slug}})),
    {path:'notes',route:{view:'notes',arg:'online',item:'goal'}},
    ...notes.map(n=>({path:`notes/${n.primary}/${n.id}`,route:{view:'notes',arg:n.primary,item:n.id}})),
    // The archive rail links AI selections through the online tuner as well.
    ...notes.filter(n=>n.primary==='ai').map(n=>({path:`notes/online/${n.id}`,route:{view:'notes',arg:'online',item:n.id}})),
    ...Object.entries(artworkIds).flatMap(([product,ids])=>ids.map((id,index)=>({path:`taste/${product}/${id}`,route:{view:'taste',arg:product,work:index}}))),
    {path:'about',route:{view:'about',arg:'home'}},
    {path:'support',route:{view:'support',arg:''}},
    ...['tracework','weave'].map(id=>({path:`projects/${id}`,route:{view:'story',arg:id}}))
  ];
}

export function protoTitle(route,locale){
  const zh=locale==='zh';
  const note=notes.find(n=>n.id===route.item);
  const name=route.view==='home'?'Kenny Wu':route.view==='lens'?lensInfo[route.arg]?.name:route.view==='projects'?projects.find(p=>p.slug===route.item)?.name||(zh?'作品台':'Work table'):route.view==='notes'?(note?localizedNote(note,locale).title:zh?'观察档案':'Observation archive'):route.view==='taste'?'Taste':route.view==='support'?(zh?'支持':'Support'):route.view==='story'?(route.arg==='tracework'?'Tracework':'weave'):zh?'关于 Kenny':'About Kenny';
  return route.view==='home'?name:`${name} · Kenny Wu`;
}
