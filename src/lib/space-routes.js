import {tasteProducts} from '../data/taste';
import {projects,notes,lensInfo} from '../data/space';
import {localizedNote} from '../data/space-i18n';

export const artworkIds=Object.fromEntries(tasteProducts.map(product=>[product.id,product.works.map(work=>work.id)]));
export const writingTopics=['memory','context','agents','ai'];
const sources=[...Object.keys(lensInfo),'projects','notes','about','work'];
const stories=['tracework','weave'];
const read=(params,key,allowed)=>allowed.includes(params.get(key))?params.get(key):undefined;

export function routePath(route,locale='en'){
  const prefix=locale==='zh'?'/zh':'';
  let path='/';
  switch(route.view){
    case 'lens':path=`/lens/${route.arg}/`;break;
    case 'projects':path=route.item?`/work/${route.item}/`:'/projects/';break;
    case 'notes': {
      const note=notes.find(n=>n.id===route.item);
      path=note?`/notes/${note.primary}/${note.id}/`:'/notes/';
      break;
    }
    case 'taste':path=`/taste/${route.arg}/${artworkIds[route.arg]?.[route.work||0]||'thousand-brains'}/`;break;
    case 'about':path='/about/';break;
    case 'support':path='/support/';break;
    case 'story':path=`/projects/${route.arg}/`;break;
  }
  const params=new URLSearchParams();
  const source=route.source||(['projects','about'].includes(route.view)&&sources.includes(route.arg)?route.arg:undefined);
  if(sources.includes(source))params.set('from',source);
  if(sources.includes(route.via))params.set('via',route.via);
  if(route.view==='notes'&&writingTopics.includes(route.topic))params.set('topic',route.topic);
  return prefix+path+(params.size?`?${params}`:'')+(route.anchor?`#${route.anchor}`:'');
}

export function canonicalPath(route,locale='en'){
  return routePath(route,locale).split(/[?#]/)[0];
}

export function storyReturnPath(route,locale='en'){
  return routePath(stories.includes(route.arg)
    ?{view:'projects',item:route.arg,source:route.source==='work'?route.via:route.source}
    :{view:'projects'},locale);
}

export function parseRoute(url){
  const parts=url.pathname.replace(/^\/zh(?=\/|$)/,'').split('/').filter(Boolean);
  const source=read(url.searchParams,'from',sources);
  const topic=read(url.searchParams,'topic',writingTopics);
  const via=read(url.searchParams,'via',sources);
  const origin=source?{source,...(via?{via}:{})}:{};
  const home={view:'home',arg:''};
  if(parts[0]==='lens')return Object.hasOwn(lensInfo,parts[1])?{view:'lens',arg:parts[1],...origin}:home;
  if(parts[0]==='taste')return Object.hasOwn(artworkIds,parts[1])&&artworkIds[parts[1]].includes(parts[2])?{view:'taste',arg:parts[1],work:artworkIds[parts[1]].indexOf(parts[2])}:home;
  if(parts[0]==='projects'&&stories.includes(parts[1]))return {view:'story',arg:parts[1],...origin};
  if(parts[0]==='work'||parts[0]==='projects'){
    const item=parts[0]==='work'?parts[1]:decodeHash(url);
    return {view:'projects',...origin,...(projects.some(p=>p.slug===item)?{item}:{})};
  }
  if(parts[0]==='notes'){
    const id=parts[2]||decodeHash(url).replace(/^note-/,'');
    const note=notes.find(n=>n.id===id);
    // Old detail URLs used their section as the only hint about the return destination.
    const oldSource=note&&parts[1]==='ai'?'ai':undefined;
    return {view:'notes',...(note?{item:note.id,arg:note.primary}:{}),...origin,...(!source&&oldSource?{source:oldSource}:{}),...(topic?{topic}:{})};
  }
  if(parts[0]==='about')return {view:'about',...origin};
  if(parts[0]==='support')return {view:'support',arg:''};
  return home;
}
function decodeHash(url){try{return decodeURIComponent(url.hash.slice(1));}catch{return '';}}

export function spaceEntries(){
  return [
    ...Object.keys(lensInfo).map(id=>({path:`lens/${id}`,route:{view:'lens',arg:id}})),
    ...projects.map(p=>({path:`work/${p.slug}`,route:{view:'projects',item:p.slug}})),
    ...notes.map(n=>({path:`notes/${n.primary}/${n.id}`,route:{view:'notes',arg:n.primary,item:n.id}})),
    ...notes.filter(n=>n.primary==='ai').map(n=>({path:`notes/online/${n.id}`,route:{view:'notes',arg:'ai',item:n.id}})),
    ...Object.entries(artworkIds).flatMap(([product,ids])=>ids.map((id,index)=>({path:`taste/${product}/${id}`,route:{view:'taste',arg:product,work:index}})))
  ];
}

export function routeTitle(route,locale){
  const zh=locale==='zh';
  const note=notes.find(n=>n.id===route.item);
  const lens=route.view==='taste'?lensInfo.taste:lensInfo[route.arg];
  const name=route.view==='home'?'Kenny Wu':['lens','taste'].includes(route.view)?lens?.navigation[locale]:route.view==='projects'?projects.find(p=>p.slug===route.item)?.name||(zh?'项目台':'Projects'):route.view==='notes'?(note?localizedNote(note,locale).title:zh?'文章':'Writing'):route.view==='support'?(zh?'支持':'Support'):route.view==='story'?(route.arg==='tracework'?'Tracework':'weave'):zh?'关于 Kenny':'About Kenny';
  return route.view==='home'?name:`${name} · Kenny Wu`;
}
