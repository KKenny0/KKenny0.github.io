import React,{useEffect,useRef,useState} from 'react';
import {notes,zh as spaceZh,en as spaceEn} from '../../data/space';
import {featuredProjects,githubSnapshot} from '../../data/projects';
import {localizedNote,prototypeText} from '../../data/space-i18n';
import {routePath} from '../../lib/space-routes';
import {protoRoutePath} from '../../lib/proto-routes';
import {site} from '../../data/site';
import {Media} from './Media';
import {AboutMore} from './Scenes';
import {createThemeController} from '../../lib/theme';
import '../../styles/home-onepage.css';

const A='/assets/space/';

/* Legacy About-section internal links stay inside the prototype, same mapping
   the ProtoApp uses, so "了解更多" never drops visitors into the official site. */
function legacyProtoLink(href,locale){
  const official=`${locale==='zh'?'/zh':''}/projects/`;
  if(href===`${official}#tracework`)return `${locale==='zh'?'/zh':''}/prototype/projects/tracework/`;
  if(href===`${official}#card-skill`)return `${locale==='zh'?'/zh':''}/prototype/work/card-skill/`;
  if(href==='/notes/?topic=memory')return `${locale==='zh'?'/zh':''}/prototype/notes/?topic=memory`;
  return href;
}

/* Real imagery only: actual screenshots, actual artwork, or an explicitly
   labelled schematic. Mirrors the media rules used across the prototypes. */
function WorkMedia({project,lang}){
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  if(project.slug==='videowipe')return <figure className="op-media op-media-pair">
    <span><Media src={A+'videowipe-before.jpg'} alt={text('VideoWipe 处理前：字幕烧录在画面上','VideoWipe before: subtitles burned into the frame')}/><small className="mono">{text('处理前','BEFORE')}</small></span>
    <span><Media src={A+'videowipe-after.jpg'} alt={text('VideoWipe 处理后：字幕被清除','VideoWipe after: subtitles removed')}/><small className="mono">{text('处理后','AFTER')}</small></span>
  </figure>;
  if(project.slug==='obsidian-kami')return <figure className="op-media op-media-screen"><Media src={A+'kami.png'} alt={text('Kami Reader 真实界面','Actual Kami Reader interface')}/></figure>;
  if(project.slug==='tracework')return <figure className="op-media op-media-art"><img src="/assets/portfolio/focus/tracework.webp" width="1240" height="760" loading="lazy" alt={text('Tracework 从工作记录到进展报告的项目介绍图','Tracework project artwork: work records becoming progress reports')}/></figure>;
  if(project.slug==='script-weaver')return <figure className="op-media op-media-schematic"><div className="project-visual visual-script"><span className="script-top mono">AGENT / PRODUCTION SYSTEM</span><div className="script-diagram"><span>STORY<br/>IDEA</span><i>→</i><span>SCREEN<br/>PLAY</span><i>→</i><span>STORY<br/>BOARD</span></div><strong>Script-Weaver</strong><span className="visual-stamp mono">{text('流程示意 · 非产品截图','PROCESS SCHEMATIC · NOT A PRODUCT SCREENSHOT')}</span></div></figure>;
  return null;
}

/* One browsable page: portrait intro, selected works, recent writing, work
   record, about & contact — with the four characters guiding their sections
   instead of gating the visit. Deep dives continue in the existing prototype
   pages; everything else stays on this page or goes straight to the source. */
