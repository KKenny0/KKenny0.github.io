import React, {useEffect, useRef, useState} from 'react';
import {notes, zh as spaceZh, en as spaceEn} from '../../data/space';
import {localizedNote, prototypeText, tasteEnglish} from '../../data/space-i18n';
import {projects} from '../../data/projects';
import metrics from '../../data/collage-metrics.json';
import {tasteProducts} from '../../data/taste';
import {useCollageWall} from '../../scripts/home-collage-wall';
import {Media} from './Media';
import {createThemeController} from '../../lib/theme';
import CollageNav from './CollageNav';

const assets = '/assets/space/';
const kami = tasteProducts.find(product => product.id === 'kami-reader');
const videowipe = projects.find(project => project.slug === 'videowipe');

function ProjectMetric({repo, zh}) {
  const metric = metrics[repo];
  if (!metric || !Number.isSafeInteger(metric.stars) || !metric.fetchedAt) return null;
  return <p className="cg-metric mono">
    <span>★ {metric.stars.toLocaleString('en-US')}</span>
    <span>{zh ? '更新于' : 'Updated'} <time dateTime={metric.fetchedAt}>{metric.fetchedAt.slice(0, 10)} UTC</time></span>
  </p>;
}

function KamiMetrics({zh}) {
  const entries = [
    {metric: metrics['KKenny0/obsidian-kami'], field: 'stars', href: kami.url, label: zh ? '星标' : 'Stars'},
    {metric: metrics['kami-reader-theme-downloads'], field: 'downloads', href: 'https://community.obsidian.md/themes/kami-reader', label: zh ? '主题下载' : 'Theme downloads'},
    {metric: metrics['kami-reader-companion-downloads'], field: 'downloads', href: 'https://obsidian.md/plugins?id=kami-reader-companion', label: zh ? '插件下载' : 'Plugin downloads'}
  ].filter(({metric, field}) => metric && Number.isSafeInteger(metric[field]) && metric[field] >= 0 && metric.fetchedAt);
  if (!entries.length) return null;
  const sameDate = entries.every(({metric}) => metric.fetchedAt.slice(0, 10) === entries[0].metric.fetchedAt.slice(0, 10));
  const date = metric => <span className="cg-kami-date">{zh ? '更新于' : 'Updated'} <time dateTime={metric.fetchedAt}>{metric.fetchedAt.slice(0, 10)} UTC</time></span>;
  return <div className="cg-kami-metrics" aria-label={zh ? '项目数据快照' : 'Project metrics snapshot'}>
    <div className="cg-kami-metric-list">{entries.map(({metric, field, href, label}) => <div className="cg-kami-metric" key={href}>
      <a href={href} target="_blank" rel="noopener noreferrer"><strong>{metric[field].toLocaleString('en-US')}</strong><span>{label} ↗</span></a>
      {!sameDate && date(metric)}
    </div>)}</div>
    {sameDate && date(entries[0].metric)}
  </div>;
}

const stickers = {
  taste: {character: 'taste.webp', target: 'kotaemon', name: 'Kotaemon',
    alt: ['手绘角色：产品与创作', 'Hand-drawn character: craft'],
    line: ['「看看开源协作留下的几笔贡献。」', '“Take a look at the open-source contributions.”']},
  ai: {character: 'ai.webp', target: 'script', name: 'Script-Weaver',
    alt: ['手绘角色：项目与研究', 'Hand-drawn character: systems'],
    line: ['「从故事构想到剧本和分镜，看看 Script-Weaver。」', '“From story ideas to scripts and storyboards: meet Script-Weaver.”']}
};

