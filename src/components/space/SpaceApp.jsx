import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {AboutMore,LensTuner,TasteViewer,tasteProducts} from './Scenes';
import {localizedNote,prototypeText,tasteEnglish} from '../../data/space-i18n';
import {aiWritingIds,curated,isTechnicalWriting,lensInfo,notes,projects,projectVisual} from '../../data/space';
import {githubSnapshot} from '../../data/projects';
import {canonicalPath,parseRoute,routePath,routeTitle,storyReturnPath} from '../../lib/space-routes';
import {site} from '../../data/site';
import {createThemeController} from '../../lib/theme';
import {SceneLink,RoutePathContext} from './SceneLink';
import {Media} from './Media';
import CollageNav from './CollageNav';

const assets='/assets/space/';
const storagePrefix='kenny-space-return:v1:';
const initialControls={query:'',practice:'all',sort:'selected',archived:false,options:false,selected:curated[0].id};
const address=url=>url.pathname+url.search;
const viewKey=url=>{
  const topic=new URLSearchParams(url.search).get('topic');
  return url.pathname+(topic?`?topic=${topic}`:'');
};
const localized=(lang,zh,en)=>prototypeText(lang,zh,en);

function returnRoute(route){
  const {view,item,source,topic,via}=route;
  if(view==='taste')return {view:'lens',arg:'taste'};
  if(source==='notes')return {view:'notes',topic,source:via};
  if(source==='projects')return {view:'projects',source:via};
  if(source==='about')return {view:'about'};
  if(Object.hasOwn(lensInfo,source))return {view:'lens',arg:source};
  if(item&&view==='projects')return {view:'projects'};
  if(item&&view==='notes')return {view:'notes',topic};
  return {view:'home'};
}

