import React,{useEffect,useRef,useState} from 'react';
import {notes,zh as spaceZh,en as spaceEn} from '../../data/space';
import {localizedNote,prototypeText,tasteEnglish} from '../../data/space-i18n';
import {projects} from '../../data/projects';
import metrics from '../../data/collage-metrics.json';
import {tasteProducts} from '../../data/taste';
import {Media} from './Media';
import {createThemeController} from '../../lib/theme';
import CollageNav from './CollageNav';

const A='/assets/space/';

function ProjectMetric({repo,zh}){
  const metric=metrics[repo];
  if(!metric || !Number.isSafeInteger(metric.stars) || !metric.fetchedAt) return null;
  const date=metric.fetchedAt.slice(0,10);
  return <p className="cg-metric mono">
    <span>★ {metric.stars.toLocaleString('en-US')}</span>
    <span>{zh?'更新于':'Updated'} <time dateTime={metric.fetchedAt}>{date} UTC</time></span>
  </p>;
}

function KamiMetrics({zh}){
  const entries=[
    {metric:metrics['KKenny0/obsidian-kami'],field:'stars',href:'https://github.com/KKenny0/obsidian-kami',label:zh?'星标':'Stars'},
    {metric:metrics['kami-reader-theme-downloads'],field:'downloads',href:'https://community.obsidian.md/themes/kami-reader',label:zh?'主题下载':'Theme downloads'},
    {metric:metrics['kami-reader-companion-downloads'],field:'downloads',href:'https://obsidian.md/plugins?id=kami-reader-companion',label:zh?'插件下载':'Plugin downloads'}
  ].filter(({metric,field})=>metric && Number.isSafeInteger(metric[field]) && metric[field]>=0 && metric.fetchedAt);
  if(!entries.length) return null;
  const sameDate=entries.every(({metric})=>metric.fetchedAt.slice(0,10)===entries[0].metric.fetchedAt.slice(0,10));
  const date=metric=><span className="cg-kami-date">{zh?'更新于':'Updated'} <time dateTime={metric.fetchedAt}>{metric.fetchedAt.slice(0,10)} UTC</time></span>;
  return <div className="cg-kami-metrics" aria-label={zh?'项目数据快照':'Project metrics snapshot'}>
    <div className="cg-kami-metric-list">{entries.map(({metric,field,href,label})=><div className="cg-kami-metric" key={href}>
      <a href={href} target="_blank" rel="noopener noreferrer"><strong>{metric[field].toLocaleString('en-US')}</strong><span>{label} ↗</span></a>
      {!sameDate&&date(metric)}
    </div>)}</div>
    {sameDate&&date(entries[0].metric)}
  </div>;
}

/* One line per hand-drawn sticker; each sticker points at one real object. */
const stickers={
  taste:{character:'taste.webp',target:'kotaemon',
    line:['「看看开源协作留下的几笔贡献。」','“Take a look at the open-source contributions.”']},
  ai:{character:'ai.webp',target:'script',
    line:['「从故事构想到剧本和分镜，看看 Script-Weaver。」','“From story ideas to scripts and storyboards: meet Script-Weaver.”']}
};

