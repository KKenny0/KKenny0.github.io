import React,{useEffect,useRef,useState} from 'react';
import {lensInfo,curated,notes,projects,zh as spaceZh,en as spaceEn} from '../../data/space';
import {githubSnapshot} from '../../data/projects';
import {tasteProducts} from '../../data/taste';
import {localizedNote,prototypeText,tasteEnglish} from '../../data/space-i18n';
import {routePath} from '../../lib/space-routes';
import {protoRoutePath} from '../../lib/proto-routes';
import {site} from '../../data/site';
import {Media} from './Media';
import {createThemeController} from '../../lib/theme';
import '../../styles/home-workbench.css';
import '../../styles/home-studio.css';

const A='/assets/space/';
const PRACTICES=['online','taste','ai','execution'];

/* One voice line per practice: the characters guide with a single remark,
   they never gate the content — everything on the wall is directly clickable. */
const whispers={
  online:['「变化先看到，再谈判断。」','“Notice the change first; judgment comes after.”'],
  taste:['「好品味，要做成拿得住的实物。」','“Taste only counts once it takes a form you can hold.”'],
  ai:['「拆开看系统，然后自己造一个。」','“Take the system apart, then build one of your own.”'],
  execution:['「复杂的事，跑完才算数。」','“Complex work only counts once it finishes.”']
};
const easelKicker=lang=>({
  online:prototypeText(lang,'观察路线 · 五站，直达原文','OBSERVATION ROUTE · FIVE STOPS, STRAIGHT TO THE ORIGINALS'),
  taste:prototypeText(lang,'灯桌 · 真实作品，可翻看','LIGHT TABLE · REAL WORKS, FLIP THROUGH'),
  ai:prototypeText(lang,'项目 · 在做什么','PROJECT · WHAT IS BEING BUILT'),
  execution:prototypeText(lang,'台账 · 交付记录','LEDGER · DELIVERY RECORD')
});

/* The four real artworks from the repo, on one light table. Each carries its
   artwork page inside the prototype plus the product behind it. */
function lightTable(lang){
  const zh=lang==='zh';
  const en=tasteEnglish;
  const cardWorks=tasteProducts[0].works;
  const kamiWorks=tasteProducts[1].works;
  return [
    {id:'thousand-brains',src:A+'thousand-brains.png',title:zh?cardWorks[0].title:en['thousand-brains.png'][0],teaser:zh?cardWorks[0].description:en['thousand-brains.png'][1],page:protoRoutePath({view:'taste',arg:'card-skill',work:0},lang),product:tasteProducts[0]},
    {id:'kami',src:A+'kami.png',title:zh?kamiWorks[0].title:en['kami.png'][0],teaser:zh?kamiWorks[0].description:en['kami.png'][1],page:protoRoutePath({view:'taste',arg:'kami-reader',work:0},lang),product:tasteProducts[1]},
    {id:'a2a',src:A+'a2a-cover.png',title:zh?cardWorks[1].title:en['a2a-cover.png'][0],teaser:zh?cardWorks[1].description:en['a2a-cover.png'][1],page:protoRoutePath({view:'taste',arg:'card-skill',work:1},lang),product:tasteProducts[0]},
    {id:'stages',src:A+'research-stages.png',title:zh?cardWorks[2].title:en['research-stages.png'][0],teaser:zh?cardWorks[2].description:en['research-stages.png'][1],page:protoRoutePath({view:'taste',arg:'card-skill',work:2},lang),product:tasteProducts[0]}
  ];
}

/* The five-stop observation route: real collection links, localized labels. */
function routeStops(lang){
  return curated.map(note=>{
    const localized=localizedNote(note,lang);
    return {id:note.id,date:localized.date.replace('-','.'),label:localized.label||'',title:localized.title,url:localized.url};
  });
}