function ProjectMedia({project,lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const media=projectVisual[project.slug];
  const image=project.focus||project.image;
  if(project.slug==='videowipe')return <figure className="space-work-media space-comparison">
    {[['videowipe-before.jpg',text('处理前','Before')],['videowipe-after.jpg',text('处理后','After')]].map(([src,label])=><figure key={src}><Media src={assets+src} alt={text(`${label}的视频帧`,`${label} frame`)} loading="eager"/><figcaption>{label}</figcaption></figure>)}
    <figcaption>{text('同一帧视频的字幕清除对照。','Subtitle removal on the same video frame.')}</figcaption>
  </figure>;
  if(media)return <figure className="space-work-media"><Media src={assets+media.src} alt={text(`${project.name} 的${media.kind==='poster'?'海报作品':'实际界面'}`,`${project.name} ${media.kind==='poster'?'poster output':'interface'}`)} loading="eager"/></figure>;
  if(image)return <figure className="space-work-media"><Media src={image.src} width={image.width} height={image.height} alt={text(image.altZh,image.alt)} loading="eager"/>{image.caption&&<figcaption>{text(image.captionZh,image.caption)}</figcaption>}</figure>;
  if(project.slug==='script-weaver')return <figure className="space-work-media space-work-flow"><ol>{(lang==='zh'?['故事构想','可编辑剧本','分镜','视频提示词']:['Story premise','Editable script','Storyboards','Video prompts']).map(step=><li key={step}>{step}</li>)}</ol><figcaption>{text('根据公开仓库说明整理的产物流程。','Workflow based on the public repository description.')}</figcaption></figure>;
  return null;
}

function ProjectDetail({project,route,lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const story=project.detailUrl&&{view:'story',arg:project.slug,source:'work',via:route.source};
  return <article className="space-work">
    <header className="space-heading"><h1>{project.name}</h1><p>{text(project.thesisZh,project.thesis)}</p></header>
    <ProjectMedia project={project} lang={lang}/>
    <div className="space-work-facts"><p>{text(project.descriptionZh,project.description)}</p><div className="space-links">
      <a href={project.url}>GitHub ↗</a>
      {project.homepage&&<a href={project.homepage}>{text('访问产品 ↗','Visit product ↗')}</a>}
      {story&&<SceneLink route={story}>{text('阅读长案例 →','Read the case study →')}</SceneLink>}
      {project.slug==='card-skill'&&<SceneLink route={{view:'taste',arg:'card-skill'}}>{text('查看作品 →','View the artwork →')}</SceneLink>}
      {['obsidian-kami','kami-reader-companion'].includes(project.slug)&&<SceneLink route={{view:'taste',arg:'kami-reader'}}>{text('查看阅读界面 →','View the reading layouts →')}</SceneLink>}
    </div></div>
    <p className="pb-index-note">{project.language&&`${project.language} · `}{project.archived&&text('已归档 · ','Archived · ')}{project.stars} stars · {project.forks} forks · {text('快照','Snapshot')} <time dateTime={githubSnapshot.date}>{githubSnapshot.date}</time></p>
  </article>;
}

function ProjectIndex({controls,update,route,lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const {query,practice,sort,archived,options}=controls;
  const practices={all:text('全部','All'),make:text('制作','Making'),think:text('思考','Thinking'),research:text('研究','Research'),capture:text('记录','Capture')};
  const matches=projects.filter(p=>(archived||!p.archived)&&(practice==='all'||p.practice===practice)&&[p.name,p.tagline,p.thesis,p.thesisZh,p.description,p.descriptionZh].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>sort==='updated'?b.pushedAt.localeCompare(a.pushedAt):sort==='stars'?b.stars-a.stars:Number(b.featured)-Number(a.featured)||b.stars-a.stars);
  return <section className="space-index">
    <header className="space-heading"><h1>{text('项目台','Projects')}</h1></header>
    <div className="space-find">
      <label>{text('搜索项目','Search projects')}<input id="project-search" type="search" value={query} onChange={e=>update({query:e.target.value})} placeholder={text('名称或关键词','Name or keyword')}/></label>
      <div className="pb-filter-group" role="group" aria-label={text('按方向筛选','Filter by practice')}>{Object.entries(practices).map(([id,label])=><button type="button" key={id} aria-pressed={practice===id} className={practice===id?'active':''} onClick={()=>update({practice:id})}>{label}</button>)}</div>
    </div>
    <details className="pb-options space-project-options" open={options} onToggle={e=>update({options:e.currentTarget.open})}><summary>{text('排序与归档','Sorting and archive')}</summary><div className="pb-options-body">
      <label><input type="checkbox" checked={archived} onChange={e=>update({archived:e.target.checked})}/>{text('包含归档项目','Include archived projects')}</label>
      <label>{text('排序','Sort')} <select value={sort} onChange={e=>update({sort:e.target.value})}><option value="selected">{text('精选','Selected')}</option><option value="stars">{text('标星数','Stars')}</option><option value="updated">{text('最近更新','Recently updated')}</option></select></label>
    </div></details>
    <p className="space-count mono" aria-live="polite">{text(`${matches.length} 个项目`,`${matches.length} projects`)}</p>
    <ul className="space-rows project-rows">{matches.map(project=><li key={project.slug}><SceneLink id={project.slug} route={{view:'projects',item:project.slug,source:'projects',via:route.source}}><span className="space-row-label">{practices[project.practice]}{project.archived&&text(' · 已归档',' · Archived')}</span><span><strong>{project.name}</strong><span>{text(project.thesisZh,project.thesis)}</span></span><span aria-hidden="true">→</span></SceneLink></li>)}</ul>
    {!matches.length&&<p>{text('没有匹配的项目。','No matching projects.')}</p>}
  </section>;
}

function Writing({route,entries,query,setQuery,setTopic,lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const topics={all:text('全部','All'),ai:text('技术写作','Technical writing'),memory:text('记忆','Memory'),context:text('上下文','Context'),agents:text('智能体','Agents')};
  const note=entries.find(n=>n.id===route.item);
  if(note)return <article className="space-writing-detail">
    <header className="space-heading"><p>{isTechnicalWriting(note)?topics.ai:text('观察','Observation')} · <time dateTime={note.date}>{note.date}</time></p><h1>{note.title}</h1></header>
    <p className="space-summary-label">{lang==='zh'?'摘要':note.hasEnglishSummary?'English summary':'Chinese summary'}</p><p className="space-summary" lang={lang==='en'&&!note.hasEnglishSummary?'zh-CN':undefined}>{note.teaser}</p>
    <div className="space-links"><a href={note.url} hrefLang="zh-CN" target="_blank" rel="noopener noreferrer">{note.provisional?text('在微信阅读中文合集 ↗','Open the Chinese WeChat collection ↗'):text('在知乎阅读中文原文 ↗','Read the Chinese original on Zhihu ↗')}</a>
      <SceneLink route={{view:'notes',topic:route.topic}}>{text('浏览文章索引 →','Browse the writing index →')}</SceneLink></div>
  </article>;
  const topic=route.topic||'all';
  const matches=entries.filter(n=>(topic==='all'||(topic==='ai'?isTechnicalWriting(n):n.topic===topic))&&[n.title,n.originalTitle,n.teaser,n.source,topics[n.topic]].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="space-index">
    <header className="space-heading"><h1>{text('文章','Writing')}</h1></header>
    <div className="space-find">
      <label>{text('搜索文章','Search writing')}<input id="writing-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={text('标题或关键词','Title or keyword')}/></label>
      <div className="pb-filter-group" role="group" aria-label={text('按主题筛选','Filter by topic')}>{Object.entries(topics).map(([id,label])=><button type="button" key={id} aria-pressed={topic===id} className={topic===id?'active':''} onClick={()=>setTopic(id)}>{label}</button>)}</div>
    </div>
    <p className="space-count mono" aria-live="polite">{text(`${matches.length} 条记录`,`${matches.length} entries`)}</p>
    <ul className="space-rows writing-rows">{matches.map(n=><li key={n.id}><SceneLink id={`note-${n.id}`} route={{view:'notes',item:n.id,source:'notes',topic:route.topic,via:route.source}}><time dateTime={n.date} className="space-row-label">{n.date}</time><span><strong>{n.title}</strong><span>{n.teaser}</span><small>{n.source} · {n.provisional?text('中文合集','Chinese collection'):text('中文原文','Chinese original')}</small></span><span aria-hidden="true">→</span></SceneLink></li>)}</ul>
    {!matches.length&&<p>{text('没有匹配的文章。','No matching writing.')}</p>}
  </section>;
}

function Taste({lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const descriptions={
    'kami-reader':text('长文优先。用暖纸色与衬线字拉开正文、图示和侧栏的层次，让侧栏退到读者需要它的时候。','Long-form reading comes first. Warm paper and serif text establish a hierarchy between prose, diagrams and a sidebar that stays in the background until needed.'),
    'card-skill':text('先决定读者该看见什么。读书海报保留三条主线，A2A 封面只画交接边界，研究解释图突出阶段顺序。不同信息关系用不同版式。','Decide what the reader should see first. The reading poster keeps three threads, the A2A cover shows only the handoff, and the research diagram stresses the sequence of stages. Each layout follows the relationship it needs to show.')
  };
  return <section>
    <header className="space-heading"><h1>{lensInfo.taste.navigation[lang]}</h1><p>{text('一套版式照顾持续阅读，一套工具帮助选出值得放大的内容。','One set of layouts supports sustained reading. The other helps decide what to put in focus.')}</p></header>
    {[...tasteProducts].reverse().map(product=><section key={product.id} className="space-editorial-section"><h2>{product.name}</h2><p>{descriptions[product.id]}</p><div className="space-print-grid">{product.works.map((work,index)=>{
      const [title,description]=lang==='zh'?[work.title,work.description]:tasteEnglish[work.image];
      return <figure key={work.id}><SceneLink route={{view:'taste',arg:product.id,work:index}}><Media src={assets+work.image} alt="" loading={product.id==='kami-reader'?'eager':'lazy'}/><strong>{title} <span aria-hidden="true">→</span></strong></SceneLink><figcaption>{description}</figcaption></figure>;
    })}</div></section>)}
    <SceneLink className="space-index-link" route={{view:'projects',source:'taste'}}>{text('浏览全部项目 →','Browse all projects →')}</SceneLink>
  </section>;
}

function Ai({entries,lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  return <section>
    <header className="space-heading"><h1>{lensInfo.ai.navigation[lang]}</h1></header>
    <div className="space-ai-groups">
      <section aria-labelledby="ai-projects"><h2 id="ai-projects">{text('GitHub 项目','GitHub projects')}</h2><ul className="space-rows">{['script-weaver','videowipe'].map(id=>{
        const project=projects.find(p=>p.slug===id);
        return <li key={id}><SceneLink route={{view:'projects',item:id,source:'ai'}}><span><strong>{project.name}</strong><span>{text(project.thesisZh,project.thesis)}</span></span><span aria-hidden="true">→</span></SceneLink></li>;
      })}</ul><SceneLink className="space-index-link" route={{view:'projects',source:'ai'}}>{text('全部项目 →','All projects →')}</SceneLink></section>
      <section aria-labelledby="ai-writing"><h2 id="ai-writing">{text('技术写作','Technical writing')}</h2><ul className="space-rows">{aiWritingIds.map(id=>{
        const note=entries.find(n=>n.id===id);
        return <li key={id}><SceneLink route={{view:'notes',item:id,source:'ai'}}><span><strong>{note.title}</strong><span>{note.teaser}</span></span><span aria-hidden="true">→</span></SceneLink></li>;
      })}</ul><SceneLink className="space-index-link" route={{view:'notes',source:'ai',topic:'ai'}}>{text('全部技术写作 →','All technical writing →')}</SceneLink></section>
    </div>
  </section>;
}

function Execution({lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const evidence=(anchor)=>({view:'about',source:'execution',anchor});
  return <article className="space-execution">
    <header className="space-heading"><h1>{lensInfo.execution.navigation[lang]}</h1><h2>{text('一次长任务，怎么恢复并确认完成？','How does a long run recover and reach completion?')}</h2><p>{text('2026 年，我负责 AI 漫剧生成系统的技术方案、质量评估和验收标准。中间报错需要有界恢复，生成结果也需要独立检查。','In 2026 I led the technical design, quality evaluation and acceptance criteria for an AI comics generation system. Mid-run failures needed bounded recovery. The output needed independent checks.')}</p></header>
    <section className="pb-path space-workflow" aria-labelledby="workflow"><h2 id="workflow">{text('工作流程','Workflow')}</h2><ol>{(lang==='zh'?['理解剧本','提取角色资产','生成结构化多镜头分镜','独立质检与有界纠错']:['Understand the script','Extract character assets','Generate structured multi-shot storyboards','Grade quality and bound corrections']).map(step=><li key={step}><strong>{step}</strong></li>)}</ol></section>
    <section className="space-editorial-section"><h2>{text('恢复与验收','Recovery and acceptance')}</h2><p>{text('质量侧把分镜质检打分独立出来，并为自动纠错设定成本上限。运行侧通过熔断、动态并发和断点恢复处理长任务中的偶发故障。固定集评估检查了分镜问题率，长任务实测记录了报错后能否把这一轮跑完。','For output quality, we graded storyboards independently and capped the cost of automatic correction. For runtime failures, we used circuit breaking, dynamic concurrency and bounded checkpoint recovery. The fixed set measured storyboard quality. The long run recorded whether that particular batch finished after errors.')}</p>
      <div className="pb-results space-evidence"><div><h3>{text('固定评测集','Fixed evaluation set')}</h3><strong>≈18% → 9.53%</strong><p>{text('同一固定集合上的动作过载与景别失当问题率。','Rate of overloaded action and unsuitable shot scale on the same fixed set.')}</p><SceneLink route={evidence('storyboard-evaluation')}>{text('查看公开履历中的评测记录 →','See the evaluation entry in the public work record →')}</SceneLink></div><div><h3>{text('单次长任务实测','One long-run test')}</h3><strong>{text('20 集','20 episodes')}</strong><p>{text('一次实际运行，中途报错后自动恢复并跑完全部 20 集。','One observed run recovered from intermediate failures and completed all 20 episodes.')}</p><SceneLink route={evidence('storyboard-recovery')}>{text('查看公开履历中的恢复记录 →','See the recovery entry in the public work record →')}</SceneLink></div></div>
      <p className="space-evidence-limit">{text('公开材料是个人履历。评测样本量、原始打分、运行日志和故障明细未公开。两条记录可核对网页引用和各自口径。单次运行不足以估算长期成功率。','The public source is my work record. It provides no sample count, raw scores, run logs or incident details. The linked entries let readers check the wording and scope. One run cannot establish a long-run success rate.')}</p>
    </section>
    <div className="space-links"><SceneLink route={evidence('storyboard-generation')}>{text('查看技术职责 →','See the technical responsibilities →')}</SceneLink><SceneLink route={{view:'projects',source:'execution'}}>{text('浏览项目台 →','Browse projects →')}</SceneLink></div>
  </article>;
}

function About({lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  function rewriteHref(href){
    if(href.endsWith('/projects/#tracework'))return routePath({view:'projects',item:'tracework',source:'about'},lang);
    if(href.endsWith('/projects/#card-skill'))return routePath({view:'projects',item:'card-skill',source:'about'},lang);
    if(href==='/notes/?topic=memory')return routePath({view:'notes',topic:'memory',source:'about'},lang);
    return href;
  }
  return <section className="space-about">
    <div className="pb-about-hero"><header className="space-heading"><h1>{text('关于 Kenny 吴嘉业','About Kenny Wu')}</h1><p>{text('我在深圳做 AI 工程。早期做智能搜索和会话分析，后来负责企业问答与交互质量，再到短剧剪辑和 AI 漫剧生成。工作从理解一次查询，延伸到让跨集的任务可以核验、可以恢复。','I’m an AI engineer in Shenzhen. I started in intelligent search and conversation analysis, worked on enterprise Q&A and interaction quality, and moved into short-drama editing and AI comics generation. The work grew from understanding a single query to making multi-episode jobs verifiable and recoverable.')}</p><a href={`mailto:${site.email}`}>{text('联系我 ↗','Contact me ↗')}</a></header><figure className="pb-portrait"><Media src={assets+'self-profo.jpg'} alt={text('吴嘉业的肖像','Portrait of Kenny Wu')}/></figure></div>
    <section className="space-editorial-section"><h2>{text('我负责的判断','Decisions I’m responsible for')}</h2><p>{text('企业问答里，我用文档层级和多路召回来处理检索；短剧剪辑里，我负责跨集角色对齐；漫剧生成里，我负责决定怎么验收分镜，以及失败后允许花多少成本纠错。这些工作把“模型输出是否可用”落到可以检查的环节。','In enterprise Q&A, I used document hierarchy and multiple retrieval paths. In short-drama editing, I led cross-episode character alignment. In AI comics generation, I owned storyboard acceptance criteria and the bounds on corrective work. Each role gave me a concrete place to check whether the model’s output was usable.')}</p><div className="space-links"><SceneLink route={{view:'lens',arg:'execution',source:'about'}}>{text('看漫剧生成案例 →','Read the comics generation case →')}</SceneLink><SceneLink route={{view:'projects',source:'about'}}>{text('浏览公开项目 →','Explore public projects →')}</SceneLink></div></section>
    <AboutMore lang={lang} visible rewriteHref={rewriteHref}/>
  </section>;
}

export default function SpaceApp({initialRoute,locale:lang}){
  const text=(zh,en)=>localized(lang,zh,en);
  const [route,setRoute]=useState(initialRoute);
  const [controls,setControls]=useState(initialControls);
  const [ready,setReady]=useState(false);
  const [theme,setTheme]=useState('system');
  const themeController=useRef(null);
  const pending=useRef(null);
  const main=useRef(null);
  const latest=useRef(controls);
  const entries=useMemo(()=>notes.map(note=>localizedNote(note,lang)),[lang]);
  const selectedEntries=useMemo(()=>curated.map(note=>localizedNote(note,lang)),[lang]);
  function update(patch){setControls(current=>({...current,...patch}));}
  useLayoutEffect(()=>{latest.current=controls;},[controls]);
  useEffect(()=>{
    const controller=createThemeController(setTheme);
    themeController.current=controller;
    return ()=>controller.destroy();
  },[]);
  useEffect(()=>{
    const readLocation=()=>setRoute(parseRoute(new URL(location.href)));
    const openAnchor=()=>{
      const target=document.getElementById(location.hash.slice(1));
      if(!target)return;
      const disclosure=target.closest('details');
      if(disclosure)disclosure.open=true;
      target.scrollIntoView({block:'start'});
    };
    function save(focus=document.activeElement){
      const state={controls:latest.current,scroll:window.scrollY,focus:focus?.id||focus?.getAttribute('href')};
      history.replaceState({...history.state,space:state},'');
      try{sessionStorage.setItem(storagePrefix+viewKey(location),JSON.stringify(state));}catch{}
    }
    function onLink(event){
      const link=event.target.closest('a[href]');
      if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.origin!==location.origin||address(link)===address(location))return;
      save(link);
      if(!link.hasAttribute('data-space-return'))return;
      const navigation=window.navigation;
      const previous=navigation?.entries().find(entry=>entry.index===navigation.currentEntry.index-1);
      if(previous?.url===link.href){
        event.preventDefault();
        history.back();
        return;
      }
      try{sessionStorage.setItem(storagePrefix+'destination',address(link));}catch{}
    }
    const pagehide=()=>save();
    const hashchange=()=>{readLocation();openAnchor();};
    const navigation=performance.getEntriesByType('navigation')[0]?.type;
    let saved=history.state?.space;
    try{
      const destination=sessionStorage.getItem(storagePrefix+'destination');
      if(destination===address(location)){
        saved ||= JSON.parse(sessionStorage.getItem(storagePrefix+viewKey(location))||'null');
        sessionStorage.removeItem(storagePrefix+'destination');
      }else if(!saved&&document.referrer){
        const previous=new URL(document.referrer);
        const detail=parseRoute(previous);
        if(previous.origin===location.origin&&detail.view==='story'&&new URL(storyReturnPath(detail,lang),location.origin).pathname===location.pathname){
          saved=JSON.parse(sessionStorage.getItem(storagePrefix+viewKey(location))||'null');
        }
      }
    }catch{}
    if(saved){setControls(saved.controls);pending.current=saved;}
    readLocation();setReady(true);
    if(location.hash&&!saved)requestAnimationFrame(openAnchor);
    if(navigation==='back_forward'&&saved)history.scrollRestoration='manual';
    window.addEventListener('pagehide',pagehide);
    window.addEventListener('hashchange',hashchange);
    window.addEventListener('popstate',readLocation);
    document.addEventListener('click',onLink);
    return ()=>{
      window.removeEventListener('pagehide',pagehide);
      window.removeEventListener('hashchange',hashchange);
      window.removeEventListener('popstate',readLocation);
      document.removeEventListener('click',onLink);
    };
  },[]);
  useLayoutEffect(()=>{
    if(!ready||!pending.current)return;
    const {scroll,focus}=pending.current;
    pending.current=null;
    const target=focus&&(document.getElementById(focus)||[...document.links].find(link=>link.getAttribute('href')===focus));
    (target||main.current)?.focus({preventScroll:true});
    window.scrollTo({top:scroll,behavior:'instant'});
  },[ready]);
  useEffect(()=>{
    document.title=routeTitle(route,lang);
    const absolute=locale=>new URL(canonicalPath(route,locale),site.canonical).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',absolute(lang));
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',absolute(lang));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    for(const link of document.querySelectorAll('link[hreflang][rel="alternate"]'))link.href=absolute(link.hreflang==='zh-CN'?'zh':'en');
  },[route,lang]);
  function setTopic(topic){
    const next={...route,topic:topic==='all'?undefined:topic};
    history.replaceState(history.state,'',routePath(next,lang));
    setRoute(next);
  }
  const back=returnRoute(route);
  const backLabel=back.view==='lens'?lensInfo[back.arg].navigation[lang]:({projects:text('项目台','Projects'),notes:text('文章','Writing'),about:text('关于','About'),home:text('首页','Home')})[back.view];
  const project=route.view==='projects'&&projects.find(p=>p.slug===route.item);
  const selected=selectedEntries.find(note=>note.id===controls.selected)||selectedEntries[0];
  const linkFor=(target,locale=lang)=>routePath(target,locale);
  const languageHref=linkFor({...route,anchor:ready?location.hash.slice(1):undefined},lang==='zh'?'en':'zh');
  const artwork=tasteProducts.find(product=>product.id===route.arg);

  return <RoutePathContext.Provider value={linkFor}><div className="proto-site collage-inner formal-space" data-view={route.view}>
    <header className="pb-header">
      <SceneLink className="pb-brand" route={{view:'home'}} data-space-return="">Kenny Wu</SceneLink>
      <CollageNav lang={lang} view={route.view} topic={route.view==='lens'?route.arg:route.view==='taste'?'taste':undefined} mode="formal"/>
      <div className="pb-tools"><div className="pb-theme" role="group" aria-label={text('明暗主题','Theme')}>
        {Object.entries({system:text('系统','Auto'),light:text('亮色','Light'),dark:text('暗色','Dark')}).map(([id,label])=><button key={id} type="button" aria-pressed={theme===id} onClick={()=>themeController.current?.set(id)}>{label}</button>)}
      </div><a className="pb-language" href={languageHref} hrefLang={lang==='zh'?'en':'zh-CN'}>{text('EN','中文')}</a></div>
    </header>
    <main id="main" className="pb-main" ref={main} tabIndex="-1">
      <div className="pb-viewline"><SceneLink className="pb-back" route={back} data-space-return="">← {backLabel}</SceneLink></div>
      {route.view==='lens'&&route.arg==='online'&&<LensTuner expanded={false} entries={selectedEntries} curated={selectedEntries} selected={selected} onSelect={id=>update({selected:id})} lang={lang} formal/>}
      {route.view==='lens'&&route.arg==='taste'&&<Taste lang={lang}/>}
      {route.view==='lens'&&route.arg==='ai'&&<Ai entries={entries} lang={lang}/>}
      {route.view==='lens'&&route.arg==='execution'&&<Execution lang={lang}/>}
      {route.view==='taste'&&artwork&&<TasteViewer productId={route.arg} index={route.work||0} lang={lang} formal/>}
      {route.view==='projects'&&(project?<ProjectDetail project={project} route={route} lang={lang}/>:<ProjectIndex controls={controls} update={update} route={route} lang={lang}/>)}
      {route.view==='notes'&&<Writing entries={entries} route={route} query={controls.query} setQuery={query=>update({query})} setTopic={setTopic} lang={lang}/>}
      {route.view==='about'&&<About lang={lang}/>}
    </main>
  </div></RoutePathContext.Provider>;
}