export default function HomeOnePage({lang}){
  const zh=lang==='zh';
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const t=zh?spaceZh:spaceEn;
  const [paused,setPaused]=useState(false);
  const [theme,setTheme]=useState('system');
  const themeController=useRef(null);
  useEffect(()=>{themeController.current=createThemeController(setTheme);return()=>themeController.current?.destroy();},[]);
  useEffect(()=>{document.title=zh?'单页首页原型 · Kenny Wu':'One-page home prototype · Kenny Wu';},[zh]);
  // "#w-slug" deep links land on the expanded project card.
  useEffect(()=>{
    const match=location.hash.match(/^#(w-[\w-]+)$/);
    const target=match&&document.getElementById(match[1]);
    if(target instanceof HTMLDetailsElement){target.open=true;target.scrollIntoView();}
  },[]);
  const recent=notes.slice(0,5).map(n=>localizedNote(n,lang));
  const works=featuredProjects;

  return <main id="main" className="workbench onepage" data-motion={paused?'paused':'live'} aria-label={text('单页首页原型','One-page home prototype')} tabIndex="-1">
    <header className="op-top">
      <a className="op-brand" href="#top" aria-label={text('回到页面顶部','Back to the top of the page')}>Kenny Wu</a>
      <nav className="op-nav" aria-label={text('页面分区导航','Page section navigation')}>
        <a href="#works">{text('作品','Works')}</a>
        <a href="#writing">{text('文章','Writing')}</a>
        <a href="#record">{text('经历','Record')}</a>
        <a href="#about">{text('关于','About')}</a>
      </nav>
      <div className="op-tools">
        <div className="wb-theme" role="group" aria-label={t.theme}>
          <button type="button" aria-pressed={theme==='system'} onClick={()=>themeController.current?.set('system')}>{text('系统','Auto')}</button>
          <button type="button" aria-pressed={theme==='light'} onClick={()=>themeController.current?.set('light')}>{t.light}</button>
          <button type="button" aria-pressed={theme==='dark'} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button>
        </div>
        <a className="wb-language" href={zh?'/onepage/':'/zh/onepage/'} hrefLang={zh?'en':'zh-CN'} aria-label={t.language}>{zh?'EN':'中'}</a>
      </div>
    </header>

    <section className="wb-hero" id="top">
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
    </section>

    <section id="works" className="op-section desk-taste" aria-labelledby="op-works-title">
      <header className="op-section-head">
        <div>
          <p className="mono op-kicker">{text('作品 / 精选项目','WORKS / SELECTED PROJECTS')}</p>
          <h2 id="op-works-title">{text('精选作品','Selected works')}</h2>
          <p className="op-lede">{text('四个项目就地展开：真实简介与真实链接，不用离开这一页。','Four projects expand in place — real descriptions, real links, without leaving this page.')}</p>
        </div>
        <span className="op-pet" aria-hidden="true"><Media className="wb-alive" src={A+'taste.webp'} alt="" sizes="(max-width: 699px) 20vw, 110px"/></span>
      </header>
      <div className="op-works">
        {works.map((p,i)=><details className="op-work" id={`w-${p.slug}`} key={p.slug}>
          <summary>
            <span className="mono op-no">{String(i+1).padStart(2,'0')}</span>
            <span className="op-work-name"><strong>{p.name}</strong><small>{text(p.thesisZh,p.thesis)}</small></span>
            <span className="mono op-tag">{p.tagline}</span>
            <span className="op-sign" aria-hidden="true"></span>
          </summary>
          <div className="op-work-body">
            <div>
              <p>{text(p.descriptionZh,p.description)}</p>
              <div className="op-work-links">
                <a href={p.url} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
                {p.homepage&&<a href={p.homepage} target="_blank" rel="noopener noreferrer">{text('访问产品','Visit product')} <span aria-hidden="true">↗</span></a>}
                {p.slug==='tracework'&&<a href={protoRoutePath({view:'story',arg:'tracework'},lang)}>{text('项目详解（长文）','Project story')} <span aria-hidden="true">→</span></a>}
                {p.slug==='obsidian-kami'&&<a href={protoRoutePath({view:'taste',arg:'kami-reader'},lang)}>{text('作品页','Artwork page')} <span aria-hidden="true">→</span></a>}
              </div>
              <p className="op-work-meta mono">{p.stars} STARS · {p.forks} FORKS · {text('更新','UPDATED')} {p.pushedAt.slice(0,10)} · {text('快照','SNAPSHOT')} {githubSnapshot.date}</p>
            </div>
            <WorkMedia project={p} lang={lang}/>
          </div>
        </details>)}
      </div>
      <a className="op-continue" href={protoRoutePath({view:'projects',arg:'home'},lang)}>
        <span className="mono">{text('查看全部','VIEW ALL')}</span>
        <strong>{text('进入项目目录，浏览全部项目','Open the project index — every project')} <span aria-hidden="true">→</span></strong>
      </a>
    </section>

    <section id="writing" className="op-section desk-online" aria-labelledby="op-writing-title">
      <header className="op-section-head">
        <div>
          <p className="mono op-kicker">{text('文章 / 最近观察','WRITING / RECENT OBSERVATIONS')}</p>
          <h2 id="op-writing-title">{text('最近文章','Recent writing')}</h2>
          <p className="op-lede">{text('点开就是原文；全部观察在原型档案里继续。','Each row opens the original; the full archive continues in the prototype.')} {text(`共 ${notes.length} 篇。`,`${notes.length} in total.`)}</p>
        </div>
        <span className="op-pet" aria-hidden="true"><Media className="wb-alive" src={A+'online.webp'} alt="" sizes="(max-width: 699px) 20vw, 110px"/></span>
      </header>
      <div className="op-notes">
        {recent.map(note=><a className="op-note" key={note.id} href={note.url} target="_blank" rel="noopener noreferrer">
          <time className="mono" dateTime={note.date}>{note.date.replace('-','.')}</time>
          <span className="op-note-title"><strong>{note.title}</strong><small>{note.teaser}</small></span>
          <span className="mono op-note-src">{note.source}</span>
          <span className="op-go" aria-hidden="true">↗</span>
        </a>)}
      </div>
      <a className="op-continue" href={protoRoutePath({view:'notes',arg:'online'},lang)}>
        <span className="mono">{text('查看全部','VIEW ALL')}</span>
        <strong>{text('打开观察档案，按主题翻完整目录','Open the observation archive — browse every note by topic')} <span aria-hidden="true">→</span></strong>
      </a>
    </section>

    <section id="record" className="op-section desk-execution" aria-labelledby="op-record-title">
      <header className="op-section-head">
        <div>
          <p className="mono op-kicker">{text('经历 / 交付与实践','RECORD / DELIVERY IN PRACTICE')}</p>
          <h2 id="op-record-title">{text('工作经历','Work record')}</h2>
          <p className="op-lede">{text('关键交付与可验证的结果；更长的研究与日常记录可在下方展开。','Key deliveries with verifiable outcomes; the longer record of research and everyday work expands below.')}</p>
        </div>
        <span className="op-pet" aria-hidden="true"><Media className="wb-alive" src={A+'execution.webp'} alt="" sizes="(max-width: 699px) 20vw, 110px"/></span>
      </header>
      <div className="op-record">
        <article>
          <time>2026</time>
          <div>
            <h3>{text('AI 漫剧生成系统','AI comics & storyboard generation')}</h3>
            <p className="op-role">{text('项目技术侧负责人','Technical lead')}</p>
            <p>{text('统筹剧本理解、角色资产与分镜生成，建立质检与恢复机制，让长任务跑得完。','Connected script understanding, character assets and storyboard generation, with quality checks and recovery so long runs complete.')}</p>
            <strong>≈18% → 9.53% <small>{text('固定评测集问题率 · 20 集长跑完整完成','issue rate on a fixed evaluation set · one 20-episode run completed')}</small></strong>
          </div>
        </article>
        <article>
          <time>2025–2026</time>
          <div>
            <h3>{text('短剧智能剪辑与人物身份一致性','Short-drama editing & character identity')}</h3>
            <p className="op-role">{text('工作流负责人','Workstream lead')}</p>
            <p>{text('围绕跨集角色对齐与高光检索，让自动化剪辑始终咬住同一主角。','Cross-episode character alignment and highlight retrieval keep automated editing locked onto the main cast.')}</p>
            <strong>1285s → 24s <small>{text('10 集测试样本，身份消歧耗时','identity disambiguation time on one 10-episode sample')}</small></strong>
          </div>
        </article>
        <article>
          <time>2025</time>
          <div>
            <h3>{text('电商文案风格化生成','E-commerce copy style adaptation')}</h3>
            <p className="op-role">{text('核心算法工程','Core algorithm engineering')}</p>
            <p>{text('面向数字人直播，搭建端到端的风格化文案流水线：数据自动合成、监督微调与多维自动评估。','An end-to-end stylized copywriting pipeline for digital human livestreams: dataset synthesis, supervised fine-tuning and multi-metric evaluation.')}</p>
            <strong>Qwen2.5-7B <small>{text('微调覆盖五种文案风格','fine-tuned across five copy styles')}</small></strong>
          </div>
        </article>
        <AboutMore lang={lang} rewriteHref={href=>legacyProtoLink(href,lang)}/>
      </div>
      <a className="op-continue" href={protoRoutePath({view:'lens',arg:'execution'},lang)}>
        <span className="mono">{text('了解更多','LEARN MORE')}</span>
        <strong>{text('在交付镜头里，看这套工作方式的一例','See one delivery of this working style in the execution lens')} <span aria-hidden="true">→</span></strong>
      </a>
    </section>

    <section id="about" className="op-section desk-ai" aria-labelledby="op-about-title">
      <header className="op-section-head">
        <div>
          <p className="mono op-kicker">{text('关于 / 联系','ABOUT / CONTACT')}</p>
          <h2 id="op-about-title">{text('关于与联系','About & contact')}</h2>
          <p className="op-lede">{text('合作、研究原型、Agent 基础设施，或者任何奇怪但有用的想法，都欢迎来信。','Collaborations, research prototypes, agent infrastructure — or any weird useful idea — are all welcome.')}</p>
        </div>
        <span className="op-pet" aria-hidden="true"><Media className="wb-alive" src={A+'ai.webp'} alt="" sizes="(max-width: 699px) 20vw, 110px"/></span>
      </header>
      <div className="op-about">
        <p>{text(`GitHub 快照 ${githubSnapshot.date}：${githubSnapshot.ownedRepos} 个公开仓库，${githubSnapshot.stars} stars，${githubSnapshot.followers} followers。`,`GitHub snapshot ${githubSnapshot.date}: ${githubSnapshot.ownedRepos} public repositories, ${githubSnapshot.stars} stars, ${githubSnapshot.followers} followers.`)}</p>
        <p className="wb-links">
          <a href={`mailto:${site.email}`}>{t.contact} <span aria-hidden="true">↗</span></a>
          <a href={site.github_link} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          <a href={site.zhihu_link} target="_blank" rel="noopener noreferrer">{text('知乎','Zhihu')} <span aria-hidden="true">↗</span></a>
          <a href={site.cv_link}>{text('简历','CV')} <span aria-hidden="true">↗</span></a>
          <a href={protoRoutePath({view:'about',arg:'home'},lang)}>{text('完整关于页','Full about page')} <span aria-hidden="true">→</span></a>
          <a href={protoRoutePath({view:'support',arg:''},lang)}>{text('支持这些工作','Support the work')} <span aria-hidden="true">→</span></a>
        </p>
      </div>
    </section>

    <footer className="bench-bottom">
      <span className="wb-hint">{text('单页原型 · 角色停在各自分区，靠近或聚焦时动态停住','One-page prototype · characters stay at their sections · motion pauses on hover or focus')}</span>
      <button type="button" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?text('继续动态','Resume motion'):text('暂停动态','Pause motion')}</button>
      <a className="bench-compare" href={zh?'/zh/workbench/':'/workbench/'}>{text('对比工作台原型 →','Compare with the workbench prototype →')}</a>
      <a className="bench-compare" href={routePath({view:'home'},lang)}>{text('对比现在的首页 →','Compare with the current home →')}</a>
    </footer>
  </main>;
}
