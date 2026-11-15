import React,{useEffect,useRef,useState} from 'react';
import {lensInfo,curated,notes,zh as spaceZh,en as spaceEn} from '../../data/space';
import {projects} from '../../data/projects';
import {tasteProducts} from '../../data/taste';
import {localizedNote,prototypeText,tasteEnglish} from '../../data/space-i18n';
import {routePath} from '../../lib/space-routes';
import {protoRoutePath} from '../../lib/proto-routes';
import {site} from '../../data/site';
import {Media} from './Media';
import {createThemeController} from '../../lib/theme';
import '../../styles/home-workbench.css';

const A='/assets/space/';

// Real artwork from the repo, each linking to its actual page inside the prototype.
function artworkLinks(lang){
  const zh=lang==='zh';
  const cardWorks=tasteProducts[0].works;
  const kamiWork=tasteProducts[1].works[0];
  return [
    {key:'poster',src:A+'thousand-brains.png',title:zh?cardWorks[0].title:tasteEnglish['thousand-brains.png'][0],href:protoRoutePath({view:'taste',arg:'card-skill',work:0},lang)},
    {key:'kami',src:A+'kami.png',title:zh?kamiWork.title:tasteEnglish['kami.png'][0],href:protoRoutePath({view:'taste',arg:'kami-reader',work:0},lang)},
    {key:'a2a',src:A+'a2a-cover.png',title:zh?cardWorks[1].title:tasteEnglish['a2a-cover.png'][0],href:protoRoutePath({view:'taste',arg:'card-skill',work:1},lang)},
    {key:'stages',src:A+'research-stages.png',title:zh?cardWorks[2].title:tasteEnglish['research-stages.png'][0],href:protoRoutePath({view:'taste',arg:'card-skill',work:2},lang)},
  ];
}

// Everything shown is real repo content: the four lens roles, the latest curated
// observations, shipped artworks, and the delivery numbers from the work record.
function buildStations(lang){
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const onlineLatest=[curated.find(n=>n.id==='goal'),curated.find(n=>n.id==='context-sep')].filter(Boolean)
    .map(n=>{const note=localizedNote(n,lang);return {date:note.date.replace('-','.'),title:note.title,href:protoRoutePath({view:'notes',arg:'online',item:note.id},lang)};});
  const memoryRecord=notes.find(n=>n.id==='2060032007506334292');
  const memory=localizedNote(memoryRecord,lang);
  const scriptWeaver=projects.find(p=>p.slug==='script-weaver');
  const thesis=text(scriptWeaver.thesisZh,scriptWeaver.thesis);
  return [
    {id:'online',lens:lensInfo.online,role:text('趋势观察','Online'),clues:onlineLatest},
    {id:'taste',lens:lensInfo.taste,role:text('产品与创作','Taste')},
    {id:'ai',lens:lensInfo.ai,role:text('项目与研究','AI'),
      memory:{date:memory.date.replace('-','.'),title:memory.title,href:protoRoutePath({view:'notes',arg:'ai',item:memory.id},lang)},
      project:{title:`Script-Weaver · ${thesis}`,href:protoRoutePath({view:'projects',arg:'ai',item:'script-weaver'},lang)}},
    {id:'execution',lens:lensInfo.execution,role:text('交付与实践','Execution'),
      metrics:[
        {from:'≈18%',to:'9.53%',label:text('AI 漫剧生成系统 · 问题率','AI comic drama system · issue rate'),href:protoRoutePath({view:'about',arg:'execution'},lang)},
        {from:'1285s',to:'24s',label:text('短剧智能剪辑 · 身份消歧耗时','Short-drama editing · identity disambiguation'),href:protoRoutePath({view:'about',arg:'execution'},lang)},
      ],
      project:{title:`Script-Weaver · ${thesis}`,href:protoRoutePath({view:'projects',arg:'execution',item:'script-weaver'},lang)}},
  ];
}