function Comparison({text}) {
  const [position, setPosition] = useState(55);
  const pointer = useRef(null);
  const input = useRef(null);

  function updatePosition(event) {
    const {left, width} = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - left) / width * 100;
    setPosition(Math.round(Math.min(100, Math.max(0, percent))));
  }

  return <>
    <div className="cg-slider-stage" style={{'--cg-split': `${position}%`}}
      onPointerDown={event => {
        if (event.button !== 0 || pointer.current) return;
        const mouse = event.pointerType === 'mouse';
        event.currentTarget.setPointerCapture(event.pointerId);
        pointer.current = {id: event.pointerId, x: event.clientX, y: event.clientY, sliding: mouse};
        if (mouse) {
          event.preventDefault();
          input.current.focus({preventScroll: true});
          updatePosition(event);
        }
      }}
      onPointerMove={event => {
        const pending = pointer.current;
        if (pending?.id !== event.pointerId) return;
        const dx = Math.abs(event.clientX - pending.x);
        const dy = Math.abs(event.clientY - pending.y);
        if (dx >= 6 && dx > dy) pending.sliding = true;
        if (pending.sliding) updatePosition(event);
      }}
      onPointerUp={event => {
        const pending = pointer.current;
        if (pending?.id !== event.pointerId) return;
        if (pending.sliding || Math.hypot(event.clientX - pending.x, event.clientY - pending.y) < 6) updatePosition(event);
        pointer.current = null;
      }}
      onPointerCancel={() => { pointer.current = null; }}
      onLostPointerCapture={event => { if (pointer.current?.id === event.pointerId) pointer.current = null; }}>
      <Media src={assets + 'videowipe-before.jpg'} alt={text('处理前：画面带烧录字幕', 'Before: burned-in subtitles')}
        loading="eager" fetchPriority="high" draggable={false} sizes="(max-width: 719px) 92vw, (max-width: 1079px) 90vw, (max-width: 1460px) 62vw, 900px"/>
      <Media className="cg-slider-after" src={assets + 'videowipe-after.jpg'} alt={text('处理后：字幕被清除', 'After: subtitles removed')}
        loading="eager" draggable={false} sizes="(max-width: 719px) 92vw, (max-width: 1079px) 90vw, (max-width: 1460px) 62vw, 900px"/>
      <span className="cg-slider-divider" aria-hidden="true"><span className="cg-slider-handle"/></span>
      <span className="cg-slider-label cg-slider-label-before mono" aria-hidden="true">{text('处理前', 'Before')}</span>
      <span className="cg-slider-label cg-slider-label-after mono" aria-hidden="true">{text('处理后', 'After')}</span>
    </div>
    <div className="cg-compare-controls">
      <label className="cg-range-label" htmlFor="cg-comparison">{text('拖动或使用方向键比较', 'Drag or use arrow keys to compare')}</label>
      <input id="cg-comparison" ref={input} className="cg-slider-range" type="range" min="0" max="100" value={position}
        onChange={event => setPosition(Number(event.target.value))}
        aria-valuetext={text(`处理前 ${position}%，处理后 ${100 - position}%`, `Before ${position}%, after ${100 - position}%`)}/>
    </div>
  </>;
}

