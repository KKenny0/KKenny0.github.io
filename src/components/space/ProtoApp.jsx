import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {flushSync} from 'react-dom';
import {LensTuner,TasteViewer,ResearchViewer,AboutMore,tasteProducts} from './Scenes';
import {SceneLink,RoutePathContext} from './SceneLink';
import {protoRoutePath,protoParseRoute,protoTitle} from '../../lib/proto-routes';
import {routePath,canonicalPath} from '../../lib/space-routes';
import {prototypeText,localizedNote,tasteEnglish} from '../../data/space-i18n';
import {lensInfo,projects,notes,observations,curated,projectVisual,aiWritingIds,zh as zhLabels,en as enLabels} from '../../data/space';
import {Media} from './Media';
import CollageNav from './CollageNav';
import {githubSnapshot} from '../../data/projects';
import {site} from '../../data/site';
import {createThemeController} from '../../lib/theme';
import '../../styles/proto-workbench.css';
const A='/assets/space/';
const focusKey=n=>n?.id||n?.getAttribute('href')||n?.getAttribute('aria-label')||n?.textContent?.trim();

/* Legacy About-section internal links stay inside the prototype instead of
   jumping to the official space pages mid-visit; other hrefs pass through. */
function legacyProtoLink(href,locale,space='prototype'){
  const official=`${locale==='zh'?'/zh':''}/projects/`;
  const base=`${locale==='zh'?'/zh':''}${space==='formal'?'':`/${space}`}`;
  if(href===`${official}#tracework`)return `${base}/projects/tracework/`;
  if(href===`${official}#card-skill`)return `${base}/work/card-skill/`;
  if(href==='/notes/?topic=memory')return `${base}/notes/?topic=memory`;
  return href;
}