export default function HomeWorkbench({lang}){
  const zh=lang==='zh';
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const t=zh?spaceZh:spaceEn;
  const stations=buildStations(lang);
  const art=Object.fromEntries(artworkLinks(lang).map(a=>[a.key,a]));
  const [paused,setPaused]=useState(false);
  const [theme,setTheme]=useState('system');
  const themeController=useRef(null);
  useEffect(()=>{themeController.current=createThemeController(setTheme);return()=>themeController.current?.destroy();},[]);
  return <main id="main" className="workbench" data-motion={paused?'paused':'live'} aria-label={text('首页工作台原型','Home workbench prototype')} tabIndex="-1">
    <div className="wb-controls">
      <div className="wb-theme" role="group" aria-label={t.theme}>
        <button type="button" aria-pressed={theme==='system'} onClick={()=>themeController.current?.set('system')}>{text('跟随系统','System')}</button>
        <button type="button" aria-pressed={theme==='light'} onClick={()=>themeController.current?.set('light')}>{t.light}</button>
        <button type="button" aria-pressed={theme==='dark'} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button>
      </div>
      <a className="wb-language" href={zh?'/workbench/':'/zh/workbench/'} hrefLang={zh?'en':'zh-CN'} aria-label={t.language}>{zh?'EN':'中'}</a>
    </div>

    <header className="wb-hero">
      <div className="wb-who">
        <p className="wb-epigraph">{text('「持续观察，也把想法做出来。」','“Keep noticing. Put ideas into form.”')}</p>
        <h1>Kenny Wu</h1>
        <p className="wb-role">{text('深圳 · AI 工程师','AI engineer in Shenzhen')}</p>
        <p className="wb-intro">{text('经历从 NLP 与信息检索出发，延伸到多模态理解与内容生成；现在最关心的一件事，是把前沿模型能力扎扎实实做成稳定好用的产品。','My path runs from NLP and information retrieval to multimodal understanding and content generation. What I care about most is turning what frontier models can do into stable, useful products.')}</p>
        <p className="wb-links">
          <a href={`mailto:${site.email}`}>{t.contact} <span aria-hidden="true">↗</span></a>
          <a href={site.github_link} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
        </p>
      </div>
      <figure className="wb-portrait">
        <span className="wb-tape" aria-hidden="true"></span>
        <Media src={A+'self-profo.jpg'} alt={text('Kenny Wu 的肖像','Portrait of Kenny Wu')} loading="eager" sizes="(max-width: 899px) 56vw, 320px"/>
      </figure>
    </header>

    <section className="bench-field" aria-label={text('四个角色工作位','Four work stations')}>
      {stations.map(station=>{
        const l=station.lens;
        return <section className={`desk-card desk-${station.id}`} key={station.id} aria-labelledby={`desk-${station.id}-title`}>
          {/* The character itself is a sibling link (never nested) to the lens,
              with its own accessible name; focus ring and motion pause apply. */}
          <a className="desk-pet" href={protoRoutePath({view:'lens',arg:station.id},lang)} aria-label={text(`进入「${station.role}」镜头`,`Open the ${station.role} lens`)}>
            <Media className="wb-alive" src={A+l.character} alt="" sizes="(max-width: 699px) 24vw, 130px" draggable={false}/>
          </a>
          <h2 id={`desk-${station.id}-title`}>
            <a href={protoRoutePath({view:'lens',arg:station.id},lang)}>{station.role}<span className="desk-go" aria-hidden="true">→</span></a>
          </h2>
          {station.id==='online'&&<>
            <ul className="desk-lines">
              {station.clues.map(clue=><li key={clue.href}>
                <a href={clue.href}><time dateTime={clue.date.replace('.','-')}>{clue.date}</time><span>{clue.title}</span></a>
              </li>)}
            </ul>
            <a className="desk-more" href={protoRoutePath({view:'notes',arg:'online'},lang)}>{t.notes} <span aria-hidden="true">→</span></a>
          </>}
          {station.id==='taste'&&<>
            <div className="desk-collage">
              <a className="collage-poster" href={art.poster.href} aria-label={art.poster.title}><Media src={art.poster.src} alt="" sizes="(max-width: 699px) 44vw, 200px"/></a>
              <div className="collage-side">
                <a className="collage-screen" href={art.kami.href} aria-label={art.kami.title}><Media src={art.kami.src} alt="" sizes="(max-width: 699px) 44vw, 240px"/></a>
                <a className="collage-strip" href={art.a2a.href} aria-label={art.a2a.title}><Media src={art.a2a.src} alt="" sizes="(max-width: 699px) 46vw, 260px"/></a>
              </div>
            </div>
            <p className="desk-caption">{text('读书海报、阅读工作台与封面插图——作品本身，不只是清单。','A reading poster, a reading workbench and cover art — the works themselves, not just a list.')}</p>
          </>}
          {station.id==='ai'&&<>
            <a className="desk-note-paper" href={station.memory.href}>
              <time dateTime={station.memory.date.replace('.','-')}>{station.memory.date}</time>
              <strong>{station.memory.title}</strong>
            </a>
            <a className="desk-visual" href={art.stages.href} aria-label={art.stages.title}><Media src={art.stages.src} alt="" sizes="(max-width: 699px) 88vw, 300px"/></a>
            <a className="desk-row" href={station.project.href}>{station.project.title}<span className="desk-go" aria-hidden="true">→</span></a>
          </>}
          {station.id==='execution'&&<div className="desk-ledger">
            {station.metrics.map(metric=><a className="ledger-metric" key={metric.label} href={metric.href}>
              <strong>{metric.from} <i aria-hidden="true">→</i> {metric.to}</strong>
              <span>{metric.label}</span>
            </a>)}
            <a className="desk-row ledger-project" href={station.project.href}>{station.project.title}<span className="desk-go" aria-hidden="true">→</span></a>
          </div>}
        </section>;
      })}
    </section>

    <footer className="bench-bottom">
      <span className="wb-hint">{text('角色停在各自工位 · 靠近或聚焦时动态自动停住','Characters stay at their desks · motion pauses on hover or focus')}</span>
      <button type="button" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?text('继续动态','Resume motion'):text('暂停动态','Pause motion')}</button>
      <a className="bench-compare" href={routePath({view:'home'},lang)}>{text('对比现在的首页 →','Compare with the current home →')}</a>
    </footer>
  </main>;
}
