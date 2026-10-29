import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {LensTuner,TasteViewer,tasteProducts,ResearchViewer,AboutMore} from './Scenes';
import {prototypeText,localizedNote,tasteEnglish} from '../../data/space-i18n';
import {lensInfo,projects,notes,observations,curated,projectVisual,aiWritingIds,zh,en} from '../../data/space';
import {parseRoute,routePath,routeTitle,canonicalPath} from '../../lib/space-routes';
import {SceneLink} from './SceneLink';
import {Media} from './Media';
import {HomePlayground} from './HomePlayground';
import {githubSnapshot} from '../../data/projects';
import {site} from '../../data/site';
import {createThemeController} from '../../lib/theme';
const A='/assets/space/';
const focusKey=n=>n?.id||n?.getAttribute('href')||n?.getAttribute('aria-label')||n?.textContent?.trim();
function ProjectVisual({project,large=false,anchor=false,lang='zh'}){
  if(project.slug==='videowipe')return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-wipe ${large?'is-large':''}`} role="img" aria-label={prototypeText(lang,'VideoWipe 同一画面处理前后：字幕被清除','VideoWipe comparison of the same frame before and after subtitle removal')}><Media src={A+'videowipe-before.jpg'} alt=""/><Media src={A+'videowipe-after.jpg'} alt="" className="wipe-after"/><span className="wipe-divider"></span><span className="wipe-label before">{prototypeText(lang,'处理前','Before')}</span><span className="wipe-label after">{prototypeText(lang,'处理后','After')}</span></div>;
  const media=projectVisual[project.slug];
  if(media)return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual image-${media.kind} ${large?'is-large':''}`}><Media src={A+media.src} alt={project.name+prototypeText(lang,' 项目图像',' project image')} /><span className="visual-stamp mono">{media.kind==='poster'?'ACTUAL OUTPUT':'ACTUAL INTERFACE'} / {project.name.toUpperCase()}</span></div>;
  if(project.slug==='script-weaver')return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-script ${large?'is-large':''}`}><span className="script-top mono">AGENT / PRODUCTION SYSTEM</span><div className="script-diagram"><span>STORY<br/>IDEA</span><i>→</i><span>SCREEN<br/>PLAY</span><i>→</i><span>STORY<br/>BOARD</span></div><strong>Script-Weaver</strong><span className="visual-stamp mono">PROCESS SCHEMATIC · NOT A PRODUCT SCREENSHOT</span></div>;
  return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-type ${large?'is-large':''}`}><span className="mono">{project.tagline}</span><strong>{project.name}</strong><p>{lang==='zh'?project.thesisZh:project.thesis}</p><span className="visual-stamp mono">PROJECT / {project.language||'RESEARCH'}</span></div>;
}