/* Shared work media, identical to the official space rendering. */
function ProjectVisual({project,large=false,anchor=false,lang='zh'}){
  if(project.slug==='videowipe')return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-wipe ${large?'is-large':''}`} role="img" aria-label={prototypeText(lang,'VideoWipe 同一画面处理前后：字幕被清除','VideoWipe comparison of the same frame before and after subtitle removal')}><Media src={A+'videowipe-before.jpg'} alt=""/><Media src={A+'videowipe-after.jpg'} alt="" className="wipe-after"/><span className="wipe-divider"></span><span className="wipe-label before">{prototypeText(lang,'处理前','Before')}</span><span className="wipe-label after">{prototypeText(lang,'处理后','After')}</span></div>;
  const media=projectVisual[project.slug];
  if(media)return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual image-${media.kind} ${large?'is-large':''}`}><Media src={A+media.src} alt={project.name+prototypeText(lang,' 项目图像',' project image')}/><span className="visual-stamp mono">{media.kind==='poster'?'ACTUAL OUTPUT':'ACTUAL INTERFACE'} / {project.name.toUpperCase()}</span></div>;
  if(project.slug==='script-weaver')return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-script ${large?'is-large':''}`}><span className="script-top mono">AGENT / PRODUCTION SYSTEM</span><div className="script-diagram"><span>STORY<br/>IDEA</span><i>→</i><span>SCREEN<br/>PLAY</span><i>→</i><span>STORY<br/>BOARD</span></div><strong>Script-Weaver</strong><span className="visual-stamp mono">PROCESS SCHEMATIC · NOT A PRODUCT SCREENSHOT</span></div>;
  return <div style={anchor?{viewTransitionName:'selected-work'}:undefined} className={`project-visual visual-type ${large?'is-large':''}`}><span className="mono">{project.tagline}</span><strong>{project.name}</strong><p>{lang==='zh'?project.thesisZh:project.thesis}</p><span className="visual-stamp mono">PROJECT / {project.language||'RESEARCH'}</span></div>;
}

/* Long-form stories, ported from the official TraceworkStory / WeaveStory pages. */
function StoryPage({arg,lang,text}){
  const trace=arg==='tracework';
  const backLabel=trace?text('← 项目','← Projects'):text('← 项目','← Projects');
  return <article className={`pb-story pb-story-${arg}`}>
    <div className="pb-story-hero">
      <div className="pb-story-head">
        <SceneLink className="pb-crumb" route={{view:'projects',arg:'home'}}>{backLabel}</SceneLink>
        <div className="pb-story-meta mono">
          {trace?<><span>{text('01 / 记录','01 / Capture')}</span><span>{text('Codex + Claude 插件','Codex + Claude plugin')}</span><span>{text('本地优先','Local-first')}</span></>:<><span>{text('02 / 思考','02 / Think')}</span><span>{text('研究技能','Research skill')}</span><span>{text('Claude Code + Codex','Claude Code + Codex')}</span></>}
        </div>
        <h1>{trace?'Tracework':'weave'}</h1>
        <p className="pb-story-sub">{trace?text('回看工作为什么走到了这一步。','Replay why the work took this path.'):text('找到能把问题讲清楚的取景框。','Find the frame that makes a question clear.')}</p>
      </div>
      <aside className="pb-story-aside">
        <p>{trace?text('Git 能记录文件变化，却无法独自解释促成这些变化的决策、被放弃的路径，以及风险边界。','Git can show changed files. It cannot, by itself, explain the decision, rejected path, or risk boundary that made the work take this shape.'):text('流畅的总结可能掩盖证据的薄弱处。weave 保留证据，让材料决定文章的结构。','When a smooth summary hides where the ground is weak, weave keeps the evidence visible and lets the material choose its shape.')}</p>
        <div className="pb-story-actions">
          {trace?<>
            <a className="pb-cta" href="https://github.com/KKenny0/Tracework" target="_blank" rel="noopener noreferrer">{text('查看代码仓库 ↗','Read the repository ↗')}</a>
            <a className="pb-cta pb-cta-quiet" href="https://kkenny0.github.io/Tracework/" target="_blank" rel="noopener noreferrer">{text('打开使用文档 ↗','Open the documentation ↗')}</a>
          </>:<>
            <a className="pb-cta" href="https://github.com/KKenny0/weave" target="_blank" rel="noopener noreferrer">{text('查看代码仓库 ↗','Read the repository ↗')}</a>
            <span className="pb-story-note">{text('证据先行，取景框决定文章','Evidence first. Then the frame.')}</span>
          </>}
        </div>
      </aside>
      <div className="pb-story-board">
        <div className="pb-board-head mono"><span>{trace?text('决策回看流程','Decision Replay Loop'):text('取景框选择','Frame Decision')}</span><span>{trace?text('报告是对证据的组织','the report is a view over evidence'):text('文章是最后一步','the article is the last step')}</span></div>
        <ol className="pb-board-flow">
          {(trace?[
            [text('会话','session'),text('目标 · 选择 · 风险 · 下一步','goal · choice · risk · next step')],
            [text('信号','signals'),text('轻量 · 标准 · 深入','lite · standard · deep')],
            [text('原始记录','raw record'),text('条目 · 产物 · 决策','entries · artifacts · decisions')],
            [text('报告','report surfaces'),text('日报 · 周报 · 月报 · 路线图','Daily · Weekly · Monthly · Roadmap')],
            [text('原因','why'),text('只回答证据能支撑的部分','only when the evidence can carry it')]
          ]:[
            ['x',text('材料','material')],
            ['E',text('证据','evidence')],
            ['f₁ · f₂ · f₃',text('候选取景框','candidate frames')],
            ['f*',text('选定取景框','selected frame')],
            ['f*(x)',text('文章','article')]
          ]).map(([name,detail],i)=>(
            <li className="pb-board-node" key={name}><small className="mono">{String(i+1).padStart(2,'0')}</small><strong>{name}</strong><span>{detail}</span></li>
          ))}
        </ol>
        <p className="pb-board-caption">{trace?text('报告来自原始记录。查询可以回看本地证据支持的历史，但不能制造历史。','Reports are views over the raw record. Query can replay what local evidence supports; it cannot manufacture history.'):text('一个取景框只有真正改变文章保留什么、如何展开、在哪里停下，才值得使用。','A frame earns its place when it changes what the article keeps, how it moves, and where it stops.')}</p>
      </div>
    </div>

    <section className="pb-story-section">
      <span className="pb-kicker mono">{text('01 / 问题','01 / The question')}</span>
      <div>
        <h2>{trace?text('Git 记录了改动，却未必留下选择这条路的原因。','Git can tell you what changed. It cannot tell you why the path was chosen.'):text('读得顺的回答，也可能藏住依据。','A readable answer can still hide its ground.')}</h2>
        {trace?<>
          <p>{text('缺少的不是另一份活动流水，而是改动周围的决策背景：放弃过哪些选项、哪些证据起了作用、哪些风险仍然存在，以及推动工作继续的下一步。','The missing layer is not another activity stream. It is the decision context around the change: the alternatives that were rejected, the evidence that mattered, the risk boundary that stayed open, and the next step that made the work continue.')}</p>
          <p>{text('Tracework 在会话附近保留这些背景，让报告和后续查询回到原始记录，避免把历史压成一份过度自信的总结。','Tracework keeps that context close to the session, then lets reports and later queries point back to the raw record instead of smoothing the history into a confident summary.')}</p>
        </>:<>
          <p>{text('研究智能体善于把分散材料组织成连贯的文字。危险在于，分歧、薄弱证据和结论失效的边界可能在这个过程中消失。','Research agents are good at making scattered material sound coherent. The dangerous part is what disappears in the smoothing: disagreement, weak evidence, and the boundary where a claim stops working.')}</p>
          <p>{text('weave 把文章视为对证据的一种组织方式，而非模型所能说的一切的汇总。','weave treats the article as a view over evidence, not as a summary of everything the model can say.')}</p>
        </>}
      </div>
    </section>

    <section className="pb-story-section">
      <span className="pb-kicker mono">{trace?text('02 / 使用入口','02 / The surfaces'):text('02 / 三条路径','02 / Three routes')}</span>
      <div>
        <h2>{trace?text('一份记录，在不同的时刻回来查看。','One record, different moments of return.'):text('材料不同，观察角度也不同。','The material changes the lens.')}</h2>
        <p>{trace?text('这些入口读取同一层证据，不是各自维护一套事实的独立产品。','The surfaces are views into the same evidence layer, not separate products competing to become the source of truth.'):text('同一套流程，从三个入口研究问题。先确定哪些材料算证据，再选择文章的取景框。','One pipeline, three ways into a question. The route decides what counts as evidence before any frame is allowed to lead.')}</p>
      </div>
      <div className="pb-story-list">
        {(trace?[
          ['capture',text('会话目标、决策、放弃的路径、风险、产物、下一步','session goal, decision, rejected path, risk, artifact, next step'),text('可保留的原始条目','durable raw entry')],
          ['recall',text('近期决策、风险、未解决问题、相关产物','recent decisions, risks, open questions, relevant artifacts'),text('可用于继续工作的会话背景','usable session context')],
          ['query',text('原因、替代方案、来源引用、能否回答','why, alternatives, source refs, answerability'),text('带引用的回答，或明确的证据缺口','cited answer or explicit evidence gap')],
          [text('daily / weekly / monthly','daily / weekly / monthly'),text('成果、工作线、决策、证据审视','outcomes, work streams, decisions, evidence audit'),text('面向工作沟通的报告','workplace-facing report')],
          ['roadmap',text('决策线索、累积风险、反复出现的问题','decision threads, accumulating risks, recurring questions'),text('保留边界的长期方向','long-cycle direction with its edges intact')]
        ]:[
          ['deep-read',text('论文、文章、访谈、报告','Papers, articles, interviews, reports'),text('以证据为基础的中文长文','Evidence-grounded Chinese longform')],
          ['source-dive',text('代码仓库、框架、技术项目','Repositories, frameworks, technical projects'),text('行为路径、状态归属、失败边界','Behavior paths, state owners, failure boundaries')],
          ['survey',text('领域与研究方向','Domains and research directions'),text('结构随材料而定的领域地图','A map whose structure follows the source set')]
        ]).map(([name,input,output],i)=>(
          <div className="pb-story-row" key={name}><strong><small className="mono">{String(i+1).padStart(2,'0')}</small>{name}</strong><p>{input}</p><p className="pb-story-out">{output}</p></div>
        ))}
      </div>
    </section>

    <section className="pb-story-section">
      <span className="pb-kicker mono">{trace?text('03 / 可信性检查','03 / Trust gates'):text('03 / 取景框检查','03 / Frame gates')}</span>
      <div>
        <h2>{trace?text('报告说明自己知道多少，才值得信任。','A report earns trust by showing where it stops.'):text('取舍有依据，取景框才有用。','A frame is useful only when it earns the crop.')}</h2>
        <p>{trace?text('Tracework 把证据边界落实为产品行为，而非在回答末尾附上一段声明。','Tracework treats evidence boundaries as product behavior, not a disclaimer added after the answer.'):text('目标不在于凑够候选数量。只有忠于证据、具体、有取舍、坦诚说明边界，并且与其他选项有实质区别的取景框，才能留下。','Candidate count is not the goal. A frame survives only when it is faithful, specific, selective, honest about its limits, and meaningfully different from the alternatives.')}</p>
      </div>
      <ol className="pb-story-gates">
        {(trace?[
          [text('原始记录优先','Raw first'),text('原始条目是语义来源。记录有缺口时，Git 只能提供有限的补充。','Raw entries are the semantic source. Git is only a limited fallback for coverage gaps.')],
          [text('先分范围，再选内容','Scope before selection'),text('先区分报告所属的工作组，再选择重点，避免工作与个人背景混在一起。','Reporting groups are separated before headlines are selected, so work and personal context do not blur together.')],
          [text('证据边界','Evidence boundary'),text('来源引用说明出处，并不自动构成独立验证。','Source refs show provenance; they do not automatically become independent verification.')],
          [text('允许拒绝回答','Refusal is a feature'),text('本地记录无法支撑问题时，查询返回证据缺口，而非编造历史。','When the local record cannot support the question, query returns an evidence gap instead of inventing history.')],
          [text('记录覆盖不等于成果','Coverage is not outcome'),text('活动数量只说明记录覆盖情况，不能证明工作取得了成果。','Activity counts describe coverage metadata. They do not prove that the work produced a result.')]
        ]:[
          [text('忠于证据','Evidence fidelity'),text('支撑结论的每个关键部分，都能追溯到证据模型。','Every load-bearing part can be traced back to the evidence model.')],
          [text('具体性','Specificity'),text('不能原封不动地套用到下一份材料或相邻话题。','It cannot be moved unchanged onto the next source or neighboring topic.')],
          [text('取舍效果','Selection effect'),text('确实改变证据选择、章节顺序、因果解释或预期边界。','It changes the evidence, chapter order, causal story, or predicted boundary.')],
          [text('坦承边界','Honest limits'),text('它说明取景框在哪里失效、看不见什么。','It says where the frame stops working and what it cannot see.')],
          [text('不可替代','Non-redundancy'),text('与其他候选取景框有实质区别。','It is meaningfully different from the other candidate frames.')]
        ]).map(([name,detail],i)=>(
          <li key={name}><span className="mono">{String(i+1).padStart(2,'0')}</span><strong>{name}</strong><p>{detail}</p></li>
        ))}
      </ol>
    </section>

    {trace&&<section className="pb-story-section">
      <span className="pb-kicker mono">{text('04 / 边界','04 / Boundary')}</span>
      <div>
        <h2>{text('边界也是承诺的一部分。','The boundary is part of the promise.')}</h2>
        <p>{text('Tracework 让工作记忆可以检查，同时避免把工作记录变成监控。','Tracework is useful because it keeps the memory inspectable without turning work into surveillance.')}</p>
      </div>
      <div className="pb-story-boundary">
        <div><span className="pb-boundary-mark mono">{text('会做什么','It does')}</span><ul>
          <li>{text('把选择、风险、产物和下一步与对应证据放在一起。','Keep work choices, risks, artifacts, and next steps close to their evidence.')}</li>
          <li>{text('让日报、周报和月报可以回到原始记录。','Let daily, weekly, and monthly reports return to the raw record.')}</li>
          <li>{text('为下一次会话提供范围明确的工作背景。','Give the next session bounded context for continuing the work.')}</li>
        </ul></div>
        <div><span className="pb-boundary-mark mono">{text('不会做什么','It does not')}</span><ul>
          <li>{text('把活动记录包装成绩效成果。','Package activity records as performance outcomes.')}</li>
          <li>{text('用一份薄弱材料支持跨越整个领域的结论。','Use one thin source to support a claim across an entire field.')}</li>
          <li>{text('把本地工作记忆变成审批或监控系统。','Turn local work memory into an approval or monitoring system.')}</li>
        </ul></div>
      </div>
    </section>}

    <section className="pb-story-section pb-story-cta">
      <span className="pb-kicker mono">{trace?text('05 / 继续探索','05 / Continue'):text('04 / 继续探索','04 / Continue')}</span>
      <div>
        <h2>{trace?text('把原因留在工作附近。','Keep the why close to the work.'):text('证据先行，取景框决定文章','Evidence first. Then the frame.')}</h2>
        <p>{trace?text('先在代码仓库了解约定与流程，再通过文档把这套流程用到真实项目中。','Read the repository for the contracts and workflows, then use the documentation when you are ready to make the loop part of a real project.'):text('weave 让证据保持可见，让候选取景框相互竞争，然后才写下文章。','weave keeps the evidence visible, lets candidate frames compete, and only then writes the article.')}</p>
        <div className="pb-story-actions">
          {trace?<><a className="pb-cta" href="https://github.com/KKenny0/Tracework" target="_blank" rel="noopener noreferrer">{text('在 GitHub 查看代码 ↗','Open the GitHub repository ↗')}</a>
            <a className="pb-cta" href="https://kkenny0.github.io/Tracework/" target="_blank" rel="noopener noreferrer">{text('阅读 Tracework 文档 ↗','Read the Tracework documentation ↗')}</a>
            <SceneLink className="pb-cta pb-cta-quiet" route={{view:'projects',arg:'home'}}>{text('返回项目列表','Back to the project index')}</SceneLink></>
          :<><a className="pb-cta" href="https://github.com/KKenny0/weave" target="_blank" rel="noopener noreferrer">{text('在 GitHub 查看代码 ↗','Open the GitHub repository ↗')}</a>
            <SceneLink className="pb-cta pb-cta-quiet" route={{view:'projects',arg:'ai',item:'weave'}}>{text('在项目列表中查看 weave','View weave in the project index')}</SceneLink></>}
        </div>
      </div>
    </section>
  </article>;
}

/* Support, ported from the official SupportPage. */
function SupportPage({lang,text}){
  return <article className="pb-support">
    <div className="pb-support-head">
      <span className="pb-kicker mono">{text('支持这些工作','SUPPORT THE WORK')}</span>
      <h1>{text('让有用的尝试继续得到维护。','Help useful experiments stay maintained.')}</h1>
      <p>{text('标星、问题反馈、认真写下的建议，以及赞助，都能帮助这些本地工具与智能体工作流继续完善文档、保持可用。','Stars, issues, thoughtful notes, and sponsorship all help local-first tools and agent workflows remain documented and usable.')}</p>
    </div>
    <div className="pb-support-grid">
      <section>
        <span className="pb-kicker mono">{text('01 / 直接支持','01 / DIRECT SUPPORT')}</span>
        <h2>{text('支付宝与微信支付','Alipay & WeChat Pay')}</h2>
        <div className="pb-qr-pair">
          <figure><img src="/assets/img/support/alipay-qr.png" width="720" height="720" alt={text('支付宝收款二维码','Alipay payment QR code')}/><figcaption>{text('支付宝','Alipay')}</figcaption></figure>
          <figure><img src="/assets/img/support/wechat-qr.png" width="720" height="720" alt={text('微信收款二维码','WeChat Pay payment QR code')}/><figcaption>{text('微信支付','WeChat Pay')}</figcaption></figure>
        </div>
      </section>
      <section>
        <span className="pb-kicker mono">{text('02 / 其他方式','02 / OTHER WAYS')}</span>
        <h2>{text('从任何地方支持','Support from anywhere')}</h2>
        <p>{text('如果这些工具对你有用，可以通过 PayPal 自愿支持。是否支持不会影响功能或使用权限。','If these tools have been useful, you can make an optional contribution through PayPal. Support never unlocks features or changes access.')}</p>
        <a className="pb-cta" href="https://www.paypal.me/Kennywu96" target="_blank" rel="noopener noreferrer">{text('通过 PayPal 支持 ↗','Support via PayPal ↗')}</a>
        <ul className="pb-support-list">
          <li>{text('给实际用到的项目标星。','Star a project you actually use.')}</li>
          <li>{text('提交能说明具体故障的问题反馈。','Open an issue with a concrete failure.')}</li>
          <li>{text('把工具分享给需要的人。','Share a tool with the person who needs it.')}</li>
          <li>{text('告诉我哪些地方应当保持简单、不打扰。','Tell me what should stay quiet.')}</li>
        </ul>
        <a className="pb-cta pb-cta-quiet" href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">{text('访问 GitHub ↗','Visit GitHub ↗')}</a>
      </section>
    </div>
  </article>;
}

/* Everything shown is real repo content, rendered in the approved workbench tone. */
export default function ProtoApp({initialRoute,locale,space='prototype'}){
  const [route,setRoute]=useState(initialRoute);
  const [theme,setTheme]=useState('system');
  const lang=locale;
  const zh=lang==='zh';
  const themeController=useRef(null);
  const [paused,setPaused]=useState(false);
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
  const t=zh?zhLabels:enLabels;
  const text=(zhS,enS)=>prototypeText(lang,zhS,enS);
  const displayObservations=useMemo(()=>observations.map(n=>localizedNote(n,lang)),[lang]);
  const displayCurated=useMemo(()=>curated.map(n=>localizedNote(n,lang)),[lang]);
  const routeHash=r=>protoRoutePath(r,lang,space);

  useEffect(()=>{try{setPaused(sessionStorage.getItem('kenny-home-motion-paused')==='true');}catch{}},[]);
  function togglePaused(){
    const next=!paused;setPaused(next);
    try{sessionStorage.setItem('kenny-home-motion-paused',String(next));}catch{}
  }
  useEffect(()=>{const controller=createThemeController(setTheme);themeController.current=controller;return()=>controller.destroy();},[]);
  useEffect(()=>{
    document.title=protoTitle(route,lang);
    if(space!=='formal')return;
    const isIndex=['projects','notes'].includes(route.view)&&location.pathname.replace(/\/$/,'')===`${lang==='zh'?'/zh':''}/${route.view}`;
    const canonicalRoute=isIndex?{...route,item:undefined}:route;
    const canonical=new URL(canonicalPath(canonicalRoute,lang),site.canonical).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonical);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonical);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    for(const link of document.querySelectorAll('link[hreflang]'))link.setAttribute('href',new URL(canonicalPath(canonicalRoute,link.hreflang==='zh-CN'?'zh':'en'),site.canonical).href);
  },[route,lang,space]);

  function snapshot(){return {projectId,noteId,projectFilter,projectQuery,showArchived,projectSort,noteQuery,noteFilter,scroll:window.scrollY,focusKey:focusKey(document.activeElement)};}
  // Browser Back can leave without calling our navigation functions. Keep the current
  // entry up to date so Forward also restores searches, filters, scroll and focus.
  useEffect(()=>{
    let timer;
    const save=()=>{if(historyReady.current&&history.state?.proto&&routeHash(history.state.route)===routeHash(route)){
      if(route.view==='projects'&&filteredProjects.length&&!filteredProjects.some(p=>p.slug===projectId))return;
      const current=snapshot();history.replaceState({...history.state,snapshot:current},'',location.href);
      try{sessionStorage.setItem('kenny-proto-view:v1:'+routeHash(route),JSON.stringify(current));}catch{}
    }};
    const onScroll=()=>{clearTimeout(timer);timer=setTimeout(save,120);};
    save();addEventListener('scroll',onScroll,{passive:true});document.addEventListener('focusin',save);
    return()=>{clearTimeout(timer);removeEventListener('scroll',onScroll);document.removeEventListener('focusin',save);};
  },[route,projectId,noteId,projectFilter,projectQuery,showArchived,projectSort,noteQuery,noteFilter]);
  useEffect(()=>{
    const resolved=typeof window==='undefined'?initialRoute:protoParseRoute(new URL(location.href));
    if(resolved.topic)setNoteFilter(resolved.topic);
    if(JSON.stringify(resolved)!==JSON.stringify(initialRoute)){setRoute(resolved);if(resolved.view==='projects'&&resolved.item){setProjectId(resolved.item);if(projects.find(p=>p.slug===resolved.item)?.archived)setShowArchived(true);}if(resolved.view==='notes'&&resolved.item)setNoteId(resolved.item);}
    let saved=history.state?.proto&&routeHash(history.state.route)===routeHash(resolved)?history.state.snapshot:null;
    if(!saved)try{saved=JSON.parse(sessionStorage.getItem('kenny-proto-view:v1:'+routeHash(resolved))||'null');}catch{}
    if(saved){setProjectId(saved.projectId);setNoteId(saved.noteId);setProjectFilter(saved.projectFilter);setProjectQuery(saved.projectQuery);setShowArchived(saved.showArchived||false);setProjectSort(saved.projectSort||'selected');setNoteQuery(saved.noteQuery||'');setNoteFilter(saved.noteFilter||'all');pendingRestore.current=saved;setRestoreSequence(n=>n+1);}
    if(!history.state?.proto)history.replaceState({proto:true,depth:0,route:resolved},'',location.href);
    historyReady.current=true;
    const onPop=e=>{
      const saved=e.state?.snapshot;
      if(saved){setProjectId(saved.projectId);setNoteId(saved.noteId);setProjectFilter(saved.projectFilter);setProjectQuery(saved.projectQuery);setNoteQuery(saved.noteQuery||'');setNoteFilter(saved.noteFilter||'all');setShowArchived(saved.showArchived||false);setProjectSort(saved.projectSort||'selected');pendingRestore.current=saved;}
      const next=e.state?.route||protoParseRoute(new URL(location.href));
      if(!saved&&next.item){if(next.view==='projects')setProjectId(next.item);if(next.view==='notes')setNoteId(next.item);}
      setRoute(next);setRestoreSequence(n=>n+1);
    };
    const onPointer=()=>document.documentElement.dataset.input='pointer';
    const onKey=()=>document.documentElement.dataset.input='keyboard';
    const routeFromHash=()=>protoParseRoute(new URL(location.href));
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
    (target||mainRef.current)?.focus({preventScroll:true});
  },[route.view,route.arg,restoreSequence]);
  function commitRoute(next){
    const update=()=>flushSync(()=>setRoute(next));
    const skipMotion=(space==='collage'||space==='formal')||document.documentElement.dataset.input==='keyboard'||matchMedia('(prefers-reduced-motion: reduce)').matches||document.querySelector('.proto-site')?.dataset.motion==='paused';
    if(document.startViewTransition&&!skipMotion){routeMotion.current?.skipTransition();routeMotion.current=document.startViewTransition(update);}
    else update();
  }
  function navigate(view,arg='',work=0,item=''){
    const next={view,arg,work,item};
    if(next.view===route.view&&next.arg===route.arg&&next.work===(route.work||0)&&item===(route.item||''))return;
    history.replaceState({...history.state,snapshot:snapshot()},'',location.href);
    history.pushState({proto:true,depth:(history.state?.depth||0)+1,route:next},'',routeHash(next));
    if(view==='lens'&&arg==='online'&&!curated.some(n=>n.id===noteId))setNoteId(curated[0].id);
    commitRoute(next);
  }
  function back(){
    if((history.state?.depth||0)>0){history.replaceState({...history.state,snapshot:snapshot()},'',location.href);history.back();return;}
    if(route.view==='taste')navigate('lens','taste');
    else if(route.view==='story')navigate('projects');
    else if(['projects','notes'].includes(route.view)&&lensInfo[route.arg])navigate('lens',route.arg);
    else if(route.view==='about'&&route.arg==='execution')navigate('lens','execution');
    // The workbench home is a separate static page, not an app view.
    else location.href=routeHash({view:'home',arg:''});
  }
  useEffect(()=>{
    const onKey=e=>{
      if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;
      if(route.view!=='home')back();
    };
    addEventListener('keydown',onKey);return()=>removeEventListener('keydown',onKey);
  },[route,projectId,noteId,projectFilter,projectQuery]);
  function openProjects(from,slug){
    if(slug)setProjectId(slug);setProjectQuery('');setProjectFilter('all');
    navigate('projects',from,0,slug||projectId);
  }
  function openNotes(from,id){
    if(id)setNoteId(id);
    navigate('notes',from,0,id||noteId);
  }
  function replaceSelection(view,id){
    if(view==='projects')setProjectId(id);else setNoteId(id);
    if(route.view!==view)return;
    const next={...route,item:id};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);
  }
  function selectProject(id){replaceSelection('projects',id);}
  function selectNote(id){replaceSelection('notes',id);}
  function selectTaste(index){
    const next={...route,work:index};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);
  }
  function handleSceneClick(e){
    const anchor=e.target.closest('a[data-scene]');
    if(!anchor||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const url=new URL(anchor.href);
    if(url.origin!==location.origin)return;
    const next=protoParseRoute(url);
    // The workbench home is a static page; let the browser load it normally.
    if(next.view==='home')return;
    e.preventDefault();
    if(next.view==='projects'){
      if(route.view==='projects'){selectProject(next.item);return;}
      setProjectId(next.item||'script-weaver');setProjectFilter('all');setProjectQuery('');
      setShowArchived(!!projects.find(p=>p.slug===next.item)?.archived);
    }
    if(next.view==='notes')setNoteId(next.item||'goal');
    navigate(next.view,next.arg,next.work,next.item);
  }
  const activeProject=projects.find(p=>p.slug===projectId)||projects[0];
  const activeNote=displayObservations.find(n=>n.id===noteId)||displayObservations[0];
  const filteredProjects=useMemo(()=>projects.filter(p=>(showArchived||!p.archived)&&(projectFilter==='all'||p.practice===projectFilter)&&(!projectQuery||`${p.name} ${p.thesisZh} ${p.descriptionZh} ${p.thesis} ${p.description}`.toLowerCase().includes(projectQuery.toLowerCase()))).sort((a,b)=>projectSort==='updated'?b.pushedAt.localeCompare(a.pushedAt):projectSort==='stars'?b.stars-a.stars:Number(b.featured)-Number(a.featured)||b.stars-a.stars),[projectFilter,projectQuery,showArchived,projectSort]);
  useEffect(()=>{if(route.view==='projects'&&filteredProjects.length&&!filteredProjects.some(p=>p.slug===projectId))selectProject(filteredProjects[0].slug)},[route.view,filteredProjects,projectId]);
  const storyMatch=activeProject.detailUrl?.match(/projects\/(tracework|weave)/);

  const roleClass=route.arg&&lensInfo[route.arg]?`pb-role-${route.arg}`:route.view==='taste'?'pb-role-taste':route.view==='story'?`pb-role-${route.arg==='tracework'?'online':'ai'}`:'';
  const screenName=route.view==='home'?'Workbench':route.view==='taste'?'Taste':route.view==='lens'?lensInfo[route.arg]?.name:route.view==='projects'?(t.projects):route.view==='notes'?(route.arg==='ai'?'AI':t.notes):route.view==='support'?(zh?'支持':'Support'):route.view==='story'?(route.arg==='tracework'?'Tracework':'weave'):(zh?'关于':'About');
  const backTargets={taste:text('产品','Products'),story:text('项目','Projects'),support:text('首页','Home')};
  const backLabel=route.view==='projects'||route.view==='notes'?route.arg==='home'||!lensInfo[route.arg]?t.home:lensInfo[route.arg]?.name:route.view==='taste'?backTargets.taste:route.view==='story'?backTargets.story:route.view==='support'?backTargets.support:route.view==='about'&&route.arg==='execution'?lensInfo.execution.name:t.home;

  return <RoutePathContext.Provider value={(route,linkLocale)=>protoRoutePath(route,linkLocale||lang,space)}>
    <div className={`proto-site ${(space==='collage'||space==='formal')?'collage-inner':''} ${roleClass}`} data-motion={paused?'paused':'live'} data-view={route.view} data-arg={route.arg||''} onClick={handleSceneClick}>
      <a className="skip" href="#main">{zh?'跳到主要内容':'Skip to content'}</a>
      <header className="pb-header">
        <SceneLink className="pb-brand" route={{view:'home',arg:''}} aria-label={(space==='collage'||space==='formal')?text('回到拼贴首页','Return to the collage home'):text('回到工作台首页','Return to the workbench home')}>Kenny Wu</SceneLink>
        {(space==='collage'||space==='formal')?<CollageNav lang={lang} view={route.view} mode={space==='formal'?'formal':'prototype'}/>:<nav className="pb-nav mono" aria-label={text('原型导航','Prototype navigation')}>
          <SceneLink route={{view:'projects',arg:'home'}} aria-current={route.view==='projects'}>{t.projects}</SceneLink>
          <SceneLink route={{view:'notes',arg:'online'}} aria-current={route.view==='notes'}>{t.notes}</SceneLink>
          <SceneLink route={{view:'about',arg:'home'}} aria-current={route.view==='about'}>{t.about}</SceneLink>
          <SceneLink route={{view:'support',arg:''}} aria-current={route.view==='support'}>{text('支持','Support')}</SceneLink>
        </nav>}
        <div className="pb-tools">
          <div className="pb-theme" role="group" aria-label={t.theme}>
            <button type="button" aria-pressed={theme==='system'} onClick={()=>themeController.current?.set('system')}>{text('系统','Auto')}</button>
            <button type="button" aria-pressed={theme==='light'} onClick={()=>themeController.current?.set('light')}>{t.light}</button>
            <button type="button" aria-pressed={theme==='dark'} onClick={()=>themeController.current?.set('dark')}>{t.dark}</button>
          </div>
          <a className="pb-language" href={protoRoutePath(route,zh?'en':'zh',space)} hrefLang={zh?'en':'zh-CN'} aria-label={t.language}>{zh?'EN':'中'}</a>
        </div>
      </header>

      <main id="main" className={`pb-main pb-${route.view}${route.arg?` pb-${route.view}-${route.arg}`:''}`} data-screen-label={screenName} ref={mainRef} tabIndex="-1">
        {route.view!=='home'&&<div className="pb-viewline">
          <button type="button" className="pb-back" onClick={back}>← {backLabel}</button>
          <span className="pb-context mono">KENNY WU / {screenName?.toUpperCase()}</span>
        </div>}

        {route.view==='lens'&&route.arg==='online'&&<LensTuner query={noteQuery} setQuery={setNoteQuery} filter={noteFilter} setFilter={setNoteFilter} expanded={false} entries={displayObservations} curated={displayCurated} selected={activeNote} onSelect={selectNote} onExpand={()=>openNotes('online',noteId)} lang={lang} wheelScope=".tuner-stage"/>}

        {route.view==='lens'&&route.arg==='taste'&&<section className="pb-lens">
          <div className="pb-lens-head">
            <span className="pb-kicker mono">CREATION / SELECTED WORK</span>
            <h1>{text(<>让想法，<br/>有自己的形状。</>,<>Give ideas<br/>a form.</>)}</h1>
            <p>{text('把文本和阅读，做成具体的作品。','Turn text and reading into tangible craft.')}</p>
          </div>
          <div className="pb-pair">
            <SceneLink className="pb-object" route={{view:'taste',arg:'card-skill'}}>
              <span className="mono pb-object-no">01 / VISUAL TOOL</span>
              <span className="pb-object-art pb-art-pair"><Media src={A+'thousand-brains.png'} alt={text('《千脑智能》读书海报','A Thousand Brains reading poster')}/><Media src={A+'a2a-cover.png'} alt={text('A2A 协作封面','A2A collaboration cover')}/></span>
              <span className="pb-object-title"><strong>card-skill</strong><small>{text('把文本变成可阅读的视觉作品。','Turn text into visual work.')}</small><i aria-hidden="true">→</i></span>
            </SceneLink>
            <SceneLink className="pb-object" route={{view:'taste',arg:'kami-reader'}}>
              <span className="mono pb-object-no">02 / READING SYSTEM</span>
              <span className="pb-object-art pb-art-screen"><Media src={A+'kami.png'} alt={text('Kami Reader 真实界面','Actual Kami Reader interface')}/></span>
              <span className="pb-object-title"><strong>Kami Reader</strong><small>{text('让长时间阅读停留在内容本身。','Keep sustained reading focused on the text itself.')}</small><i aria-hidden="true">→</i></span>
            </SceneLink>
          </div>
          <SceneLink className="pb-passage" route={{view:'projects',arg:'taste',item:'card-skill'}}><span className="mono">CONTINUE / PROJECTS</span><strong>{text('在这两款产品之外，浏览更多项目','Explore more projects beyond these products')}</strong><em aria-hidden="true">→</em></SceneLink>
        </section>}

        {route.view==='lens'&&route.arg==='ai'&&<section className="pb-lens pb-lens-ai">
          <div className="pb-lens-head">
            <span className="pb-kicker mono">SYSTEMS / RESEARCH</span>
            <h1>{text('做出来，也拆开看。','Build it. Study it.')}</h1>
          </div>
          <div className="pb-exhibit">
            <div className="pb-col">
              <h2 className="pb-exhibit-head">{text('GitHub 项目','GitHub projects')}</h2>
              {['script-weaver','videowipe'].map(id=>{
                const p=projects.find(p=>p.slug===id);
                return <SceneLink className="pb-sample" type="button" key={id} route={{view:'projects',arg:'ai',item:id}}><span className="pb-sample-kind">{text('项目','Project')}</span><div className="pb-sample-material" aria-label={id==='script-weaver'?text('工作流程示意，非产品截图','Process schematic, not a product screenshot'):undefined}><ProjectVisual project={p} lang={lang}/></div><span className="pb-sample-caption"><strong>{p.name}</strong><small>{id==='script-weaver'?text('剧本与分镜生成','Script & storyboard generation'):text('视频字幕与遮挡清理','Subtitle & watermark removal')}</small><b aria-hidden="true">→</b></span></SceneLink>;
              })}
            </div>
            <div className="pb-col">
              <h2 className="pb-exhibit-head">{text('专业文章','Technical writing')}</h2>
              {aiWritingIds.map(id=>{
                const n=displayObservations.find(n=>n.id===id),memory=id===aiWritingIds[0];
                return <SceneLink className="pb-sample pb-sample-note" type="button" key={id} route={{view:'notes',arg:'ai',item:id}}><span className="pb-sample-kind">{text('文章','Writing')}</span><div className="pb-note-paper"><time className="mono">{n.date.replace('-','.')}</time><strong>{memory?text(<>记忆如何<br/>决定行动</>,<>When memory<br/>shapes action</>):text(<>压缩之后，<br/>如何接着工作</>,<>Keep working<br/>after compression</>)}</strong></div><span className="pb-sample-caption"><strong>{memory?'Agent Memory Systems':'Claude Code Compact'}</strong><small>{memory?text('长期记忆的四个控制面','Four control planes for long-term memory'):text('压缩之后如何重建工作记忆','Rebuilding working memory after compression')}</small><b aria-hidden="true">→</b></span></SceneLink>;
              })}
            </div>
          </div>
          <div className="pb-more">
            <SceneLink route={{view:'projects',arg:'ai',item:'script-weaver'}}>{text('全部项目 →','All projects →')}</SceneLink>
            <SceneLink route={{view:'notes',arg:'ai',item:aiWritingIds[0]}}>{text('全部专业文章 →','Technical writing archive →')}</SceneLink>
          </div>
        </section>}

        {route.view==='lens'&&route.arg==='execution'&&<section className="pb-lens pb-lens-execution">
          <div className="pb-lens-head">
            <span className="pb-kicker mono">SYSTEM IN PRACTICE / 2026</span>
            <h1>{text(<>让复杂工作，<br/>走到完成。</>,<>Carry the work<br/>through.</>)}</h1>
            <p>{text('从剧本理解、角色资产到分镜生成，把质量检查与失败恢复放进同一条工作链路。','Connect script understanding, character assets and storyboards with quality checks and recovery in one workflow.')}</p>
          </div>
          <div className="pb-path">
            <span className="mono">AI COMICS GENERATION / WORKFLOW</span>
            <ol>{(zh?['读懂剧本','整理资产','生成分镜','质检与恢复']:['Read the script','Prepare assets','Build storyboards','Check and recover']).map((step,i)=><li key={step}><small className="mono">0{i+1}</small><strong>{step}</strong></li>)}</ol>
            <Media src={A+'execution.webp'} alt="" sizes="(max-width: 699px) 30vw, 96px"/>
          </div>
          <div className="pb-results">
            <div><span className="mono">FIXED EVALUATION SET</span><strong>≈18% <i aria-hidden="true">→</i> 9.53%</strong><p>{text('动作过载与景别失当问题率','Issue rate: overloaded action and unsuitable shot scale')}</p></div>
            <div><span className="mono">ONE LONG RUN</span><strong>20 <small>{text('集','episodes')}</small></strong><p>{text('中间报错后自动恢复，完整跑完','Recovered from runtime errors and completed the full run')}</p></div>
          </div>
          <div className="pb-dual">
            <SceneLink className="pb-passage" route={{view:'projects',arg:'execution',item:'script-weaver'}}><span className="mono">WORK / PROJECTS</span><strong>{text('浏览做过的更多项目','Explore more projects')}</strong><em aria-hidden="true">→</em></SceneLink>
            <SceneLink className="pb-passage" route={{view:'about',arg:'execution'}}><span className="mono">PERSON / ABOUT</span><strong>{text('认识做这些工作的人','Meet the person behind the work')}</strong><em aria-hidden="true">→</em></SceneLink>
          </div>
        </section>}

        {route.view==='projects'&&<section className="pb-catalog">
          <div className="pb-title-row">
            <h1>{t.projectIndex}</h1>
            <p>{text('工具、产品与研究','Tools, products and research')} · {projects.length}</p>
          </div>
          <div className="pb-filters">
            <div className="pb-filter-group" aria-label={text('筛选项目','Filter projects')}>
              {[['all',text('全部','All')],['make',text('制作','Making')],['think',text('思考','Thinking')],['research',text('研究','Research')],['capture',text('记录','Capture')]].map(([key,label])=><button key={key} type="button" aria-pressed={projectFilter===key} className={projectFilter===key?'active':''} onClick={()=>setProjectFilter(key)}>{label}</button>)}
            </div>
            <label className="pb-search"><span className="mono">SEARCH</span><input aria-label={text('搜索项目','Search projects')} value={projectQuery} onChange={e=>setProjectQuery(e.target.value)} placeholder={text('名称 / 关键词','Name / keyword')}/></label>
          </div>
          <details className="pb-options"><summary>{text('排序与归档','Sorting and archive')} <span className="pb-sign" aria-hidden="true"></span></summary>
            <div className="pb-options-body">
              <label><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>{text('显示归档项目','Include archived projects')}</label>
              <label>{text('排序','Sort')}<select value={projectSort} onChange={e=>setProjectSort(e.target.value)}><option value="selected">{text('精选','Selected')}</option><option value="stars">Stars</option><option value="updated">{text('最近更新','Recently updated')}</option></select></label>
            </div>
          </details>
          {!filteredProjects.length&&<p className="pb-empty">{text('没有找到项目，请换个关键词。','No matching projects. Try another keyword.')}</p>}
          {filteredProjects.length>0&&<div className="pb-worktable">
            <div className="pb-surface">
              <div className="pb-surface-top mono"><span>ON THE TABLE / {activeProject.name}</span><span>{activeProject.tagline}</span></div>
              <ProjectVisual project={activeProject} large anchor lang={lang}/>
              <div className="pb-surface-foot"><div><span className="mono">{activeProject.practice.toUpperCase()} / {activeProject.language||'PROJECT'}</span><h2>{activeProject.name}</h2><p>{zh?activeProject.thesisZh:activeProject.thesis}</p></div><span className="pb-total mono">{projects.length} TOTAL</span></div>
            </div>
            <aside className="pb-drawer">
              <div className="pb-drawer-head"><span className="mono">INDEX / {filteredProjects.length} WORKS</span></div>
              <div className="pb-drawer-list">{filteredProjects.map((p,i)=><SceneLink id={p.slug} route={{view:'projects',arg:route.arg,item:p.slug}} lang={lang} key={p.slug} aria-current={p.slug===activeProject.slug} className={p.slug===activeProject.slug?'active':''}><span className="mono">{String(i+1).padStart(2,'0')}</span><strong>{p.name}</strong><small>{p.tagline}</small><i aria-hidden="true">→</i></SceneLink>)}</div>
            </aside>
          </div>}
          {filteredProjects.length>0&&<>
            <div className="pb-detail">
              <p>{zh?activeProject.descriptionZh:activeProject.description}</p>
              <div className="pb-detail-links">
                <a href={activeProject.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                {storyMatch&&<SceneLink route={{view:'story',arg:storyMatch[1]}}>{text('项目详解 ↗','Project story ↗')}</SceneLink>}
                {activeProject.homepage&&<a href={activeProject.homepage} target="_blank" rel="noopener noreferrer">{text('访问产品 ↗','Visit product ↗')}</a>}
              </div>
            </div>
            <p className="pb-index-note">{activeProject.stars} stars · {activeProject.forks} forks · {text('更新','Updated')} {activeProject.pushedAt.slice(0,10)} · {text('快照','Snapshot')} <time dateTime={githubSnapshot.date}>{githubSnapshot.date}</time></p>
          </>}
        </section>}

        {(route.view==='notes'&&route.arg==='online')&&<LensTuner query={noteQuery} setQuery={setNoteQuery} filter={noteFilter} setFilter={value=>{setNoteFilter(value);const next={...route,topic:value};history.replaceState({...history.state,route:next},'',routeHash(next));setRoute(next);}} expanded={true} entries={displayObservations} curated={displayCurated} selected={activeNote} onSelect={selectNote} onCollapse={back} collapseLabel={text('← 回到精选观察','← Back to selected observations')} lang={lang} wheelScope=".tuner-stage"/>}

        {route.view==='notes'&&route.arg==='ai'&&<ResearchViewer note={activeNote} entries={displayObservations.filter(n=>n.primary==='ai')} onSelect={selectNote} lang={lang}/>}

        {route.view==='taste'&&<TasteViewer productId={route.arg} index={Math.min(route.work||0,(tasteProducts.find(p=>p.id===route.arg)||tasteProducts[0]).works.length-1)} onSelect={selectTaste} onProducts={back} onProjects={()=>openProjects('taste',route.arg==='kami-reader'?'obsidian-kami':'card-skill')} lang={lang}/>}

        {route.view==='about'&&<section className="pb-about">
          <div className="pb-about-hero">
            <div className="pb-about-words">
              <span className="mono">KENNY WU / SHENZHEN / AI ENGINEER</span>
              <h1>{text(<>镜头背后，<br/>是同一个人。</>,<>One person,<br/>behind the lenses.</>)}</h1>
              <p>{text('我是 Kenny Wu，一名在深圳的 AI 工程师。经历从 NLP 与信息检索，延伸到多模态理解与内容生成。我最关心的一件事，是如何把前沿模型能力，扎扎实实做成稳定好用的产品。','I’m Kenny Wu, an AI engineer in Shenzhen. My work spans NLP, information retrieval, multimodal understanding and content generation. I care about turning advances in models into stable, useful products.')}</p>
              <a className="pb-cta" href={`mailto:${site.email}`}>{text('联系我 ↗','Contact me ↗')}</a>
            </div>
            <figure className="pb-portrait">
              <span className="pb-tape" aria-hidden="true"></span>
              <Media src={A+'self-profo.jpg'} width="1080" height="1080" alt={text('Kenny Wu 肖像','Portrait of Kenny Wu')}/>
              <figcaption className="mono">{text('KENNY WU / 吴嘉业','KENNY WU / JIAYE WU')}</figcaption>
            </figure>
          </div>
          <div className="pb-four">
            <span className="mono">ONE PERSON / FOUR STATES</span>
            <div>{Object.entries(lensInfo).map(([key,l])=><SceneLink key={key} route={{view:'lens',arg:key}}><Media src={A+l.character} alt=""/><span>{l.name}</span><small aria-hidden="true">→</small></SceneLink>)}</div>
          </div>
          <div className="pb-record">
            <div><span className="mono">EXPERIENCE / SELECTED</span><h2>{text('做事的轨迹','The work so far')}</h2></div>
            <div className="pb-timeline">
              <article><time>2026</time><div><h3>{text('AI 漫剧生成系统','AI comic drama production')}</h3><p>{text('项目技术侧负责人。统筹剧本理解、角色资产与分镜生成，建立质检与恢复机制。','Technical lead, connecting script understanding, character assets and storyboard generation with quality checks and recovery.')}</p><strong>≈18% → 9.53% <small>{text('固定评测集问题率','Issue rate on a fixed evaluation set')}</small></strong></div></article>
              <article><time>2025–2026</time><div><h3>{text('短剧智能剪辑与人物身份一致性','Short-drama editing and character consistency')}</h3><p>{text('围绕跨集角色对齐与高光检索，让自动化剪辑始终咬住同一主角。','Cross-episode character alignment and highlight retrieval keep automated editing focused on the same protagonist.')}</p><strong>1285s → 24s <small>{text('10 集测试样本，身份消歧','Identity disambiguation on one 10-episode sample')}</small></strong></div></article>
              <AboutMore lang={lang} rewriteHref={href=>legacyProtoLink(href,lang,space)}/>
            </div>
          </div>
          <div className="pb-dual">
            <SceneLink className="pb-passage" route={{view:'support',arg:''}}><span className="mono">SUPPORT</span><strong>{text('支持这些工作','Support the work')}</strong><em aria-hidden="true">→</em></SceneLink>
            <SceneLink className="pb-passage" route={{view:'lens',arg:'execution'}}><span className="mono">SYSTEM IN PRACTICE</span><strong>{text('看交付与实践中的一例','See one delivery in practice')}</strong><em aria-hidden="true">→</em></SceneLink>
          </div>
        </section>}

        {route.view==='support'&&<SupportPage lang={lang} text={text}/>}

        {route.view==='story'&&<StoryPage arg={route.arg} lang={lang} text={text}/>}
      </main>

      <footer className="pb-foot">
        {(space!=='collage'&&space!=='formal')&&<><button type="button" aria-pressed={paused} onClick={togglePaused}>{paused?text('继续动态','Resume motion'):text('暂停动态','Pause motion')}</button>
        <span className="pb-hint">{text('动态自动在悬停或聚焦时停住','Motion pauses on hover or focus')}</span></>}
        <a className="pb-compare" href={(space==='collage'||space==='formal')?routeHash({view:'home'}):routePath({view:'home'},lang)}>{(space==='collage'||space==='formal')?text('回到拼贴首页 →','Back to the collage →'):text('对比现在的首页 →','Compare with the current home →')}</a>
      </footer>
    </div>
  </RoutePathContext.Provider>;
}