/* The two comparison sources are real repository facts, kept verbatim. */
const videowipe=projects.find(p=>p.slug==='videowipe');
export default function HomeCollage({lang,mode='prototype'}){
  const zh=lang==='zh';
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const t=zh?spaceZh:spaceEn;

  const goalNote=localizedNote(notes.find(n=>n.id==='goal'),lang);
  const compactNote=localizedNote(notes.find(n=>n.id==='2031687123431051328'),lang);
  const kamiWorks=tasteProducts[1].works;
  const kamiShot={
    src:A+'kami.png',
    title:zh?kamiWorks[0].title:tasteEnglish['kami.png'][0],
    teaser:zh?kamiWorks[0].description:tasteEnglish['kami.png'][1],
    product:tasteProducts[1]
  };

  const [focus,setFocus]=useState(null);
  const [spoken,setSpoken]=useState(null);
  const [pointed,setPointed]=useState(null);
  const [pos,setPos]=useState(55);
  const [positions,setPositions]=useState({});
  const wallRef=useRef(null);
  const moving=useRef(null);
  const [theme,setTheme]=useState('system');
  const themeController=useRef(null);
  const panelRef=useRef(null);
  const closeRef=useRef(null);
  const lastTrigger=useRef(null);
  const pointTimer=useRef(null);

  useEffect(()=>{themeController.current=createThemeController(setTheme);return()=>themeController.current?.destroy();},[]);
  useEffect(()=>{if(mode==='prototype')document.title=zh?'拼贴墙 · Kenny Wu':'Collage wall · Kenny Wu';},[zh,mode]);
  useEffect(()=>{
    let width=window.innerWidth;
    const reset=()=>{if(window.innerWidth!==width){width=window.innerWidth;setPositions({});}};
    window.addEventListener('resize',reset);
    return()=>window.removeEventListener('resize',reset);
  },[]);

  useEffect(()=>{
    const dialog=panelRef.current;
    if(!focus||!dialog)return;
    dialog.showModal();
    document.body.style.overflow='hidden';
    closeRef.current?.focus();
    return()=>{dialog.close();document.body.style.overflow='';lastTrigger.current?.focus();};
  },[focus]);

  const openFocus=(id,event)=>{lastTrigger.current=event?.currentTarget||null;setFocus(id);};
  const speak=id=>{
    setSpoken(current=>current===id?null:id);
    const target=stickers[id].target;
    clearTimeout(pointTimer.current);
    setPointed(target);
    pointTimer.current=setTimeout(()=>setPointed(null),2600);
  };
  useEffect(()=>()=>clearTimeout(pointTimer.current),[]);

  /* Pointer dragging on the comparison image drives the same value as the range input. */
  const dragPos=useRef(false);
  const posFromEvent=(element,e)=>{
    const rect=element.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width;
    setPos(Math.round(Math.min(100,Math.max(0,x*100))));
  };

  // Handles own pointer input, leaving card links, the comparison and scrolling independent.
  const moveObject=(id,dx,dy)=>{
    const wall=wallRef.current, object=wall?.querySelector(`[data-object="${id}"]`);
    if(!object)return;
    const bounds=wall.getBoundingClientRect(), rect=object.getBoundingClientRect();
    const x=Math.max(bounds.left-rect.left,Math.min(dx,bounds.right-rect.right));
    const y=Math.max(bounds.top-rect.top,Math.min(dy,bounds.bottom-rect.bottom));
    const portrait=wall.querySelector('[data-object="portrait"]');
    const other=id==='portrait'?null:portrait?.getBoundingClientRect();
    const next={left:rect.left+x,right:rect.right+x,top:rect.top+y,bottom:rect.bottom+y};
    if(other&&next.left<other.right&&next.right>other.left&&next.top<other.bottom&&next.bottom>other.top)return;
    if(id==='portrait'&&[...wall.querySelectorAll('[data-object]:not([data-object="portrait"])')].some(el=>{const r=el.getBoundingClientRect();return next.left<r.right&&next.right>r.left&&next.top<r.bottom&&next.bottom>r.top;}))return;
    setPositions(previous=>({ ...previous,[id]:{x:(previous[id]?.x||0)+x,y:(previous[id]?.y||0)+y} }));
  };
  const handle=(id,label,enLabel)=><button type="button" className="cg-drag" aria-label={text(`拖动图钉移动${label}，也可使用方向键`, `Drag pin to move ${enLabel}, or use arrow keys`)}
    onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);moving.current={id,x:e.clientX,y:e.clientY};}}
    onPointerMove={e=>{if(moving.current?.id!==id)return;const dx=e.clientX-moving.current.x,dy=e.clientY-moving.current.y;moving.current.x=e.clientX;moving.current.y=e.clientY;moveObject(id,dx,dy);}}
    onPointerUp={()=>{moving.current=null;}} onPointerCancel={()=>{moving.current=null;}} onLostPointerCapture={()=>{moving.current=null;}}
    onKeyDown={e=>{const delta=e.shiftKey?30:10;const keys={ArrowLeft:[-delta,0],ArrowRight:[delta,0],ArrowUp:[0,-delta],ArrowDown:[0,delta]};if(keys[e.key]){e.preventDefault();moveObject(id,...keys[e.key]);}}}><svg className="cg-drag-pin" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 3h6l-.7 5 3.2 3v2h-5v7l-.5 1-.5-1v-7h-5v-2l3.2-3L9 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg></button>;
  const objectProps=id=>({'data-object':id,style:{translate:`${positions[id]?.x||0}px ${positions[id]?.y||0}px`}});

  const closeBtn=ref=><button type="button" ref={ref} className="cg-close" onClick={()=>setFocus(null)}>{text('收起，回到墙上','Close, back to the wall')}<span aria-hidden="true">×</span></button>;

  return <main id="main" className="collage" aria-label={text('拼贴墙','Collage wall')} tabIndex="-1">
    <div className="wb-controls">
      <div className="wb-theme" role="group" aria-label={t.theme}>
        <button type="button" aria-pressed={theme==='system'} onClick={()=>themeController.current?.set('system')}>{text('跟随系统','System')}</button>
        <button type="button" aria-pressed={theme==='light'} onClick={()=>themeController.current?.set('light')}>{t.light}</button>
        <button type="button" aria-pressed={theme==='dark'} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button>
      </div>
      <a className="wb-language" href={mode==='formal'?(zh?'/':'/zh/'):(zh?'/collage/':'/zh/collage/')} hrefLang={zh?'en':'zh-CN'} aria-label={t.language}>{zh?'EN':'中'}</a>
    </div>

    <header className="cg-masthead">
      <p className="mono cg-kicker">{text('拼贴墙 · 一块软木板','THE COLLAGE WALL · ONE PINBOARD')}</p>
      <h1>Kenny Wu</h1>
      <p className="cg-line">{text('深圳 · AI 工程师。把观察、作品和工作痕迹钉在同一块板上。','AI engineer in Shenzhen. Observations, works and work traces, pinned to one board.')}</p>
      <CollageNav lang={lang} mode={mode}/>
    </header>


    <div className="cg-wall-tools"><p>{text('拖动图钉，重新布置墙面。','Drag the pins to rearrange the wall.')}</p><button type="button" onClick={()=>setPositions({})}>{text('重置位置','Reset positions')}</button></div>
    <div className="cg-wall" ref={wallRef}>
      {/* Portrait polaroid */}
      <figure className="cg-pin cg-portrait" {...objectProps('portrait')}>
        {handle('portrait','头像','portrait')}
        <span className="cg-tape" aria-hidden="true"></span>
        <Media src={A+'self-profo.jpg'} alt={text('Kenny Wu 的肖像','Portrait of Kenny Wu')} loading="eager" sizes="(max-width: 599px) 52vw, 290px"/>
        <figcaption>
          <strong>Kenny Wu</strong>
          <span>{text('AI 工程师 · 深圳','AI engineer · Shenzhen')}</span>
          <span className="cg-epigraph">{text('「持续观察，也把想法做出来。」','“Keep noticing. Put ideas into form.”')}</span>
        </figcaption>
      </figure>

      {/* External open-source contribution card */}
      <figure className={`cg-pin cg-art cg-art-poster${pointed==='kotaemon'?' is-pointed':''}`} {...objectProps('poster')}>
        {handle('poster','Kotaemon','Kotaemon')}
        <div className="cg-pin-face cg-project-card">
          <span className="mono cg-pin-tag">{text('外部开源项目 · 贡献者','EXTERNAL OPEN SOURCE · CONTRIBUTOR')}</span>
          <h2 className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer" aria-label={text('访问 Cinnamon 的 Kotaemon 上游仓库','Visit Cinnamon’s upstream Kotaemon repository')}>Kotaemon</a></h2>
          <p className="cg-pin-teaser">{text('参与 Cinnamon 的开源项目，以下是已合并的贡献示例：','Contributions to Cinnamon’s open-source project, including these merged examples:')}</p>
          <ProjectMetric repo="Cinnamon/kotaemon" zh={zh}/>
          <ul className="cg-contributions">
            <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">#287 · {text('TEI 嵌入服务与重排序模型配置','TEI embeddings and configurable reranking')}</a></li>
            <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">#341 · {text('关联对话的聊天建议','Conversation-aware chat suggestions')}</a></li>
            <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">#461 · {text('引用结果可视化','Citation result visualization')}</a></li>
          </ul>
        </div>
      </figure>

      {/* Observation index card — latest stop */}
      <figure className="cg-pin cg-note cg-note-goal" {...objectProps('goal')}>
        {handle('goal','观察卡片','observation card')}
        <a className="cg-pin-face" href={goalNote.url} target="_blank" rel="noopener noreferrer">
          <span className="mono cg-pin-tag">{goalNote.date.replace('-','.')} · {goalNote.source}</span>
          <strong className="cg-pin-title">{goalNote.title}</strong>
          <span className="cg-pin-teaser">{goalNote.teaser}</span>
          <span className="cg-pin-open">{text('阅读原文 ↗','Read the original ↗')}</span>
        </a>
      </figure>

      {/* Hand-drawn sticker: taste */}
      <div className={`cg-sticker cg-sticker-taste${spoken==='taste'?' is-spoken':''}`} {...objectProps('taste')}>
        {handle('taste','Taste角色','Taste character')}
        <button type="button" className="cg-sticker-face" onClick={()=>speak('taste')} aria-expanded={spoken==='taste'}>
          <Media src={A+stickers.taste.character} alt={text('手绘角色：产品与创作','Hand-drawn character: craft')} sizes="(max-width: 599px) 17vw, 84px"/>
        </button>
        {spoken==='taste'&&<p className="cg-bubble" role="status">{text(stickers.taste.line[0],stickers.taste.line[1])}</p>}
      </div>

      {/* Kami print */}
      <figure className="cg-pin cg-art cg-art-kami" {...objectProps('kami')}>
        {handle('kami','Kami作品','Kami artwork')}
        <div className="cg-kami-paper">
          <button type="button" className="cg-pin-face" onClick={e=>openFocus('art-kami',e)} aria-haspopup="dialog">
            <span className="mono cg-pin-tag">{text('作品 · Kami Reader','WORK · KAMI READER')}</span>
            <Media src={kamiShot.src} alt={kamiShot.title} sizes="(max-width: 599px) 92vw, (max-width: 899px) 44vw, 300px"/>
          </button>
          <strong className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/KKenny0/obsidian-kami" target="_blank" rel="noopener noreferrer" aria-label={text('访问 Kami 的 GitHub 仓库','Visit the Kami GitHub repository')}>{kamiShot.title}</a></strong>
          <span className="mono cg-pin-open">{text('在当前空间展开','EXPAND HERE')}<span aria-hidden="true"> ⤢</span></span>
          <KamiMetrics zh={zh}/>
        </div>
      </figure>

      <figure className="cg-pin cg-compare" {...objectProps('compare')}>
        {handle('compare','对比作品','comparison')}
        <div className="cg-compare-content">
          <h2 className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/KKenny0/videowipe" target="_blank" rel="noopener noreferrer" aria-label={text('访问 VideoWipe 的 GitHub 仓库','Visit the VideoWipe GitHub repository')}>VideoWipe</a></h2>
          <ProjectMetric repo="KKenny0/videowipe" zh={zh}/>
          <p className="cg-pin-teaser">{text(videowipe.thesisZh,videowipe.thesis)}</p>
          <div className="cg-slider-stage"
            onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);dragPos.current=true;posFromEvent(e.currentTarget,e);e.currentTarget.parentElement.querySelector('input').focus();}}
            onPointerMove={e=>{if(dragPos.current)posFromEvent(e.currentTarget,e);}}
            onPointerUp={e=>{dragPos.current=false;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
            onPointerCancel={()=>{dragPos.current=false;}}
            onLostPointerCapture={()=>{dragPos.current=false;}}>
            <Media src={A+'videowipe-before.jpg'} alt={text('处理前：画面带烧录字幕','Before: burned-in subtitles')} sizes="(max-width: 599px) 90vw, 500px"/>
            <Media className="cg-slider-after" style={{clipPath:`inset(0 0 0 ${pos}%)`}} src={A+'videowipe-after.jpg'} alt={text('处理后：字幕被清除','After: subtitles removed')} sizes="(max-width: 599px) 90vw, 500px"/>
            <span className="cg-slider-divider" style={{left:`${pos}%`}} aria-hidden="true"><span className="cg-slider-handle"></span></span>
            <span className="cg-slider-label cg-slider-label-before mono" aria-hidden="true">{text('处理前','BEFORE')}</span>
            <span className="cg-slider-label cg-slider-label-after mono" aria-hidden="true">{text('处理后','AFTER')}</span>
          </div>
          <label className="cg-range-label" htmlFor="cg-comparison">{text('拖动或使用方向键比较','Drag or use arrow keys to compare')}</label>
          <input id="cg-comparison" className="cg-slider-range" type="range" min="0" max="100" value={pos} onChange={e=>setPos(Number(e.target.value))} aria-label={text('处理前画面比例','Amount of before image')} aria-valuetext={text(`处理前 ${pos}%，处理后 ${100-pos}%`,`Before ${pos}%, after ${100-pos}%`)}/>
        </div>
      </figure>

      {/* Hand-drawn sticker: ai */}
      <div className={`cg-sticker cg-sticker-ai${spoken==='ai'?' is-spoken':''}`} {...objectProps('ai')}>
        {handle('ai','AI角色','AI character')}
        <button type="button" className="cg-sticker-face" onClick={()=>speak('ai')} aria-expanded={spoken==='ai'}>
          <Media src={A+stickers.ai.character} alt={text('手绘角色：项目与研究','Hand-drawn character: systems')} sizes="(max-width: 599px) 17vw, 84px"/>
        </button>
        {spoken==='ai'&&<p className="cg-bubble" role="status">{text(stickers.ai.line[0],stickers.ai.line[1])}</p>}
      </div>

      {/* Script-Weaver repository card */}
      <figure className={`cg-pin cg-replay${pointed==='script'?' is-pointed':''}`} {...objectProps('replay')}>
        {handle('replay','Script-Weaver','Script-Weaver')}
        <div className="cg-pin-face cg-project-card">
          <span className="mono cg-pin-tag">{text('项目 · 剧本与分镜','PROJECT · SCREENPLAY & STORYBOARD')}</span>
          <h2 className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/KKenny0/script-weaver" target="_blank" rel="noopener noreferrer" aria-label={text('访问 Script-Weaver 的 GitHub 仓库','Visit the Script-Weaver GitHub repository')}>Script-Weaver</a></h2>
          <ProjectMetric repo="KKenny0/script-weaver" zh={zh}/>
          <p className="cg-pin-teaser">{text('从故事构想出发，组织大纲、角色、场景、剧本与分镜的创作工具。','A creative tool for developing story ideas into outlines, characters, scenes, screenplays and storyboards.')}</p>
          <p className="cg-pin-teaser">{text('提供 Web 工作台与命令行界面。','Includes a web workbench and command-line interface.')}</p>
        </div>
      </figure>

      {/* Second observation card — deliberately sparse placement */}
      <figure className="cg-pin cg-note cg-note-compact" {...objectProps('compact')}>
        {handle('compact','文章卡片','article card')}
        <a className="cg-pin-face" href={compactNote.url} target="_blank" rel="noopener noreferrer">
          <span className="mono cg-pin-tag">{compactNote.date.replace('-','.')} · {compactNote.source}</span>
          <strong className="cg-pin-title">{compactNote.title}</strong>
          <span className="cg-pin-teaser">{compactNote.teaser}</span>
          <span className="cg-pin-open">{text('阅读原文 ↗','Read the original ↗')}</span>
        </a>
      </figure>
    </div>

    {focus&&<dialog className="cg-focus-panel" ref={panelRef} aria-labelledby="cg-focus-title" onCancel={e=>{e.preventDefault();setFocus(null);}} onClick={e=>{if(e.target===e.currentTarget)setFocus(null);}}>
        {closeBtn(closeRef)}

        {focus==='art-kami'&&<div className="cg-focus-body">
          <p className="mono cg-focus-kicker">{text('作品 · Kami Reader','WORK · KAMI READER')}</p>
          <h2 id="cg-focus-title">{kamiShot.title}</h2>
          <figure className="cg-focus-art"><Media src={kamiShot.src} alt={kamiShot.title} loading="eager" sizes="(max-width: 899px) 86vw, 480px"/></figure>
          <p className="cg-focus-text">{kamiShot.teaser}</p>
          <p className="cg-focus-links"><a href="https://github.com/KKenny0/obsidian-kami" target="_blank" rel="noopener noreferrer">{kamiShot.product.name} GitHub <span aria-hidden="true">↗</span></a></p>
        </div>}

    </dialog>}

  </main>;
}