export default function HomeStudio({lang}){
  const zh=lang==='zh';
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const t=zh?spaceZh:spaceEn;
  const artworks=lightTable(lang);
  const stops=routeStops(lang);
  const memoryNote=localizedNote(notes.find(n=>n.id==='2060032007506334292'),lang);
  const scriptWeaver=projects.find(p=>p.slug==='script-weaver');
  const strip=notes.filter(n=>!['goal','context-sep'].includes(n.id)).slice(0,4).map(n=>localizedNote(n,lang));
  const records=[
    {year:'2026',title:text('AI 漫剧生成系统','AI comics & storyboard generation'),role:text('项目技术侧负责人','Technical lead'),detail:text('统筹剧本理解、角色资产与分镜生成，建立质检与恢复机制，让长任务跑得完。','Connected script understanding, character assets and storyboard generation, with quality checks and recovery so long runs complete.'),figure:'≈18% → 9.53%',caption:text('固定评测集问题率 · 20 集长跑完整完成','issue rate on a fixed evaluation set · one 20-episode run completed')},
    {year:'2025–2026',title:text('短剧智能剪辑与人物身份一致性','Short-drama editing & character identity'),role:text('工作流负责人','Workstream lead'),detail:text('围绕跨集角色对齐与高光检索，让自动化剪辑始终咬住同一主角。','Cross-episode character alignment and highlight retrieval keep automated editing locked onto the main cast.'),figure:'1285s → 24s',caption:text('10 集测试样本，身份消歧耗时','identity disambiguation time on one 10-episode sample')},
    {year:'2025',title:text('电商文案风格化生成','E-commerce copy style adaptation'),role:text('核心算法工程','Core algorithm engineering'),detail:text('面向数字人直播，搭建端到端的风格化文案流水线：数据自动合成、监督微调与多维自动评估。','An end-to-end stylized copywriting pipeline for digital human livestreams: dataset synthesis, supervised fine-tuning and multi-metric evaluation.'),figure:'Qwen2.5-7B',caption:text('微调覆盖五种文案风格','fine-tuned across five copy styles')}
  ];

  const [active,setActive]=useState('taste');
  const [work,setWork]=useState(0);
  const [paused,setPaused]=useState(false);
  const [theme,setTheme]=useState('system');
  const [compact,setCompact]=useState(false);
  const tabRefs=useRef({});
  const themeController=useRef(null);
  useEffect(()=>{themeController.current=createThemeController(setTheme);return()=>themeController.current?.destroy();},[]);
  useEffect(()=>{document.title=zh?'工作室原型 · Kenny Wu':'Studio wall prototype · Kenny Wu';},[zh]);
  useEffect(()=>{
    const query=matchMedia('(max-width: 899px)');
    const sync=()=>setCompact(query.matches);
    sync();query.addEventListener('change',sync);
    return()=>query.removeEventListener('change',sync);
  },[]);
  const focusTab=id=>{setActive(id);requestAnimationFrame(()=>tabRefs.current[id]?.focus());};
  const onRailKeyDown=e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();focusTab(PRACTICES[(PRACTICES.indexOf(active)+1)%PRACTICES.length]);}
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();focusTab(PRACTICES[(PRACTICES.indexOf(active)+PRACTICES.length-1)%PRACTICES.length]);}
    else if(e.key==='Home'){e.preventDefault();focusTab(PRACTICES[0]);}
    else if(e.key==='End'){e.preventDefault();focusTab(PRACTICES[PRACTICES.length-1]);}
  };

  return <main id="main" className="workbench studio" data-motion={paused?'paused':'live'} aria-label={text('工作室原型','Studio wall prototype')} tabIndex="-1">
    <div className="wb-controls">
      <div className="wb-theme" role="group" aria-label={t.theme}>
        <button type="button" aria-pressed={theme==='system'} onClick={()=>themeController.current?.set('system')}>{text('跟随系统','System')}</button>
        <button type="button" aria-pressed={theme==='light'} onClick={()=>themeController.current?.set('light')}>{t.light}</button>
        <button type="button" aria-pressed={theme==='dark'} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button>
      </div>
      <a className="wb-language" href={zh?'/studio/':'/zh/studio/'} hrefLang={zh?'en':'zh-CN'} aria-label={t.language}>{zh?'EN':'中'}</a>
    </div>

    <header className="st-masthead">
      <div className="st-id">
        <p className="mono st-kicker">{text('工作室 · 一面墙','THE STUDIO · ONE WALL')}</p>
        <h1>Kenny Wu</h1>
        <p className="st-line">
          <span>{text('深圳 · AI 工程师','AI engineer in Shenzhen')}</span>
          <span className="st-epigraph">{text('「持续观察，也把想法做出来。」','“Keep noticing. Put ideas into form.”')}</span>
        </p>
        <p className="wb-links st-touch">
          <a href={`mailto:${site.email}`}>{t.contact} <span aria-hidden="true">↗</span></a>
          <a href={site.github_link} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        </p>
      </div>
      <figure className="wb-portrait st-badge">
        <span className="wb-tape" aria-hidden="true"></span>
        <Media src={A+'self-profo.jpg'} alt={text('Kenny Wu 的肖像','Portrait of Kenny Wu')} loading="eager" sizes="(max-width: 899px) 30vw, 150px"/>
      </figure>
    </header>

    <div className="st-wall">
      <nav className="st-rail" aria-label={text('墙上的四个方向','Four practices on the wall')}>
        <div className="st-tabs" role="tablist" aria-orientation={compact?'horizontal':'vertical'} aria-label={text('选择要看的一面','Choose the side of the wall to see')} onKeyDown={onRailKeyDown}>
          {PRACTICES.map(id=>{
            const lens=lensInfo[id];
            return <button key={id} ref={el=>{tabRefs.current[id]=el;}} type="button" role="tab" id={`st-tab-${id}`}
              aria-selected={active===id} aria-controls={`st-panel-${id}`} tabIndex={active===id?0:-1}
              className={`st-tab st-${id}${active===id?' is-active':''}`} onClick={()=>setActive(id)}>
              <span className="st-tab-num mono" aria-hidden="true">{lens.number}</span>
              <span className="st-tab-name">{zh?lens.zh:lens.name}</span>
              <span className="st-tab-pet" aria-hidden="true"><Media className="wb-alive" src={A+lens.character} alt="" sizes="(max-width: 899px) 13vw, 60px"/></span>
            </button>;
          })}
        </div>
        <p className="st-rail-hint">{text('方向键或点击，切换墙上的方向','Arrow keys or click — change the side of the wall')}</p>
      </nav>

      <div className={`st-easel st-${active}`}>
        <header className="st-easel-head" aria-live="polite">
          <p className="mono st-easel-kicker">{easelKicker(lang)[active]}</p>
          <p className="st-whisper">{prototypeText(lang,whispers[active][0],whispers[active][1])}</p>
        </header>

        {/* All four focus objects are server-rendered; JS unhides one at a time,
            and without JS the noscript style stacks them into a plain page. */}
        <div role="tabpanel" id="st-panel-online" aria-labelledby="st-tab-online" className="st-easel-body" hidden={active!=='online'}>
          <div className="st-route">
            {stops.map(stop=><a key={stop.id} className="st-stop" href={stop.url} target="_blank" rel="noopener noreferrer">
              <time className="mono" dateTime={stop.date.replace('.','-')}>{stop.date}</time>
              {stop.label&&<span className="mono st-stop-label">{stop.label}</span>}
              <span className="st-stop-title">{stop.title}</span>
              <span className="st-go" aria-hidden="true">↗</span>
            </a>)}
            <a className="st-more" href={protoRoutePath({view:'notes',arg:'online'},lang)}>{text('全部观察在档案里继续','The full observation archive continues here')} <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <div role="tabpanel" id="st-panel-taste" aria-labelledby="st-tab-taste" className="st-easel-body" hidden={active!=='taste'}>
          <div className="st-table">
            <figure className="st-art">
              <a href={artworks[work].page} aria-label={artworks[work].title}>
                <Media key={artworks[work].id} src={artworks[work].src} loading="eager" sizes="(max-width: 899px) 86vw, 520px" alt={artworks[work].title}/>
              </a>
            </figure>
            <div className="st-table-side">
              <p className="mono st-art-no" aria-hidden="true">{String(work+1).padStart(2,'0')} — {String(artworks.length).padStart(2,'0')}</p>
              <h2 className="st-art-title">{artworks[work].title}</h2>
              <p className="st-art-teaser">{artworks[work].teaser}</p>
              <p className="st-art-links">
                <a href={artworks[work].page}>{text('作品页','Artwork page')} <span aria-hidden="true">→</span></a>
                <a href={artworks[work].product.url} target="_blank" rel="noopener noreferrer">{artworks[work].product.name} <span aria-hidden="true">↗</span></a>
              </p>
              <div className="st-flip">
                <button type="button" className="st-flip-btn" onClick={()=>setWork((work+artworks.length-1)%artworks.length)} aria-label={text('上一件作品','Previous work')}>←</button>
                {artworks.map((a,i)=><button key={a.id} type="button" className={`st-thumb${i===work?' is-active':''}`} onClick={()=>setWork(i)} aria-pressed={i===work} aria-label={text(`第 ${i+1} 件：${a.title}`,`Work ${i+1}: ${a.title}`)}>
                  <Media src={a.src} alt="" sizes="(max-width: 899px) 14vw, 64px"/>
                </button>)}
                <button type="button" className="st-flip-btn" onClick={()=>setWork((work+1)%artworks.length)} aria-label={text('下一件作品','Next work')}>→</button>
              </div>
              <p className="st-table-products mono">
                {text('桌上的产品：','PRODUCTS ON THE TABLE:')}{' '}
                <a href={tasteProducts[0].url} target="_blank" rel="noopener noreferrer">{tasteProducts[0].name} <span aria-hidden="true">↗</span></a>
                {' · '}
                <a href={tasteProducts[1].url} target="_blank" rel="noopener noreferrer">{tasteProducts[1].name} <span aria-hidden="true">↗</span></a>
              </p>
            </div>
          </div>
        </div>

        <div role="tabpanel" id="st-panel-ai" aria-labelledby="st-tab-ai" className="st-easel-body" hidden={active!=='ai'}>
          <div className="st-bench">
            <div className="st-project">
              <h2 className="st-art-title">{scriptWeaver.name}</h2>
              <p className="st-art-teaser">{text(scriptWeaver.thesisZh,scriptWeaver.thesis)}</p>
              <p className="st-art-links">
                <a href={scriptWeaver.url} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
                <a href={protoRoutePath({view:'projects',arg:'ai',item:'script-weaver'},lang)}>{text('项目页','Project page')} <span aria-hidden="true">→</span></a>
              </p>
              <figure className="st-visual">
                <a href={artworks[3].page} aria-label={artworks[3].title}>
                  <Media src={A+'research-stages.png'} alt={text('研究项目的三个阶段：解释图，按关系组织信息','Three stages of a research project: an explanatory diagram organizing information by relation')} sizes="(max-width: 899px) 86vw, 420px"/>
                </a>
              </figure>
            </div>
            <div className="st-bench-side">
              <a className="st-note" href={protoRoutePath({view:'notes',arg:'ai',item:memoryNote.id},lang)}>
                <time className="mono" dateTime={memoryNote.date}>{memoryNote.date.replace('-','.')}</time>
                <strong>{memoryNote.title}</strong>
                <small>{text('最新的 AI 研究观察，点开读全文','The latest AI research note — read the full piece')}</small>
              </a>
            </div>
          </div>
        </div>

        <div role="tabpanel" id="st-panel-execution" aria-labelledby="st-tab-execution" className="st-easel-body" hidden={active!=='execution'}>
          <div className="st-ledger">
            {records.map(record=><a key={record.figure} className="st-record" href={protoRoutePath({view:'about',arg:'execution'},lang)}>
              <time className="mono">{record.year}</time>
              <div className="st-record-body">
                <h3>{record.title} <small className="st-record-role">{record.role}</small></h3>
                <p className="st-record-detail">{record.detail}</p>
                <p className="st-record-figure"><strong>{record.figure}</strong> <small>{record.caption}</small></p>
              </div>
            </a>)}
            <p className="st-snapshot mono">
              {text(`快照 ${githubSnapshot.date} · ${githubSnapshot.ownedRepos} 个公开仓库 · ${githubSnapshot.stars} STARS`,`SNAPSHOT ${githubSnapshot.date} · ${githubSnapshot.ownedRepos} PUBLIC REPOS · ${githubSnapshot.stars} STARS`)}
              <a href={protoRoutePath({view:'about',arg:'execution'},lang)}>{text('完整关于页 →','Full about page →')}</a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="st-strip">
      <section className="st-writing" aria-labelledby="st-writing-title">
        <h2 id="st-writing-title" className="mono st-strip-head">{text('最新文章 / 直达原文','LATEST WRITING / STRAIGHT TO THE ORIGINALS')}</h2>
        {strip.map(note=><a key={note.id} className="st-note-row" href={note.url} target="_blank" rel="noopener noreferrer">
          <time className="mono" dateTime={note.date}>{note.date.replace('-','.')}</time>
          <span className="st-note-title">{note.title}</span>
          <span className="mono st-note-src">{note.source}</span>
          <span className="st-go" aria-hidden="true">↗</span>
        </a>)}
        <a className="st-more" href={protoRoutePath({view:'notes',arg:'online'},lang)}>{text('观察档案 · 全部目录','Observation archive · the full index')} <span aria-hidden="true">→</span></a>
      </section>
      <aside className="st-colophon" aria-label={text('关于与联系','About and contact')}>
        <h2 className="mono st-strip-head">{text('关于 / 版权页','ABOUT / COLOPHON')}</h2>
        <p>{text(`GitHub 快照 ${githubSnapshot.date}：${githubSnapshot.ownedRepos} 个公开仓库，${githubSnapshot.stars} stars，${githubSnapshot.followers} followers。`,`GitHub snapshot ${githubSnapshot.date}: ${githubSnapshot.ownedRepos} public repositories, ${githubSnapshot.stars} stars, ${githubSnapshot.followers} followers.`)}</p>
        <p className="wb-links st-colophon-links">
          <a href={`mailto:${site.email}`}>{t.contact} <span aria-hidden="true">↗</span></a>
          <a href={site.zhihu_link} target="_blank" rel="noopener noreferrer">{text('知乎','Zhihu')} <span aria-hidden="true">↗</span></a>
          <a href={site.cv_link}>{text('简历','CV')} <span aria-hidden="true">↗</span></a>
          <a href={protoRoutePath({view:'about',arg:'home'},lang)}>{text('完整关于页','Full about page')} <span aria-hidden="true">→</span></a>
          <a href={protoRoutePath({view:'support',arg:''},lang)}>{text('支持这些工作','Support the work')} <span aria-hidden="true">→</span></a>
        </p>
      </aside>
    </div>

    <footer className="bench-bottom">
      <span className="wb-hint">{text('一面墙，四个方向 · 方向键或点击切换 · 靠近时动态自动停住','One wall, four sides · arrow keys or click to switch · motion pauses on approach')}</span>
      <button type="button" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?text('继续动态','Resume motion'):text('暂停动态','Pause motion')}</button>
      <a className="bench-compare" href={zh?'/zh/workbench/':'/workbench/'}>{text('对比工作台原型 →','Compare with the workbench prototype →')}</a>
      <a className="bench-compare" href={zh?'/zh/onepage/':'/onepage/'}>{text('对比单页原型 →','Compare with the one-page prototype →')}</a>
      <a className="bench-compare" href={routePath({view:'home'},lang)}>{text('对比现在的首页 →','Compare with the current home →')}</a>
    </footer>
  </main>;
}