export default function HomeCollage({lang, mode = 'prototype'}) {
  const zh = lang === 'zh';
  const text = (chinese, english) => prototypeText(lang, chinese, english);
  const t = zh ? spaceZh : spaceEn;
  const sectionBase = `${zh ? '/zh' : ''}${mode === 'formal' ? '' : '/collage'}`;
  const goalNote = localizedNote(notes.find(note => note.id === 'goal'), lang);
  const compactNote = localizedNote(notes.find(note => note.id === '2031687123431051328'), lang);
  const kamiShot = kami.works[0];
  const [kamiTitle, kamiTeaser] = zh ? [kamiShot.title, kamiShot.description] : tasteEnglish[kamiShot.image];

  const [status, setStatus] = useState('');
  const [spoken, setSpoken] = useState(null);
  const [theme, setTheme] = useState('system');
  const themeController = useRef(null);
  const panel = useRef(null);
  const preview = useRef(null);
  const {wallRef, objectProps, handleProps, resetPositions} = useCollageWall();

  useEffect(() => {
    themeController.current = createThemeController(setTheme);
    return () => themeController.current?.destroy();
  }, []);
  useEffect(() => {
    if (mode === 'prototype') document.title = zh ? '拼贴墙 · Kenny Wu' : 'Collage wall · Kenny Wu';
  }, [zh, mode]);

  function handle(id, label) {
    return <button type="button" className="cg-drag" aria-label={text(`移动${label}`, `Move ${label}`)} aria-describedby="cg-arrange-hint"
      {...handleProps(id, ({x, y}, changed) => setStatus(changed
        ? text(`${label}已移动，横向 ${x}，纵向 ${y} 像素。`, `${label} moved. Horizontal ${x}, vertical ${y} pixels.`)
        : text(`${label}已到可移动边界。`, `${label} reached a movement boundary.`)))}>
      <svg className="cg-drag-pin" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M9 3h6l-.7 5 3.2 3v2h-5v7l-.5 1-.5-1v-7h-5v-2l3.2-3L9 3Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
    </button>;
  }

  function noteCard(id, note) {
    return <article className={`cg-pin cg-note cg-note-${id}`} {...objectProps(id)}>
      {handle(id, note.title)}
      <a className="cg-pin-face" href={note.url} target="_blank" rel="noopener noreferrer">
        <span className="mono cg-pin-tag">{note.date.replace('-', '.')} · {note.source}</span>
        <h3 className="cg-pin-title">{note.title}</h3>
        <p className="cg-pin-teaser">{note.teaser}</p>
        <span className="cg-pin-open">{text('阅读原文', 'Read the original')} <span aria-hidden="true">↗</span></span>
      </a>
    </article>;
  }

  function sticker(id) {
    const item = stickers[id];
    return <div className="cg-sticker" {...objectProps(id)}>
      {handle(id, text(item.alt[0], item.alt[1]))}
      <button type="button" className="cg-sticker-face" onClick={() => setSpoken(current => current === id ? null : id)}
        aria-expanded={spoken === id} aria-controls={`cg-sticker-${id}`}>
        <Media src={assets + item.character} alt={text(item.alt[0], item.alt[1])} sizes="84px"/>
      </button>
      <div className="cg-bubble" id={`cg-sticker-${id}`} hidden={spoken !== id}>
        <p>{text(...item.line)}</p>
        <a href={`#cg-${item.target}`}>{item.name} <span aria-hidden="true">↗</span></a>
      </div>
    </div>;
  }

  return <main id="main" className="collage" aria-label={text('拼贴墙', 'Collage wall')} tabIndex={-1}>
    <header className="cg-masthead">
      <div className="cg-nameplate">
        <p className="mono cg-kicker">{text('拼贴墙', 'The collage wall')}</p>
        <h1>Kenny Wu</h1>
      </div>
      <div className="cg-masthead-controls">
        <CollageNav lang={lang} mode={mode}/>
        <div className="wb-controls">
          <div className="wb-theme" role="group" aria-label={t.theme}>
            <button type="button" aria-pressed={theme === 'system'} onClick={() => themeController.current?.set('system')}>{text('跟随系统', 'System')}</button>
            <button type="button" aria-pressed={theme === 'light'} onClick={() => themeController.current?.set('light')}>{t.light}</button>
            <button type="button" aria-pressed={theme === 'dark'} onClick={() => themeController.current?.set('dark')}>{t.dark}</button>
          </div>
          <a className="wb-language" href={mode === 'formal' ? (zh ? '/' : '/zh/') : (zh ? '/collage/' : '/zh/collage/')}
            hrefLang={zh ? 'en' : 'zh-CN'} aria-label={t.language}>{zh ? 'EN' : '中'}</a>
        </div>
      </div>
    </header>

    <div className="cg-wall-tools">
      <p id="cg-arrange-hint">{text('拖动图钉或按方向键移动。按住 Shift 可加大步幅。', 'Drag a pin or use arrow keys to move it. Hold Shift for larger steps.')}</p>
      <button type="button" onClick={() => {
        resetPositions();
        setStatus(text('已恢复默认位置。', 'Default positions restored.'));
      }}>{text('重置位置', 'Reset positions')}</button>
    </div>
    <span className="cg-visually-hidden" role="status">{status}</span>

    <div className="cg-wall" id="cg-wall" ref={wallRef}>
      <article className="cg-pin cg-compare" aria-labelledby="cg-cover-title" {...objectProps('compare')}>
        {handle('compare', 'VideoWipe')}
        <div className="cg-cover-heading">
          <p className="mono cg-pin-tag">{text('封面作品', 'Cover project')}</p>
          <h2 id="cg-cover-title">VideoWipe</h2>
          <p className="cg-pin-teaser">{text(videowipe.thesisZh, videowipe.thesis)}</p>
        </div>
        <Comparison text={text}/>
        <footer className="cg-cover-footer">
          <a className="cg-cover-details" href={`${sectionBase}/work/${videowipe.slug}/`}>{text('作品详情', 'Project details')} <span aria-hidden="true">→</span></a>
          <a className="cg-repo-link" href={videowipe.url} target="_blank" rel="noopener noreferrer" aria-label={text('查看 VideoWipe 的 GitHub 仓库', 'View VideoWipe on GitHub')}>GitHub <span aria-hidden="true">↗</span></a>
          <ProjectMetric repo="KKenny0/videowipe" zh={zh}/>
        </footer>
      </article>

      <figure className="cg-pin cg-portrait" {...objectProps('portrait')}>
        {handle('portrait', text('肖像', 'portrait'))}
        <div className="cg-portrait-print">
          <span className="cg-tape" aria-hidden="true"/>
          <Media src={assets + 'self-profo.jpg'} alt={text('Kenny Wu 的肖像', 'Portrait of Kenny Wu')} sizes="(max-width: 719px) 112px, 140px"/>
        </div>
        <figcaption>
          <strong>Kenny Wu</strong>
          <span>{text('AI 工程师 · 深圳', 'AI engineer · Shenzhen')}</span>
          <p>{text('持续观察，也把想法做出来。', 'Keep noticing. Put ideas into form.')}</p>
        </figcaption>
      </figure>

      <article className="cg-pin cg-kotaemon" id="cg-kotaemon" tabIndex={-1} data-pointed={spoken === 'taste' || undefined} {...objectProps('poster')}>
        {handle('poster', 'Kotaemon')}
        <p className="mono cg-pin-tag">{text('外部开源项目 · 贡献者', 'External open source · Contributor')}</p>
        <h2 className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer"
          aria-label={text('访问 Cinnamon 的 Kotaemon 上游仓库', 'Visit Cinnamon’s upstream Kotaemon repository')}>Kotaemon <span aria-hidden="true">↗</span></a></h2>
        <p className="cg-pin-teaser">{text('我提交的已合并 PR', 'My merged pull requests')}</p>
        <ul className="cg-contributions">
          <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer"><span className="mono">#287</span> {text('TEI 嵌入服务与重排序模型配置', 'TEI embeddings and configurable reranking')}</a></li>
          <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer"><span className="mono">#341</span> {text('关联对话的聊天建议', 'Conversation-aware chat suggestions')}</a></li>
          <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer"><span className="mono">#461</span> {text('引用结果可视化', 'Citation result visualization')}</a></li>
        </ul>
        <ProjectMetric repo="Cinnamon/kotaemon" zh={zh}/>
      </article>

      <article className="cg-pin cg-art-kami" {...objectProps('kami')}>
        {handle('kami', 'Kami Reader')}
        <h2 className="cg-pin-title">Kami Reader</h2>
        <button type="button" ref={preview} className="cg-pin-face" onClick={() => panel.current.showModal()} aria-haspopup="dialog"
          aria-label={text('预览界面：Kami Reader', 'Preview interface for Kami Reader')}>
          <Media src={assets + kamiShot.image} alt={kamiTitle} sizes="(max-width: 719px) 92vw, (max-width: 1079px) 45vw, 460px"/>
          <span className="cg-pin-open">{text('预览界面', 'Preview interface')} <span aria-hidden="true">⤢</span></span>
        </button>
        <a className="cg-repo-link" href={kami.url} target="_blank" rel="noopener noreferrer" aria-label={text('查看 Kami Reader 的 GitHub 仓库', 'View Kami Reader on GitHub')}>{text('查看 GitHub', 'View GitHub')} <span aria-hidden="true">↗</span></a>
        <KamiMetrics zh={zh}/>
      </article>

      <article className="cg-pin cg-replay" id="cg-script" tabIndex={-1} data-pointed={spoken === 'ai' || undefined} {...objectProps('replay')}>
        {handle('replay', 'Script-Weaver')}
        <h2 className="cg-pin-title"><a className="cg-repo-link" href="https://github.com/KKenny0/script-weaver" target="_blank" rel="noopener noreferrer"
          aria-label={text('访问 Script-Weaver 的 GitHub 仓库', 'Visit the Script-Weaver GitHub repository')}>Script-Weaver <span aria-hidden="true">↗</span></a></h2>
        <p className="cg-pin-teaser">{text('从故事构想出发，组织大纲、角色、场景、剧本与分镜。提供 Web 工作台与命令行界面。', 'Develop story ideas into outlines, characters, scenes, screenplays and storyboards in a web workbench or on the command line.')}</p>
        <ProjectMetric repo="KKenny0/script-weaver" zh={zh}/>
      </article>

      <h2 className="cg-discovery-title">{text('观察与写作', 'Observations & writing')}</h2>
      {noteCard('goal', goalNote)}
      {noteCard('compact', compactNote)}
      {sticker('taste')}
      {sticker('ai')}
    </div>

    <dialog className="cg-focus-panel" ref={panel} aria-labelledby="cg-focus-title" onClose={() => preview.current?.focus()}
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="cg-focus-body">
        <button type="button" className="cg-close" autoFocus onClick={() => panel.current.close()}>{text('关闭预览', 'Close preview')} <span aria-hidden="true">×</span></button>
        <p className="mono cg-pin-tag">Kami Reader</p>
        <h2 id="cg-focus-title">{kamiTitle}</h2>
        <figure className="cg-focus-art"><Media src={assets + kamiShot.image} alt={kamiTitle} sizes="(max-width: 799px) 90vw, 680px"/></figure>
        <p>{kamiTeaser}</p>
        <a className="cg-repo-link" href={kami.url} target="_blank" rel="noopener noreferrer">{text('查看 GitHub', 'View GitHub')} <span aria-hidden="true">↗</span></a>
      </div>
    </dialog>
  </main>;
}