export default function SpaceApp({initialRoute,locale}){
  const routeFromHash=()=>typeof window==='undefined'?initialRoute:parseRoute(new URL(location.href));
  const routeHash=r=>routePath(r,locale);
  const [route,setRoute]=useState(initialRoute);
  const [theme,setTheme]=useState('system');
  const lang=locale;
  const themeController=useRef(null);
  const [settings,setSettings]=useState(false);
  const [homeMotionPaused,setHomeMotionPaused]=useState(false);
  const [projectId,setProjectId]=useState(()=>projects.some(p=>p.slug===initialRoute.item)?initialRoute.item:'script-weaver');
  const [noteId,setNoteId]=useState(()=>notes.some(n=>n.id===initialRoute.item)?initialRoute.item:'goal');
  const [showArchived,setShowArchived]=useState(()=>!!projects.find(p=>p.slug===initialRoute.item)?.archived);
  const [noteQuery,setNoteQuery]=useState('');
  const [noteFilter,setNoteFilter]=useState(initialRoute.topic||'all');
  const [projectSort,setProjectSort]=useState('selected');
  const [projectFilter,setProjectFilter]=useState('all');
  const [projectQuery,setProjectQuery]=useState('');
  const pendingRestore=useRef(null);
  const historyReady=useRef(false);
  const [restoreSequence,setRestoreSequence]=useState(0);
  const routeMotion=useRef(null);
  const mainRef=useRef(null);
  const t=lang==='zh'?zh:en;
  const text=(zh,en)=>prototypeText(lang,zh,en);
  const displayObservations=useMemo(()=>observations.map(n=>localizedNote(n,lang)),[lang]);
  const displayCurated=useMemo(()=>curated.map(n=>localizedNote(n,lang)),[lang]);

  useEffect(()=>{try{setHomeMotionPaused(sessionStorage.getItem('kenny-home-motion-paused')==='true');}catch{}},[]);
  function toggleHomeMotion(){
    const paused=!homeMotionPaused;setHomeMotionPaused(paused);
    try{sessionStorage.setItem('kenny-home-motion-paused',String(paused));}catch{}
  }
  useEffect(()=>{const controller=createThemeController(setTheme);themeController.current=controller;return()=>controller.destroy();},[]);
  useEffect(()=>{
    document.title=routeTitle(route,lang);
    const canonical=new URL(canonicalPath(route,lang),site.canonical).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    for(const link of document.querySelectorAll('link[hreflang]'))link.setAttribute('href',new URL(canonicalPath(route,link.hreflang==='zh-CN'?'zh':'en'),site.canonical).href);
  },[route,lang]);
  function snapshot(){return {projectId,noteId,projectFilter,projectQuery,showArchived,projectSort,noteQuery,noteFilter,scroll:window.scrollY,focusKey:focusKey(document.activeElement)};}
  // Browser Back can leave without calling our navigation functions. Keep the current
  // entry up to date so Forward also restores searches, filters, scroll and focus.
  useEffect(()=>{
    let timer;
    const save=()=>{if(historyReady.current&&history.state?.proto&&routeHash(history.state.route)===routeHash(route)){
      if(route.view==='projects'&&filteredProjects.length&&!filteredProjects.some(p=>p.slug===projectId))return;
      const current=snapshot();history.replaceState({...history.state,snapshot:current},'',location.href);
      try{sessionStorage.setItem('kenny-view:v1:'+routeHash(route),JSON.stringify(current));}catch{}
    }};
    const onScroll=()=>{clearTimeout(timer);timer=setTimeout(save,120);};
    save();addEventListener('scroll',onScroll,{passive:true});document.addEventListener('focusin',save);
    return()=>{clearTimeout(timer);removeEventListener('scroll',onScroll);document.removeEventListener('focusin',save);};
  },[route,projectId,noteId,projectFilter,projectQuery,showArchived,projectSort,noteQuery,noteFilter]);
  useEffect(()=>{
    const resolved=routeFromHash();if(resolved.topic)setNoteFilter(resolved.topic); if(JSON.stringify(resolved)!==JSON.stringify(initialRoute)){setRoute(resolved);if(resolved.view==='projects'&&resolved.item){setProjectId(resolved.item);if(projects.find(p=>p.slug===resolved.item)?.archived)setShowArchived(true);}if(resolved.view==='notes'&&resolved.item)setNoteId(resolved.item);}
    let saved=history.state?.proto&&routeHash(history.state.route)===routeHash(resolved)?history.state.snapshot:null;
    // Some embedded browsers recreate documents when using their Back/Forward controls.
    if(!saved)try{saved=JSON.parse(sessionStorage.getItem('kenny-view:v1:'+routeHash(resolved))||'null');}catch{}
    if(saved){setProjectId(saved.projectId);setNoteId(saved.noteId);setProjectFilter(saved.projectFilter);setProjectQuery(saved.projectQuery);setShowArchived(saved.showArchived||false);setProjectSort(saved.projectSort||'selected');setNoteQuery(saved.noteQuery||'');setNoteFilter(saved.noteFilter||'all');pendingRestore.current=saved;setRestoreSequence(n=>n+1);}
    if(!history.state?.proto)history.replaceState({proto:true,depth:0,route:resolved},'',location.href);
    historyReady.current=true;
    const onPop=e=>{
      const saved=e.state?.snapshot;
      if(saved){setProjectId(saved.projectId);setNoteId(saved.noteId);setProjectFilter(saved.projectFilter);setProjectQuery(saved.projectQuery);setNoteQuery(saved.noteQuery||'');setNoteFilter(saved.noteFilter||'all');setShowArchived(saved.showArchived||false);setProjectSort(saved.projectSort||'selected');pendingRestore.current=saved;}
      const next=e.state?.route||routeFromHash();
      if(!saved&&next.item){if(next.view==='projects')setProjectId(next.item);if(next.view==='notes')setNoteId(next.item);}
      setRoute(next);setSettings(false);setRestoreSequence(n=>n+1);
    };
    const onPointer=()=>document.documentElement.dataset.input='pointer';
    const onKey=()=>document.documentElement.dataset.input='keyboard';
    const onHashChange=()=>{
      if(routeFromHash().view==='about'){
        const target=document.getElementById(location.hash.slice(1));
        target?.closest('details')?.setAttribute('open','');target?.scrollIntoView({behavior:'instant'});
      }else onPop({state:null});
    };
    const oldAnchor=document.getElementById(location.hash.slice(1));
    if(oldAnchor&&resolved.view==='about'){
      oldAnchor.closest('details')?.setAttribute('open','');
      requestAnimationFrame(()=>oldAnchor.scrollIntoView({behavior:'instant'}));
    }
    addEventListener('popstate',onPop);addEventListener('hashchange',onHashChange);addEventListener('pointerdown',onPointer);addEventListener('wheel',onPointer,{passive:true});addEventListener('keydown',onKey);
    return()=>{removeEventListener('popstate',onPop);removeEventListener('hashchange',onHashChange);removeEventListener('pointerdown',onPointer);removeEventListener('wheel',onPointer);removeEventListener('keydown',onKey);};
  },[]);
  useLayoutEffect(()=>{
    const saved=pendingRestore.current;pendingRestore.current=null;
    window.scrollTo({top:saved?.scroll||0,behavior:'instant'});
    const target=saved?[...document.querySelectorAll('button,a,input,summary')].find(n=>focusKey(n)===saved.focusKey):(mainRef.current?.querySelector('.tuner-stage,.research-paper')||mainRef.current);
    (target||mainRef.current?.querySelector('.tuner-stage,.research-paper')||mainRef.current)?.focus({preventScroll:true});
  },[route.view,route.arg,restoreSequence]);
  function commitRoute(next){
    const update=()=>flushSync(()=>{setRoute(next);setSettings(false);});
    if(document.startViewTransition&&document.documentElement.dataset.input!=='keyboard'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!(next.view==='notes'&&route.view==='lens'&&route.arg==='online')&&!(route.view==='notes'&&next.view==='lens'&&next.arg==='online')){
      routeMotion.current?.skipTransition();routeMotion.current=document.startViewTransition(update);
    }else update();
  }
  function navigate(view,arg='',work=0,item=''){
    const next={view,arg,work,item};
    if(next.view===route.view&&next.arg===route.arg&&next.work===(route.work||0)&&item===(route.item||''))return;
    history.replaceState({...history.state,snapshot:snapshot()},'',location.href);
    history.pushState({proto:true,depth:(history.state?.depth||0)+1,route:next},'',routeHash(next));
    if(route.view==='lens'&&route.arg==='online'&&view==='notes')pendingRestore.current={scroll:window.scrollY,focusIndex:-1};
    if(view==='lens'&&arg==='online'&&!curated.some(n=>n.id===noteId))setNoteId(curated[0].id);
    commitRoute(next);
  }
  function back(){
    if((history.state?.depth||0)>0){history.replaceState({...history.state,snapshot:snapshot()},'',location.href);history.back();return;}
    if(route.view==='taste')navigate('lens','taste');
    else if(['projects','notes'].includes(route.view)&&lensInfo[route.arg])navigate('lens',route.arg);
    else if(route.view==='about'&&route.arg==='execution')navigate('lens','execution');
    else navigate('home');
  }
  useEffect(()=>{
    const onKey=e=>{
      if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;
      if(settings){setSettings(false);document.querySelector('.environment-trigger')?.focus({preventScroll:true});return;}
      if(route.view!=='home')back();
    };
    addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey);
  },[route,settings,projectId,noteId,projectFilter,projectQuery]);
  function openProjects(from,slug,e){
    if(slug)setProjectId(slug);setProjectQuery('');setProjectFilter('all');
    const media=e?.currentTarget.querySelector('.project-visual');
    if(media)media.style.viewTransitionName='selected-work';
    navigate('projects',from,0,slug||projectId);
    routeMotion.current?.finished.finally(()=>{if(media)media.style.viewTransitionName='';});
  }
  function openNotes(from,id,e){
    if(id)setNoteId(id);
    const paper=e?.currentTarget.querySelector('.note-paper');if(paper)paper.style.viewTransitionName='selected-writing';
    navigate('notes',from,0,id||noteId);
    routeMotion.current?.finished.finally(()=>{if(paper)paper.style.viewTransitionName='';});
  }
  function replaceSelection(view,id){
    if(view==='projects')setProjectId(id);else setNoteId(id);
    if(route.view!==view)return;
    const next={...route,item:id};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);
  }
  function selectProject(id){replaceSelection('projects',id);}
  function selectNote(id){replaceSelection('notes',id);}
  useEffect(()=>{
    if(!settings)return;
    const dismiss=e=>{if(!e.target.closest('.environment'))setSettings(false);};
    document.addEventListener('pointerdown',dismiss);return()=>document.removeEventListener('pointerdown',dismiss);
  },[settings]);
  function selectTaste(index){
    const next={...route,work:index};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);
  }
  function handleSceneClick(e){
    const anchor=e.target.closest('a[data-scene]');
    if(!anchor||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const url=new URL(anchor.href);
    if(url.origin!==location.origin)return;
    e.preventDefault();
    const next=parseRoute(url);
    if(next.view==='projects'){
      if(route.view==='projects'){selectProject(next.item);return;}
      setProjectId(next.item||'script-weaver');setProjectFilter('all');setProjectQuery('');
      setShowArchived(!!projects.find(p=>p.slug===next.item)?.archived);
    }
    if(next.view==='notes')setNoteId(next.item||'goal');
    const media=anchor.querySelector('.project-visual,.note-paper');
    if(media)media.style.viewTransitionName=media.classList.contains('note-paper')?'selected-writing':'selected-work';
    navigate(next.view,next.arg,next.work,next.item);
    const clear=()=>{if(media)media.style.viewTransitionName='';};
    if(routeMotion.current)routeMotion.current.finished.then(clear,clear);else clear();
  }
  const activeProject=projects.find(p=>p.slug===projectId)||projects[0];
  const activeNote=displayObservations.find(n=>n.id===noteId)||displayObservations[0];
  const filteredProjects=useMemo(()=>projects.filter(p=>(showArchived||!p.archived)&&(projectFilter==='all'||p.practice===projectFilter)&&(!projectQuery||`${p.name} ${p.thesisZh} ${p.descriptionZh} ${p.thesis} ${p.description}`.toLowerCase().includes(projectQuery.toLowerCase()))).sort((a,b)=>projectSort==='updated'?b.pushedAt.localeCompare(a.pushedAt):projectSort==='stars'?b.stars-a.stars:Number(b.featured)-Number(a.featured)||b.stars-a.stars),[projectFilter,projectQuery,showArchived,projectSort]);
  useEffect(()=>{if(route.view==='projects'&&filteredProjects.length&&!filteredProjects.some(p=>p.slug===projectId))selectProject(filteredProjects[0].slug)},[route.view,filteredProjects,projectId]);


  const screenName=route.view==='taste'?'Taste':route.view==='home'?'Home':route.view==='lens'?lensInfo[route.arg]?.name:route.view==='projects'?'Projects':route.view==='notes'?'Notes':'About';
  return <div className={`site site-${route.view}`} onClick={handleSceneClick}>
    <div className="light-field" aria-hidden="true"></div>
    <header className="site-header">
      {route.view==='home'?<span className="brand brand-signature">Kenny Wu</span>:<SceneLink className="brand" type="button"  route={{view:'home',arg:''}} lang={lang} aria-label={text('回到首页','Return Home')}>Kenny Wu <span aria-hidden="true">→</span></SceneLink>}
      <span className="header-context mono">{route.view==='home'?'FOUR STATES / ONE PERSON':`KENNY WU / ${screenName?.toUpperCase()}`}</span>
      <a className="header-contact mono" href={`mailto:${site.email}`}>{t.contact} ↗</a>
    </header>

    {route.view==='home'&&<HomePlayground lang={lang} mainRef={mainRef} settingsOpen={settings} paused={homeMotionPaused} onTogglePaused={toggleHomeMotion}/>}

    {route.view==='lens'&&route.arg!=='online'&&<main id="main" className={`near-scene near-${route.arg} screen-enter`} data-screen-label={`${lensInfo[route.arg]?.name||''} lens`} ref={mainRef} tabIndex="-1" onClick={e=>{if(e.target===e.currentTarget)navigate('home')}}>
      <div className="near-shell" onClick={e=>e.stopPropagation()}>
        <div className="view-line"><SceneLink type="button"  route={{view:'home',arg:''}} lang={lang}>← {t.home}</SceneLink><span className="mono">{lensInfo[route.arg]?.number} / {lensInfo[route.arg]?.name.toUpperCase()} · {t.selected.toUpperCase()}</span></div>
        {route.arg==='taste'&&<section className="taste-layout">
          <div className="lens-intro taste-intro"><span className="mono">CREATION / SELECTED WORK</span><h1>{lang==='zh'?<>让想法，<br/>有自己的形状。</>:<>Give ideas<br/>a form.</>}</h1><p>{lang==='zh'?'把文本和阅读，做成具体的作品。':'Turn text and reading into tangible craft.'}</p></div>
          <div className="taste-pair">
            <SceneLink className="taste-object taste-paper" type="button"  route={{view:'taste',arg:'card-skill'}} lang={lang}><span className="taste-number mono">01 / VISUAL TOOL</span><div className="taste-visual"><Media src={A+'qiwu.png'} alt={text('《彼与是》视觉海报','This and That: visual poster')}/><Media src={A+'handoff-cover.png'} alt={text('Agent 长时交接封面','Long-running Agent handoff cover')}/></div><span className="taste-title"><strong>card-skill</strong><small>{text('把文本变成可阅读的视觉作品。','Turn text into visual work.')}</small><i>→</i></span></SceneLink>
            <SceneLink className="taste-object taste-window" type="button"  route={{view:'taste',arg:'kami-reader'}} lang={lang}><span className="taste-number mono">02 / READING SYSTEM</span><div className="taste-visual"><Media src={A+'kami.png'} alt={text('Kami Reader 真实界面','Actual Kami Reader interface')}/></div><span className="taste-title"><strong>Kami Reader</strong><small>{text('让长时间阅读停留在内容本身。','Keep sustained reading focused on the text itself.')}</small><i>→</i></span></SceneLink>
          </div>
          <SceneLink className="passage" type="button"  route={{view:'projects',arg:'taste',item:'card-skill'}} lang={lang}><span className="mono">CONTINUE / PROJECTS</span><strong>{lang==='zh'?'在这两款产品之外，浏览更多项目':'Explore more projects beyond these products'}</strong><em>→</em></SceneLink>
        </section>}
        {route.arg==='ai'&&<section className="ai-layout ai-exhibition">
          <div className="lens-intro ai-intro"><h1>{lang==='zh'?'做出来，也拆开看。':'Build it. Study it.'}</h1></div>
          <div className="ai-pair">
            <h2 className="ai-type-heading">{text('GitHub 项目','GitHub projects')}</h2><h2 className="ai-type-heading">{text('专业文章','Technical writing')}</h2>
            {['script-weaver',aiWritingIds[0],'videowipe',aiWritingIds[1]].map(id=>{
              const p=projects.find(p=>p.slug===id);
              if(p)return <SceneLink className="ai-sample ai-sample-project" type="button" key={id}  route={{view:'projects',arg:'ai',item:id}} lang={lang}><span className="sample-kind">{text('项目','Project')}</span><Media className="perch" src={A+'ai-perch.webp'} alt=""/><div className="sample-material" aria-label={id==='script-weaver'?text('工作流程示意，非产品截图','Process schematic, not a product screenshot'):undefined}><ProjectVisual project={p} lang={lang}/></div><span className="sample-caption"><strong>{p.name}</strong><small>{id==='script-weaver'?text('剧本与分镜生成','Script & storyboard generation'):text('视频字幕与遮挡清理','Subtitle & watermark removal')}</small><b aria-hidden="true">→</b></span></SceneLink>;
              const n=displayObservations.find(n=>n.id===id),memory=id===aiWritingIds[0];
              return <SceneLink className="ai-sample ai-sample-note" type="button" key={id}  route={{view:'notes',arg:'ai',item:id}} lang={lang}><span className="sample-kind">{text('文章','Writing')}</span><Media className="perch" src={A+'ai-perch.webp'} alt=""/><div className="note-paper"><time className="mono">{n.date.replace('-', '.')}</time><strong>{memory?text(<>记忆如何<br/>决定行动</>,<>When memory<br/>shapes action</>):text(<>压缩之后，<br/>如何接着工作</>,<>Keep working<br/>after compression</>)}</strong></div><span className="sample-caption"><strong>{memory?'Agent Memory Systems':'Claude Code Compact'}</strong><b aria-hidden="true">→</b></span></SceneLink>;
            })}
          </div>
          <div className="ai-more"><SceneLink type="button"  route={{view:'projects',arg:'ai',item:'script-weaver'}} lang={lang}>{lang==='zh'?'全部项目 →':'All projects →'}</SceneLink><SceneLink route={{view:'notes',arg:'ai',item:aiWritingIds[0]}} lang={lang}>{lang==='zh'?'全部专业文章 →':'Technical writing archive →'}</SceneLink></div>
        </section>}
        {route.arg==='execution'&&<section className="execution-layout">
          <div className="execution-lead"><div className="lens-intro"><span className="mono">SYSTEM IN PRACTICE / 2026</span><h1>{lang==='zh'?<>让复杂工作，<br/>走到完成。</>:<>Carry the work<br/>through.</>}</h1></div><p>{text('从剧本理解、角色资产到分镜生成，把质量检查与失败恢复放进同一条工作链路。','Connect script understanding, character assets and storyboards with quality checks and recovery in one workflow.')}</p></div>
          <div className="execution-path"><span className="mono">AI COMICS GENERATION / WORKFLOW</span><div>{(lang==='zh'?['读懂剧本','整理资产','生成分镜','质检与恢复']:['Read the script','Prepare assets','Build storyboards','Check and recover']).map((step,i)=><article key={step}><small className="mono">0{i+1}</small><strong>{step}</strong></article>)}</div><Media src={A+'execution.webp'} alt=""/></div>
          <div className="execution-results"><div><span className="mono">FIXED EVALUATION SET</span><strong>≈18% <i>→</i> 9.53%</strong><p>{text('动作过载与景别失当问题率','Issue rate: overloaded action and unsuitable shot scale')}</p></div><div><span className="mono">ONE LONG RUN</span><strong>20 <small>{text('集','episodes')}</small></strong><p>{text('中间报错后自动恢复，完整跑完','Recovered from runtime errors and completed the full run')}</p></div></div>
          <div className="dual-passage"><SceneLink className="passage" type="button"  route={{view:'projects',arg:'execution',item:'script-weaver'}} lang={lang}><span className="mono">WORK / PROJECTS</span><strong>{text('浏览做过的更多项目','Explore more projects')}</strong><em>→</em></SceneLink><SceneLink className="passage" type="button"  route={{view:'about',arg:'execution'}} lang={lang}><span className="mono">PERSON / ABOUT</span><strong>{text('认识做这些工作的人','Meet the person behind the work')}</strong><em>→</em></SceneLink></div>
        </section>}
      </div>
    </main>}

    {route.view==='projects'&&<main id="main" className="collection-scene project-scene screen-enter" data-screen-label="Projects work table" ref={mainRef} tabIndex="-1">
      <div className="collection-wrap">
        <div className="view-line"><SceneLink route={route.view==='taste'?{view:'lens',arg:'taste'}:route.view==='about'?{view:'home'}:(lensInfo[route.arg]?{view:'lens',arg:route.arg}:{view:'home'})} lang={lang} onActivate={back}>← {route.arg==='home'?t.home:lensInfo[route.arg]?.name||t.home}</SceneLink><span className="mono">02 / PROJECTS · WORK TABLE</span></div>
        <div className="collection-title compact-title"><h1>{t.projectIndex}</h1><p>{text('工具、产品与研究','Tools, products and research')} · {projects.length}</p></div>
        <div className="project-filters"><div className="filter-group" aria-label={text('筛选项目','Filter projects')}>{[['all',text('全部','All')],['make',text('制作','Making')],['think',text('思考','Thinking')],['research',text('研究','Research')],['capture',text('记录','Capture')]].map(([key,label])=><button key={key} type="button" aria-pressed={projectFilter===key} className={projectFilter===key?'active':''} onClick={()=>setProjectFilter(key)}>{label}</button>)}</div><label className="search"><span className="mono">SEARCH</span><input aria-label={text('搜索项目','Search projects')} value={projectQuery} onChange={e=>setProjectQuery(e.target.value)} placeholder={text('名称 / 关键词','Name / keyword')}/></label></div>
        <details className="project-options-disclosure"><summary>{text('排序与归档','Sorting and archive')}</summary><div className="project-options"><label><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>{text('显示归档项目','Include archived projects')}</label><label>{text('排序','Sort')}<select value={projectSort} onChange={e=>setProjectSort(e.target.value)}><option value="selected">{text('精选','Selected')}</option><option value="stars">Stars</option><option value="updated">{text('最近更新','Recently updated')}</option></select></label></div></details>{!filteredProjects.length&&<p className="empty-result">{text('没有找到项目，请换个关键词。','No matching projects. Try another keyword.')}</p>}
        {filteredProjects.length>0&&<div className="work-table">
          <div className="work-surface"><div className="work-surface-top mono"><span>ON THE TABLE / {activeProject.name}</span><span>{activeProject.tagline}</span></div><ProjectVisual project={activeProject} large anchor lang={lang}/><div className="work-surface-foot"><div><span className="mono">{activeProject.practice.toUpperCase()} / {activeProject.language||'PROJECT'}</span><h2>{activeProject.name}</h2><p>{lang==='zh'?activeProject.thesisZh:activeProject.thesis}</p></div><span className="work-index mono">{projects.length} TOTAL</span></div></div>
          <aside className="work-drawer"><div className="drawer-head"><span className="mono">INDEX / {filteredProjects.length} WORKS</span><span className="mono desktop-hint">↓ {text('滚动浏览','SCROLL')}</span><span className="mobile-hint">↔ {text('滑动浏览','SWIPE')}</span></div><div className="drawer-list">{filteredProjects.map((p,i)=><SceneLink id={p.slug} route={{view:'projects',arg:route.arg,item:p.slug}} lang={lang} key={p.slug} aria-current={p.slug===activeProject.slug} className={p.slug===activeProject.slug?'active':''}><span className="mono">{String(i+1).padStart(2,'0')}</span><strong>{p.name}</strong><small>{p.tagline}</small><i>→</i></SceneLink>)}</div></aside>
        </div>}
        {filteredProjects.length>0&&<><div className="collection-bottom"><p>{lang==='zh'?activeProject.descriptionZh:activeProject.description}</p><div><a href={activeProject.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>{activeProject.detailUrl&&<a href={(lang==='zh'?'/zh':'')+activeProject.detailUrl}>{text('项目详解 ↗','Project story ↗')}</a>}{activeProject.homepage&&<a href={activeProject.homepage} target="_blank" rel="noopener noreferrer">{text('访问产品 ↗','Visit product ↗')}</a>}</div></div><p className="project-index-note">{activeProject.stars} stars · {activeProject.forks} forks · {text('更新','Updated')} {activeProject.pushedAt.slice(0,10)} · {text('快照','Snapshot')} <time dateTime={githubSnapshot.date}>{githubSnapshot.date}</time></p></>}
      </div>
    </main>}

    {(route.view==='notes'&&route.arg!=='ai'||route.view==='lens'&&route.arg==='online')&&<main id="main" className="near-scene tuner-scene" data-screen-label="Online observation space" ref={mainRef} tabIndex="-1" onClick={e=>{if(e.target===e.currentTarget)navigate('home');}}>
      <div className="near-shell"><div className="view-line"><SceneLink route={route.view==='notes'?{view:'lens',arg:'online'}:{view:'home'}} lang={lang} onActivate={()=>route.view==='notes'?back():navigate('home')}>← {route.view==='notes'?(route.arg==='ai'?'AI':'Online'):t.home}</SceneLink><span className="mono">{route.view==='notes'?'NOTES / ARCHIVE':'01 / ONLINE'}</span></div>
        <LensTuner query={noteQuery} setQuery={setNoteQuery} filter={noteFilter} setFilter={value=>{setNoteFilter(value);if(route.view==='notes'){const next={...route,topic:value};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);}}} expanded={route.view==='notes'} entries={displayObservations} curated={displayCurated} selected={activeNote} onSelect={selectNote} onExpand={()=>openNotes('online',noteId)} onCollapse={back} collapseLabel={text('← 回到精选观察','← Back to selected observations')} lang={lang}/>
      </div>
    </main>}

    {route.view==='notes'&&route.arg==='ai'&&<main id="main" className="near-scene research-scene" data-screen-label="Selected article" ref={mainRef} tabIndex="-1" onClick={e=>{if(e.target===e.currentTarget)navigate('home');}}><div className="near-shell"><div className="view-line"><SceneLink route={route.view==='taste'?{view:'lens',arg:'taste'}:route.view==='about'?{view:'home'}:(lensInfo[route.arg]?{view:'lens',arg:route.arg}:{view:'home'})} lang={lang} onActivate={back}>← AI</SceneLink><span className="mono">03 / AI · WRITING</span></div><ResearchViewer note={activeNote} entries={displayObservations.filter(n=>n.primary==='ai')} onSelect={selectNote} lang={lang}/></div></main>}

    {route.view==='taste'&&<main id="main" className="near-scene taste-scene" data-screen-label="Taste single artwork" ref={mainRef} tabIndex="-1"><div className="near-shell"><TasteViewer productId={route.arg} index={Math.min(route.work||0,(tasteProducts.find(p=>p.id===route.arg)||tasteProducts[0]).works.length-1)} onSelect={selectTaste} onProducts={back} onProjects={()=>openProjects('taste',route.arg==='kami-reader'?'obsidian-kami':'card-skill')} lang={lang}/></div></main>}

    {route.view==='about'&&<main id="main" className="collection-scene about-scene screen-enter" data-screen-label="About Kenny" ref={mainRef} tabIndex="-1">
      <div className="collection-wrap">
        <div className="view-line"><SceneLink route={route.view==='taste'?{view:'lens',arg:'taste'}:route.view==='about'?{view:'home'}:(lensInfo[route.arg]?{view:'lens',arg:route.arg}:{view:'home'})} lang={lang} onActivate={back}>← {lang==='zh'?'返回上一层':'Back'}</SceneLink><span className="mono">PERSON / BEHIND THE FOUR STATES</span></div>
        <div className="about-hero"><div className="about-words"><span className="mono">KENNY WU / SHENZHEN / AI ENGINEER</span><h1>{text(<>镜头背后，<br/>是同一个人。</>,<>One person,<br/>behind the lenses.</>)}</h1><p>{text('我是 Kenny Wu，一名在深圳的 AI 工程师。经历从 NLP 与信息检索，延伸到多模态理解与内容生成。我最关心的一件事，是如何把前沿模型能力，扎扎实实做成稳定好用的产品。','I’m Kenny Wu, an AI engineer in Shenzhen. My work spans NLP, information retrieval, multimodal understanding and content generation. I care about turning advances in models into stable, useful products.')}</p><a href={`mailto:${site.email}`}>{text('联系我 ↗','Contact me ↗')}</a></div><div className="about-image"><div className="portrait-frame"><div className="portrait-halo" aria-hidden="true"></div><Media className="portrait" src={A+'self-profo.jpg'} width="1080" height="1080" alt={text('Kenny Wu 肖像','Portrait of Kenny Wu')}/></div><span className="mono">{text('KENNY WU / 吴嘉业','KENNY WU / JIAYE WU')}</span></div></div>
        <div className="about-four"><span className="mono">ONE PERSON / FOUR STATES</span><div>{Object.entries(lensInfo).map(([key,l])=><SceneLink key={key} route={{view:'lens',arg:key}} lang={lang}><Media src={A+l.character} alt=""/><span>{l.name}</span><small>→</small></SceneLink>)}</div></div>
        <div className="about-record"><div><span className="mono">EXPERIENCE / SELECTED</span><h2>{text('做事的轨迹','The work so far')}</h2></div><div className="about-timeline"><article><time>2026</time><div><h3>{text('AI 漫剧生成系统','AI comic drama production')}</h3><p>{text('项目技术侧负责人。统筹剧本理解、角色资产与分镜生成，建立质检与恢复机制。','Technical lead, connecting script understanding, character assets and storyboard generation with quality checks and recovery.')}</p><strong>≈18% → 9.53% <small>{text('固定评测集问题率','Issue rate on a fixed evaluation set')}</small></strong></div></article><article><time>2025–2026</time><div><h3>{text('短剧智能剪辑与人物身份一致性','Short-drama editing and character consistency')}</h3><p>{text('围绕跨集角色对齐与高光检索，让自动化剪辑始终咬住同一主角。','Cross-episode character alignment and highlight retrieval keep automated editing focused on the same protagonist.')}</p><strong>1285s → 24s <small>{text('10 集测试样本，身份消歧','Identity disambiguation on one 10-episode sample')}</small></strong></div></article><AboutMore lang={lang}/></div></div>
      </div>
    </main>}

    <div className="environment"><button className="environment-trigger" type="button" aria-label={text('语言与明暗设置','Language and theme settings')} aria-expanded={settings} onClick={()=>setSettings(v=>!v)}>◐<span className="mono">{lang==='zh'?'设置':'SETTINGS'}</span></button>{settings&&<div className="environment-panel"><div><span className="mono">{t.language}</span><a href={routePath(route,'zh')} data-language="zh" className={lang==='zh'?'active':''}>中</a><a href={routePath(route,'en')} data-language="en" className={lang==='en'?'active':''}>EN</a></div><div className="theme-options"><span className="mono">{t.theme}</span><button type="button" aria-pressed={theme==='system'} className={theme==='system'?'active':''} onClick={()=>themeController.current?.set('system')}>{text('跟随系统','System')}</button><button type="button" aria-pressed={theme==='light'} className={theme==='light'?'active':''} onClick={()=>themeController.current?.set('light')}>{t.light}</button><button type="button" aria-pressed={theme==='dark'} className={theme==='dark'?'active':''} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button></div></div>}</div>
    {route.view!=='home'&&<SceneLink className="quiet-home" type="button"  route={{view:'home',arg:''}} lang={lang} aria-label={text('回到首页','Return Home')}>⌂ <span className="mono">HOME</span></SceneLink>}
  </div>;
}
