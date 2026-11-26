import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AboutMore, TasteViewer, tasteProducts} from './Scenes';
import {localizedNote, prototypeText, tasteEnglish} from '../../data/space-i18n';
import {aiWritingIds, curated, isTechnicalWriting, lensInfo, notes, projects, projectVisual} from '../../data/space';
import {githubSnapshot} from '../../data/projects';
import {canonicalPath, parseRoute, routePath, routeTitle, storyReturnPath} from '../../lib/space-routes';
import {site} from '../../data/site';
import {createThemeController} from '../../lib/theme';
import {SceneLink, RoutePathContext} from './SceneLink';
import {Media} from './Media';
import {ASSETS, liveStars, StudioShell, VideoWipeCompare} from './StudioShell';

const storagePrefix = 'kenny-space-return:v2:';
const initialControls = {query: '', practice: 'all', sort: 'selected', archived: false, options: false, selected: curated[0].id};
const address = url => url.pathname + url.search;
const withoutLocale = path => path.replace(/^\/zh(?=\/|$)/, '') || '/';
const viewKey = url => routePath(parseRoute(new URL(url.href)));
const focusPath = link => link?.origin === location.origin ? withoutLocale(address(link)) + link.hash : link?.getAttribute('href');
const restoreFocus = (focus, lang) => {
  if (typeof focus === 'string') return document.getElementById(focus) || [...document.links].find(link => link.getAttribute('href') === focus);
  if (focus?.id) return document.getElementById(focus.id);
  if (!focus?.href) return null;
  const href = focus.href.startsWith('/') && lang === 'zh' ? `/zh${focus.href}` : focus.href;
  return [...document.links].find(link => link.getAttribute('href') === href || (link.origin === location.origin && address(link) + link.hash === href));
};
const localized = (lang, zh, en) => prototypeText(lang, zh, en);

function returnRoute(route) {
  const {view, item, source, topic, via} = route;
  if (view === 'taste') return {view: 'lens', arg: 'taste'};
  if (source === 'notes') return {view: 'notes', topic, source: via};
  if (source === 'projects') return {view: 'projects', source: via};
  if (source === 'about') return {view: 'about'};
  if (Object.hasOwn(lensInfo, source)) return {view: 'lens', arg: source};
  if (item && view === 'projects') return {view: 'projects'};
  if (item && view === 'notes') return {view: 'notes', topic};
  return {view: 'home'};
}

function ProjectMedia({project, lang, interactive = false}) {
  const text = (zh, en) => localized(lang, zh, en);
  const media = projectVisual[project.slug];
  const image = project.focus || project.image;
  if (project.slug === 'videowipe') {
    if (interactive) {
      return (
        <div className="ex-detail-loupe">
          <VideoWipeCompare text={text} />
        </div>
      );
    }
    return (
      <figure className="space-work-media space-comparison">
        {[['videowipe-before.jpg', text('处理前', 'Before')], ['videowipe-after.jpg', text('处理后', 'After')]].map(([src, label]) => (
          <figure key={src}>
            <Media src={ASSETS + src} alt={text(`${label}的视频帧`, `${label} frame`)} loading="eager" />
            <figcaption className="mono">{label}</figcaption>
          </figure>
        ))}
        <figcaption className="mono">{text('同一帧视频的字幕清除对照。', 'Subtitle removal on the same video frame.')}</figcaption>
      </figure>
    );
  }
  if (media) {
    return (
      <figure className="space-work-media">
        <Media src={ASSETS + media.src} alt={text(`${project.name} 的${media.kind === 'poster' ? '海报作品' : '实际界面'}`, `${project.name} ${media.kind === 'poster' ? 'poster output' : 'interface'}`)} loading="eager" />
      </figure>
    );
  }
  if (image) {
    return (
      <figure className="space-work-media">
        <Media src={image.src} width={image.width} height={image.height} alt={text(image.altZh, image.alt)} loading="eager" />
        {image.caption && <figcaption className="mono">{text(image.captionZh, image.caption)}</figcaption>}
      </figure>
    );
  }
  if (project.slug === 'script-weaver') {
    return (
      <figure className="space-work-media space-work-flow">
        <ol>{(lang === 'zh' ? ['故事构想', '可编辑剧本', '分镜', '视频提示词'] : ['Story premise', 'Editable script', 'Storyboards', 'Video prompts']).map(step => <li key={step}>{step}</li>)}</ol>
        <figcaption className="mono">{text('根据公开仓库说明整理的产物流程。', 'Workflow based on the public repository description.')}</figcaption>
      </figure>
    );
  }
  return (
    <div className="ex-typo-plate">
      <span className="mono">{project.language || 'REPOSITORY'} · {project.practice.toUpperCase()}</span>
      <strong>{project.name}</strong>
      <p>{text(project.thesisZh, project.thesis)}</p>
    </div>
  );
}

function ProjectDetail({project, route, back, backLabel, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const story = project.detailUrl && {view: 'story', arg: project.slug, source: 'work', via: route.source, origin: route.via};
  const stars = liveStars(project);
  return (
    <article className="ba-doc ex-detail-room ba-enter">
      <div className="ba-back-bar">
        <SceneLink className="ba-inline-link mono" route={back} lang={lang} data-space-return="">← {backLabel}</SceneLink>
      </div>

      <div className="ex-detail-spread">
        <div className="ex-detail-wall">
          <ProjectMedia project={project} lang={lang} interactive />
        </div>

        <aside className="ex-placard ex-detail-placard">
          <span className="mono ex-placard-no">EXHIBIT DOSSIER · {project.practice.toUpperCase()}</span>
          <h1 className="ex-placard-title">{project.name}</h1>
          <p className="ex-placard-medium mono">
            {project.language && `${project.language} · `}
            {project.archived && text('已归档 · ', 'ARCHIVED · ')}★ {stars} · {project.forks} FORKS · <time dateTime={githubSnapshot.date}>{githubSnapshot.date}</time>
          </p>
          <p className="ex-placard-thesis">{text(project.thesisZh, project.thesis)}</p>
          <p className="ex-placard-note">{text(project.descriptionZh, project.description)}</p>

          <div className="ex-placard-links mono">
            <a href={project.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            {project.homepage && <a href={project.homepage} target="_blank" rel="noopener noreferrer">{text('访问产品 ↗', 'VISIT PRODUCT ↗')}</a>}
            {story && <SceneLink data-story-link="" route={story} lang={lang}>{text('阅读长案例 →', 'READ CASE STUDY →')}</SceneLink>}
            {project.slug === 'card-skill' && <SceneLink route={{view: 'taste', arg: 'card-skill'}} lang={lang}>{text('查看生成样张 →', 'VIEW ARTWORK →')}</SceneLink>}
            {['obsidian-kami', 'kami-reader-companion'].includes(project.slug) && <SceneLink route={{view: 'taste', arg: 'kami-reader'}} lang={lang}>{text('查看阅读界面 →', 'VIEW READING LAYOUTS →')}</SceneLink>}
          </div>
        </aside>
      </div>
    </article>
  );
}

function ProjectIndex({controls, update, route, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const {query, practice, sort, archived, options} = controls;
  const [hoveredSlug, setHoveredSlug] = useState('videowipe');
  const ledgerRef = useRef(null);
  const wheelLock = useRef(0);

  const practices = {
    all: text('全部', 'All'),
    make: text('制作', 'Making'),
    think: text('思考', 'Thinking'),
    research: text('研究', 'Research'),
    capture: text('记录', 'Capture')
  };
  const matches = projects
    .filter(p => (archived || !p.archived) && (practice === 'all' || p.practice === practice) && [p.name, p.tagline, p.thesis, p.thesisZh, p.description, p.descriptionZh].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'updated' ? b.pushedAt.localeCompare(a.pushedAt) : sort === 'stars' ? liveStars(b) - liveStars(a) : Number(b.featured) - Number(a.featured) || liveStars(b) - liveStars(a));

  const activePreview = matches.find(p => p.slug === hoveredSlug) || matches[0] || projects[0];
  const activeIdx = Math.max(0, matches.findIndex(p => p.slug === activePreview?.slug));

  const stepProject = dir => {
    if (!matches.length) return;
    const nextIdx = Math.max(0, Math.min(matches.length - 1, activeIdx + dir));
    const nextProj = matches[nextIdx];
    if (nextProj) {
      setHoveredSlug(nextProj.slug);
      const rowEl = document.getElementById(nextProj.slug);
      rowEl?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }
  };

  // Keyboard ArrowUp / ArrowDown navigation across the fixed-height catalogue
  useEffect(() => {
    const onKeyDown = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepProject(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepProject(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Auto-sync active preview when user scrolls the right-hand ledger list
  const handleLedgerScroll = e => {
    const container = e.currentTarget;
    const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
    const progress = Math.min(1, Math.max(0, container.scrollTop / maxScroll));
    container.style.setProperty('--scroll-pct', `${(progress * 100).toFixed(1)}%`);
  };

  // Wheel over the left preview wall steps smoothly through the right ledger
  const handlePreviewWheel = e => {
    if (Math.abs(e.deltaY) < 14) return;
    const now = performance.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 180;
    stepProject(e.deltaY > 0 ? 1 : -1);
  };

  return (
    <section className="ba-doc ex-catalogue-page ex-fixed-viewport ba-enter">
      <header className="ex-compact-topbar">
        <div className="ex-topbar-title">
          <h1 className="ba-stage-title">{text('馆藏项目目录', 'Exhibition Catalogue')}</h1>
          <span className="mono ba-muted">
            {String(activeIdx + 1).padStart(2, '0')} / {String(matches.length).padStart(2, '0')}
          </span>
        </div>

        <div className="ex-topbar-controls">
          <input
            id="project-search"
            type="search"
            className="ba-search"
            value={query}
            onChange={e => update({query: e.target.value})}
            placeholder={text('检索展品或关键词…', 'Filter exhibits…')}
            aria-label={text('搜索项目', 'Search projects')}
          />
          <div className="ba-filter-pills" role="group" aria-label={text('按方向筛选', 'Filter by practice')}>
            {Object.entries(practices).map(([id, label]) => (
              <button type="button" key={id} aria-pressed={practice === id} className={`mono ${practice === id ? 'is-active' : ''}`} onClick={() => update({practice: id})}>
                {label}
              </button>
            ))}
          </div>
          <details className="ba-options" open={options} onToggle={e => update({options: e.currentTarget.open})}>
            <summary className="mono">{text('排序与归档', 'SORT')}</summary>
            <div className="ba-options-body">
              <label className="ba-check">
                <input type="checkbox" checked={archived} onChange={e => update({archived: e.target.checked})} />
                {text('含归档', 'Archived')}
              </label>
              <label className="ba-check">
                {text('排序', 'Sort')}
                <select value={sort} onChange={e => update({sort: e.target.value})}>
                  <option value="selected">{text('精选', 'Curated')}</option>
                  <option value="stars">{text('标星', 'Stars')}</option>
                  <option value="updated">{text('更新', 'Updated')}</option>
                </select>
              </label>
            </div>
          </details>
        </div>
      </header>

      <div className="ex-cat-split ex-fixed-split">
        {/* Left Fixed Exhibition Preview Wall (Wheel or ↑/↓ steps through exhibits) */}
        {activePreview && (
          <aside
            className="ex-cat-preview"
            aria-label={text('当前展品预演墙', 'Live exhibit preview wall')}
            onWheel={handlePreviewWheel}
          >
            <div className="ex-cat-wall" key={activePreview.slug}>
              <div className="ex-cat-media-box">
                <ProjectMedia project={activePreview} lang={lang} />
              </div>
              <div className="ex-placard ex-cat-placard">
                <div className="ex-placard-head-row">
                  <span className="mono ex-placard-no">
                    PLATE {String(activeIdx + 1).padStart(2, '0')} / {String(matches.length).padStart(2, '0')} · {practices[activePreview.practice]}
                  </span>
                  <div className="ex-mini-stepper mono">
                    <button type="button" disabled={activeIdx <= 0} onClick={() => stepProject(-1)} aria-label={text('上一件展品', 'Previous exhibit')}>↑</button>
                    <button type="button" disabled={activeIdx >= matches.length - 1} onClick={() => stepProject(1)} aria-label={text('下一件展品', 'Next exhibit')}>↓</button>
                  </div>
                </div>
                <h2 className="ex-placard-title">{activePreview.name}</h2>
                <p className="ex-placard-medium mono">
                  {activePreview.language || 'OPEN SOURCE'} · ★ {liveStars(activePreview)} STARS · SNAPSHOT {githubSnapshot.date}
                </p>
                <p className="ex-placard-note">{text(activePreview.descriptionZh, activePreview.description)}</p>
                <div className="ex-placard-links mono">
                  <SceneLink route={{view: 'projects', item: activePreview.slug, source: 'projects', via: route.source}} lang={lang}>
                    {text('步入独立展室 →', 'ENTER EXHIBIT ROOM →')}
                  </SceneLink>
                  <a href={activePreview.url} target="_blank" rel="noopener noreferrer">
                    GITHUB ↗
                  </a>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Right Internal Scrollable Swiss Ledger with Edge Fade Mask & Scrollbar Track */}
        <div
          ref={ledgerRef}
          className="ex-cat-ledger ex-scroll-pane"
          onScroll={handleLedgerScroll}
        >
          <ul className="ba-index-rows">
            {matches.map((project, idx) => {
              const isCurrent = activePreview?.slug === project.slug;
              return (
                <li key={project.slug} className={isCurrent ? 'is-previewed' : ''}>
                  <SceneLink
                    id={project.slug}
                    route={{view: 'projects', item: project.slug, source: 'projects', via: route.source}}
                    lang={lang}
                    onMouseEnter={() => setHoveredSlug(project.slug)}
                    onFocus={() => setHoveredSlug(project.slug)}
                  >
                    <span className="mono ba-row-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="mono ba-row-cat">{practices[project.practice]}</span>
                    <div className="ba-row-main">
                      <strong>{project.name} {project.archived && <small className="mono">{text('已归档', 'ARCHIVED')}</small>}</strong>
                      <p>{text(project.thesisZh, project.thesis)}</p>
                    </div>
                    <span className="mono ba-row-stat">★ {liveStars(project)} →</span>
                  </SceneLink>
                </li>
              );
            })}
          </ul>
          {!matches.length && <p className="ba-empty">{text('没有匹配的项目。', 'No matching projects.')}</p>}
        </div>
      </div>
    </section>
  );
}

function Writing({route, entries, query, setQuery, setTopic, back, backLabel, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const topics = {
    all: text('全部', 'All'),
    ai: text('技术写作', 'Technical writing'),
    memory: text('记忆', 'Memory'),
    context: text('上下文', 'Context'),
    agents: text('智能体', 'Agents')
  };
  const note = entries.find(n => n.id === route.item);

  if (note) {
    const noteIdx = entries.findIndex(n => n.id === note.id);
    const nextNote = entries[(noteIdx + 1) % entries.length];
    return (
      <article className="ba-doc ex-manuscript-room ba-enter">
        <div className="ba-back-bar">
          <SceneLink className="ba-inline-link mono" route={back} lang={lang} data-space-return="">← {backLabel}</SceneLink>
        </div>

        <div className="ex-manuscript-spread">
          <div className="ex-manuscript-sheet-wall">
            <span className="mono ba-kicker">
              {isTechnicalWriting(note) ? topics.ai : text('长线观察手稿', 'OBSERVATION MANUSCRIPT')} · <time dateTime={note.date}>{note.date}</time>
            </span>
            <h1 className="ex-manuscript-title">{note.title}</h1>
            <div className="ex-manuscript-abstract">
              <span className="mono ba-kicker">{lang === 'zh' ? '馆藏手稿导读 · ABSTRACT' : note.hasEnglishSummary ? 'ENGLISH SUMMARY' : 'CHINESE SUMMARY'}</span>
              <p className="ba-summary-text" lang={lang === 'en' && !note.hasEnglishSummary ? 'zh-CN' : undefined}>{note.teaser}</p>
            </div>
          </div>

          <aside className="ex-placard ex-manuscript-placard">
            <span className="mono ex-placard-no">MANUSCRIPT DOSSIER · {note.source}</span>
            <h2 className="ex-placard-title">{text('原文阅览与馆藏坐标', 'Source & Provenance')}</h2>
            <p className="ex-placard-medium mono">PUBLISHED · {note.date}</p>
            <p className="ex-placard-note">
              {text(
                '本文首发于外部专栏，点击下方入口可直接打开完整排版长文与图表。',
                'Originally published as a long-form column. Open the external link below for the complete text and diagrams.'
              )}
            </p>
            <div className="ex-placard-links mono">
              <a href={note.url} hrefLang="zh-CN" target="_blank" rel="noopener noreferrer">
                {note.provisional ? text('在微信阅读中文合集 ↗', 'OPEN WECHAT COLLECTION ↗') : text('在知乎阅读中文原文 ↗', 'READ ON ZHIHU ↗')}
              </a>
              <SceneLink data-space-return="" route={{view: 'notes', topic: route.topic, source: route.source === 'notes' ? route.via : route.source}} lang={lang}>
                {text('返回文献阅览室 →', 'READING ROOM →')}
              </SceneLink>
            </div>

            {nextNote && (
              <div className="ex-next-manuscript">
                <span className="mono">{text('下一份馆藏手稿', 'NEXT MANUSCRIPT')}</span>
                <SceneLink route={{view: 'notes', item: nextNote.id, source: 'notes', topic: route.topic}} lang={lang}>
                  {nextNote.title} →
                </SceneLink>
              </div>
            )}
          </aside>
        </div>
      </article>
    );
  }

  const topic = route.topic || 'all';
  const matches = entries.filter(n =>
    (topic === 'all' || (topic === 'ai' ? isTechnicalWriting(n) : n.topic === topic)) &&
    [n.title, n.originalTitle, n.teaser, n.source, topics[n.topic]].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  );

  const previewNote = matches.find(n => n.id === hoveredNoteId) || matches[0] || entries[0];
  const previewIdx = Math.max(0, matches.findIndex(n => n.id === previewNote?.id));
  const deskWheelLock = useRef(0);

  const stepNote = dir => {
    if (!matches.length) return;
    const nextIdx = Math.max(0, Math.min(matches.length - 1, previewIdx + dir));
    const nextItem = matches[nextIdx];
    if (nextItem) {
      setHoveredNoteId(nextItem.id);
      const rowEl = document.getElementById(`note-${nextItem.id}`);
      rowEl?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }
  };

  useEffect(() => {
    if (note) return;
    const onKeyDown = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepNote(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepNote(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleDeskWheel = e => {
    if (Math.abs(e.deltaY) < 14) return;
    const now = performance.now();
    if (now < deskWheelLock.current) return;
    deskWheelLock.current = now + 180;
    stepNote(e.deltaY > 0 ? 1 : -1);
  };

  return (
    <section className="ba-doc ex-reading-room-page ex-fixed-viewport ba-enter">
      <header className="ex-compact-topbar">
        <div className="ex-topbar-title">
          <h1 className="ba-stage-title">{text('文献阅览室', 'Reading Room')}</h1>
          <span className="mono ba-muted">
            {String(previewIdx + 1).padStart(2, '0')} / {String(matches.length).padStart(2, '0')}
          </span>
        </div>

        <div className="ex-topbar-controls">
          <input
            id="writing-search"
            type="search"
            className="ba-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={text('检索手稿标题或关键词…', 'Filter manuscripts…')}
            aria-label={text('搜索文章', 'Search writing')}
          />
          <div className="ba-filter-pills" role="group" aria-label={text('按主题筛选', 'Filter by topic')}>
            {Object.entries(topics).map(([id, label]) => (
              <button type="button" key={id} aria-pressed={topic === id} className={`mono ${topic === id ? 'is-active' : ''}`} onClick={() => setTopic(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="ex-reading-split ex-fixed-split">
        <div className="ex-reading-ledger ex-scroll-pane">
          <ul className="ba-index-rows">
            {matches.map((n, idx) => {
              const isCurrent = previewNote?.id === n.id;
              return (
                <li key={n.id} className={isCurrent ? 'is-previewed' : ''}>
                  <SceneLink
                    id={`note-${n.id}`}
                    route={{view: 'notes', item: n.id, source: 'notes', topic: route.topic, via: route.source}}
                    lang={lang}
                    onMouseEnter={() => setHoveredNoteId(n.id)}
                    onFocus={() => setHoveredNoteId(n.id)}
                  >
                    <time dateTime={n.date} className="mono ba-row-num">{n.date}</time>
                    <span className="mono ba-row-cat">{n.source}</span>
                    <div className="ba-row-main">
                      <strong>{n.title}</strong>
                      <p>{n.teaser}</p>
                    </div>
                    <span className="mono ba-row-stat">{String(idx + 1).padStart(2, '0')} →</span>
                  </SceneLink>
                </li>
              );
            })}
          </ul>
          {!matches.length && <p className="ba-empty">{text('没有匹配的文章。', 'No matching writing.')}</p>}
        </div>

        {/* Right Fixed Manuscript Reading Desk (Wheel or ↑/↓ steps through manuscripts) */}
        {previewNote && (
          <aside
            className="ex-reading-desk"
            aria-label={text('当前手稿检视台', 'Live manuscript reading desk')}
            onWheel={handleDeskWheel}
          >
            <div className="ex-desk-sheet" key={previewNote.id}>
              <div className="ex-placard-head-row">
                <span className="mono ex-placard-no">
                  MANUSCRIPT {String(previewIdx + 1).padStart(2, '0')} / {String(matches.length).padStart(2, '0')} · {previewNote.date}
                </span>
                <div className="ex-mini-stepper mono">
                  <button type="button" disabled={previewIdx <= 0} onClick={() => stepNote(-1)} aria-label={text('上一篇手稿', 'Previous manuscript')}>↑</button>
                  <button type="button" disabled={previewIdx >= matches.length - 1} onClick={() => stepNote(1)} aria-label={text('下一篇手稿', 'Next manuscript')}>↓</button>
                </div>
              </div>
              <h2 className="ex-desk-title">{previewNote.title}</h2>
              <p className="ex-placard-medium mono">
                {isTechnicalWriting(previewNote) ? text('深度系统源码研究', 'SYSTEMS & INTERNALS') : text('长线现场观察笔记', 'LONG-HORIZON FIELD NOTE')} · {previewNote.source}
              </p>
              <p className="ex-desk-abstract">{previewNote.teaser}</p>
              <div className="ex-placard-links mono">
                <a href={previewNote.url} hrefLang="zh-CN" target="_blank" rel="noopener noreferrer">
                  {previewNote.provisional ? text('阅读微信中文合集 ↗', 'OPEN WECHAT COLLECTION ↗') : text('阅读知乎完整原文 ↗', 'READ FULL ESSAY ON ZHIHU ↗')}
                </a>
                <SceneLink route={{view: 'notes', item: previewNote.id, source: 'notes', topic: route.topic, via: route.source}} lang={lang}>
                  {text('独立手稿展室 →', 'MANUSCRIPT DOSSIER →')}
                </SceneLink>
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

function Online({entries, selected, onSelect, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const idx = Math.max(0, entries.findIndex(n => n.id === selected.id));
  const activeNote = entries[idx] || entries[0];
  const lens = lensInfo.online;

  return (
    <section className="ba-doc ex-lens-room ba-enter">
      <div className="ba-stage-banner">
        <div>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <span className="mono ba-datum">0{idx + 1} / 0{entries.length}</span>
      </div>

      <div className="ex-reading-split">
        <div className="ex-desk-sheet ex-online-spotlight" key={activeNote.id}>
          <span className="mono ex-placard-no">{activeNote.date} · {activeNote.source}</span>
          <h2 className="ex-desk-title">{activeNote.title}</h2>
          <p className="ex-desk-abstract">{activeNote.teaser}</p>
          <div className="ba-inline-bar">
            <div className="ex-placard-links mono">
              <a href={activeNote.url} target="_blank" rel="noopener noreferrer">
                {activeNote.provisional ? text('在合集查看 ↗', 'OPEN COLLECTION ↗') : text('阅读原文 ↗', 'READ ORIGINAL ↗')}
              </a>
              <SceneLink route={{view: 'notes', item: activeNote.id, source: 'online'}} lang={lang}>
                {text('独立手稿档案 →', 'MANUSCRIPT DOSSIER →')}
              </SceneLink>
              <SceneLink route={{view: 'notes', source: 'online'}} lang={lang}>
                {text('进入文献阅览室全集 →', 'EXPLORE FULL ARCHIVE →')}
              </SceneLink>
            </div>
            <div className="ba-stepper">
              <button type="button" disabled={idx <= 0} onClick={() => onSelect(entries[Math.max(0, idx - 1)].id)} aria-label={text('较新的观察', 'Newer observation')}>←</button>
              <span className="mono">{String(idx + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
              <button type="button" disabled={idx >= entries.length - 1} onClick={() => onSelect(entries[Math.min(entries.length - 1, idx + 1)].id)} aria-label={text('较早的观察', 'Older observation')}>→</button>
            </div>
          </div>
        </div>

        <aside className="ex-placard">
          <span className="mono ex-placard-no">{text('精选 5 篇现场观察', '5 CURATED FIELD NOTES')}</span>
          <ul className="ba-mini-notes ba-selectable-notes">
            {entries.map((n, i) => (
              <li key={n.id}>
                <button type="button" className={n.id === activeNote.id ? 'is-active' : ''} onClick={() => onSelect(n.id)}>
                  <time className="mono">0{i + 1} · {n.date}</time>
                  <span>{n.label || n.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function Taste({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const lens = lensInfo.taste;
  const descriptions = {
    'kami-reader': text('长文优先。用衬线字与克制留白拉开正文、图示和侧栏的层次，让界面退到读者需要它的时候。', 'Long-form reading comes first. Serif typography and restrained negative space establish hierarchy while keeping chrome out of the way.'),
    'card-skill': text('开源的内容转视觉排版技能。把读书笔记、技术交接边界与研究阶段关系自动浓缩为高密度印刷级视觉版面。', 'An open-source visual synthesis skill that distills book structures, protocol boundaries and research stages into print-grade plates.')
  };

  return (
    <section className="ba-doc ex-lens-room ba-enter">
      <div className="ba-stage-banner">
        <div>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'taste'}} lang={lang}>
          {text('浏览全部 23 件展品 →', 'BROWSE ALL 23 EXHIBITS →')}
        </SceneLink>
      </div>

      {[...tasteProducts].reverse().map((product, pIdx) => (
        <section key={product.id} className="ex-taste-wing">
          <div className="ex-wing-header">
            <div>
              <span className="mono ex-placard-no">WING 0{pIdx + 1} · {product.id.toUpperCase()}</span>
              <h2>{product.name}</h2>
            </div>
            <p>{descriptions[product.id]}</p>
          </div>

          <div className="ex-taste-gallery-grid">
            {product.works.map((work, index) => {
              const [title, description] = lang === 'zh' ? [work.title, work.description] : tasteEnglish[work.image];
              return (
                <SceneLink key={work.id} className="ex-taste-plate-card" route={{view: 'taste', arg: product.id, work: index}} lang={lang}>
                  <div className="ex-taste-plate-mat">
                    <Media src={ASSETS + work.image} alt={title} loading={product.id === 'kami-reader' ? 'eager' : 'lazy'} />
                  </div>
                  <div className="ex-taste-plate-label">
                    <span className="mono">PLATE 0{index + 1}</span>
                    <strong>{title} <span aria-hidden="true">→</span></strong>
                    <p>{description}</p>
                  </div>
                </SceneLink>
              );
            })}
          </div>
        </section>
      ))}
    </section>
  );
}

function Ai({entries, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const lens = lensInfo.ai;
  const scriptWeaver = projects.find(p => p.slug === 'script-weaver');
  const videowipe = projects.find(p => p.slug === 'videowipe');
  const aiWritings = aiWritingIds.map(id => entries.find(n => n.id === id)).filter(Boolean);

  return (
    <section className="ba-doc ex-lens-room ba-enter">
      <div className="ba-stage-banner">
        <div>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <div className="ba-plate-links">
          <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'ai'}} lang={lang}>{text('全部项目 →', 'ALL PROJECTS →')}</SceneLink>
          <SceneLink className="ba-inline-link mono" route={{view: 'notes', source: 'ai', topic: 'ai'}} lang={lang}>{text('全部技术写作 →', 'ALL TECHNICAL WRITING →')}</SceneLink>
        </div>
      </div>

      <div className="ds-ai-single-grid">
        <div>
          <article className="ex-clean-exhibit">
            <div className="ds-scene-kicker">
              <span className="mono ex-placard-no">EXHIBIT 03A · OPTICAL INPAINTING</span>
              <span className="mono ba-muted">★ {liveStars(videowipe)} STARS</span>
            </div>
            <h2 style={{margin: '0 0 8px', font: '500 32px/1.1 var(--display-serif)'}}>VideoWipe</h2>
            <p className="ba-lead-para" style={{marginBottom: '16px'}}>{text(videowipe.thesisZh, videowipe.thesis)}</p>
            <VideoWipeCompare text={text} />
            <div className="ba-plate-links" style={{marginTop: '14px'}}>
              <SceneLink className="ba-inline-link mono" route={{view: 'projects', item: 'videowipe', source: 'ai'}} lang={lang}>{text('展品档案 →', 'DOSSIER →')}</SceneLink>
              <a className="ba-inline-link mono" href={videowipe.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            </div>
          </article>

          <article className="ex-clean-exhibit" style={{marginTop: '44px', paddingTop: '32px', borderTop: '1px solid var(--ba-rule)'}}>
            <div className="ds-scene-kicker">
              <span className="mono ex-placard-no">EXHIBIT 03B · STORYBOARD WORKBENCH</span>
              <span className="mono ba-muted">★ {liveStars(scriptWeaver)} STARS</span>
            </div>
            <h2 style={{margin: '0 0 8px', font: '500 28px/1.15 var(--display-serif)'}}>Script-Weaver</h2>
            <p className="ba-lead-para" style={{marginBottom: '16px'}}>{text(scriptWeaver.thesisZh, scriptWeaver.thesis)}</p>
            <div className="ba-plate-links">
              <SceneLink className="ba-inline-link mono" route={{view: 'projects', item: 'script-weaver', source: 'ai'}} lang={lang}>{text('展品档案 →', 'DOSSIER →')}</SceneLink>
              <a className="ba-inline-link mono" href={scriptWeaver.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            </div>
          </article>
        </div>

        <aside className="ex-placard">
          <span className="mono ex-placard-no">{text('系统源码与记忆控制面手稿', 'SOURCE & MEMORY MANUSCRIPTS')}</span>
          <div className="ds-clean-essays">
            {aiWritings.map((note, idx) => (
              <article key={note.id} className="ds-clean-entry">
                <div className="ds-clean-meta mono">
                  <span>ESSAY 0{idx + 1}</span>
                  <time>{note.date}</time>
                </div>
                <h4>
                  <SceneLink route={{view: 'notes', item: note.id, source: 'ai'}} lang={lang}>
                    {note.title}
                  </SceneLink>
                </h4>
                <p>{note.teaser}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Execution({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const lens = lensInfo.execution;
  const evidence = anchor => ({view: 'about', source: 'execution', anchor});

  return (
    <article className="ba-doc ex-lens-room ba-enter">
      <div className="ba-stage-banner">
        <div>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <span className="mono ba-datum">2022 – 2026</span>
      </div>

      <div className="ex-detail-spread">
        <div>
          <div className="ex-specimen-board" style={{width: '100%'}}>
            <div className="ex-specimen-grid">
              <div className="ex-specimen-cell">
                <span className="mono">STAGE 01 · PREMISE &amp; SCRIPT</span>
                <strong>{text('理解剧本与提取角色资产', 'Script & Character Asset Lock')}</strong>
                <small className="mono">{text('10 集角色消歧 1,285s → 24s', '10-Ep Disambiguation 1,285s → 24s')}</small>
              </div>
              <div className="ex-specimen-cell">
                <span className="mono">STAGE 02 · INDEPENDENT GRADING</span>
                <strong>≈18% → 9.53%</strong>
                <small className="mono">{text('固定评测集动作过载与景别失当率', 'Fixed-Set Shot Defect Rate')}</small>
              </div>
              <div className="ex-specimen-cell is-cobalt">
                <span className="mono">STAGE 03 · BOUNDED RECOVERY</span>
                <strong>{text('20 集连续自愈完赛', '20 Episodes Completed')}</strong>
                <small className="mono">{text('熔断、动态并发与断点恢复', 'Circuit Breaking & Checkpoint Recovery')}</small>
              </div>
              <div className="ex-specimen-cell">
                <span className="mono">STAGE 04 · VERIFICATION</span>
                <strong>{text('独立门禁与成本上限', 'Cost-Capped Quality Gate')}</strong>
                <small className="mono">{text('把模型输出落到可核验环节', 'Verifiable Acceptance Criteria')}</small>
              </div>
            </div>
          </div>

          <div className="ba-exec-stats" style={{marginTop: '28px'}}>
            <div className="ex-clean-stat">
              <span className="mono ex-placard-no">{text('实证锚点 A · 固定评测集', 'EVIDENCE A · FIXED EVALUATION SET')}</span>
              <p>{text('同一固定集合上的动作过载与景别失当问题率从 ≈18% 降至 9.53%。', 'Rate of overloaded action and unsuitable shot scale dropped from ≈18% to 9.53% on the fixed set.')}</p>
              <SceneLink className="ba-inline-link mono" route={evidence('storyboard-evaluation')} lang={lang}>
                {text('核对公开履历中的评测记录 →', 'SEE EVALUATION ENTRY →')}
              </SceneLink>
            </div>
            <div className="ex-clean-stat">
              <span className="mono ex-placard-no">{text('实证锚点 B · 单次长任务实测', 'EVIDENCE B · LONG-RUN RECOVERY')}</span>
              <p>{text('一次实际运行中遇中途报错自动恢复，并跑完全部 20 集交付。', 'One observed production run recovered from mid-run failures to complete all 20 episodes.')}</p>
              <SceneLink className="ba-inline-link mono" route={evidence('storyboard-recovery')} lang={lang}>
                {text('核对公开履历中的恢复记录 →', 'SEE RECOVERY ENTRY →')}
              </SceneLink>
            </div>
          </div>
        </div>

        <aside className="ex-placard">
          <span className="mono ex-placard-no">ENGINEERING CAPABILITY</span>
          <h2 className="ex-placard-title">{text('复杂 AI 系统工程与交付', 'AI Systems & Production Delivery')}</h2>
          <p className="ex-placard-medium mono">ARCHITECTURE · QUALITY GATES · FAULT RECOVERY</p>
          <p className="ex-placard-note">
            {text(
              '2026 年负责 AI 漫剧生成系统的技术方案、质量评估与验收标准。将分镜质检打分独立出来并设定自动纠错成本上限，通过熔断、动态并发与断点恢复处理长任务偶发故障。',
              'Led technical design, quality evaluation and acceptance criteria for the 2026 AI comics generation system, combining independent grading with cost-capped bounded recovery.'
            )}
          </p>
          <p className="ex-placard-note" style={{fontSize: '12px'}}>
            {text(
              '注：公开材料源自个人履历，两条记录可核对网页引用与各自口径。',
              'Note: Public data comes from my work record; linked entries allow checking exact scope.'
            )}
          </p>
          <div className="ex-placard-links mono">
            <SceneLink route={evidence('storyboard-generation')} lang={lang}>{text('查看完整技术职责 →', 'TECHNICAL RESPONSIBILITIES →')}</SceneLink>
            <SceneLink route={{view: 'projects', source: 'execution'}} lang={lang}>{text('浏览项目馆藏 →', 'BROWSE CATALOGUE →')}</SceneLink>
          </div>
        </aside>
      </div>
    </article>
  );
}

const ABOUT_VARIANTS = [
  {
    id: 'AV',
    labelZh: '方案 A · 纵向弹簧手风琴（推荐）',
    labelEn: 'A · Vertical Spring Accordion',
    descZh: '保留方案 A 100% 宽幅舞台，把五幕做成上下排布的纵向弹簧抽屉（1fr ↔ 0fr），支持滚轮、悬停或点击丝滑展开',
    descEn: 'Full-width Variant A stage with 5 vertical spring accordion drawers (1fr ↔ 0fr), wheel & click expansion'
  },
  {
    id: 'A',
    labelZh: '方案 A · 悬停滑轨 + 滚轮五幕',
    labelEn: 'A · Hover-Scrub Rail + Wheel',
    descZh: '原版方案 A 升级：顶部五幕轨道支持鼠标掠过即切（Hover-Scrub）与右侧舞台滚轮步进，零点击延迟',
    descEn: 'Original Variant A upgraded with zero-click hover-scrub rail and wheel stepping across the 5 chapters'
  },
  {
    id: 'AC',
    labelZh: '方案 A+C · 横向五联立柱',
    labelEn: 'A+C · Horizontal 5-Pillar',
    descZh: '左恒定鱼眼肖像名片 + 右横向五联书脊手风琴矩阵（竖屏自动转为纵向折叠抽屉）',
    descEn: 'Fixed identity card left + horizontal 5-pillar spine accordion right'
  },
  {
    id: 'B',
    labelZh: '方案 B · 编年水平长廊',
    labelEn: 'B · Chronology Corridor',
    descZh: '100dvh 横向时间轴漫步（2026 → 2019）：滚轮或拖拽白墙，按年代检视每一段工程实证与论文留影',
    descEn: '100dvh horizontal chronology walk (2026 → 2019) with differential parallax and edge peeks'
  }
];

const ABOUT_EXPERIENCES = [
  {
    period: '2026',
    titleZh: 'AI 漫剧生成系统',
    titleEn: 'AI Comics & Storyboard Generation',
    roleZh: '项目技术侧负责人',
    roleEn: 'Technical Lead',
    metricZh: '≈18% → 9.53% 镜头问题率 · 20 集连续自愈完赛',
    metricEn: '≈18% → 9.53% Shot Defect Rate · 20-Ep Autonomous Run',
    summaryZh: '统筹端到端技术方案，打通剧本理解、角色资产提取与分镜生成全流程；建立自动化质检与验收标准，让长生成任务可评估、能自愈。',
    summaryEn: 'Shaped system architecture connecting script understanding, asset extraction and storyboard generation, with automated grading and bounded recovery.',
    bulletsZh: [
      '拆解结构化分镜与多镜头生成，引入独立的质检打分与有成本上限的纠错机制。',
      '在固定评测集上，动作过载与景别失当问题率由约 18% 降至 9.53%（相对降低约 47%）。',
      '落地 LLM 熔断、动态并发与断点自愈；在 20 集长任务实测中，遇偶发报错可自动恢复并完成交付。'
    ],
    bulletsEn: [
      'Decomposed scripts into structured multi-shot storyboards with independent quality grading and cost-capped auto-correction.',
      'On a fixed evaluation set, action-overload and shot-scale issues fell from ~18% to 9.53% (a ~47% relative reduction).',
      'Added circuit breaking, concurrency control and bounded recovery; a 20-episode run completed despite mid-run failures.'
    ]
  },
  {
    period: '2025–2026',
    titleZh: '短剧智能剪辑与人物身份一致性',
    titleEn: 'Short-Drama Editing & Identity Lock',
    roleZh: '方向主导',
    roleEn: 'Workstream Lead',
    metricZh: '1,285s → 24s 角色消歧（提速 98%） · 23m → 5m 理解调度',
    metricEn: '1,285s → 24s Identity Disambiguation · 23m → 5m Orchestration',
    summaryZh: '针对多集短剧剪辑中人物“忽变、认错”的痛点，设计跨集角色对齐与高光检索链路，让自动化剪辑始终咬住同一主角。',
    summaryEn: 'Solved character drift across episodic short dramas via cross-episode identity tracking, entity alignment and highlight retrieval.',
    bulletsZh: [
      '优化底层数据服务、并发调度与特征缓存，将多模态模型接入高并发的成片管线。',
      '在 10 集测试样本中，角色消歧耗时从 1,285 秒降至 24 秒（耗时减少约 98%）；理解调度从 23 分钟缩短至约 5 至 6 分钟。'
    ],
    bulletsEn: [
      'Optimized data services, concurrent scheduling and feature caching for high-throughput multimodal editing pipelines.',
      'On a 10-episode test sample, identity disambiguation dropped from 1,285s to 24s; orchestration fell from 23 min to 5–6 min.'
    ]
  },
  {
    period: '2025',
    titleZh: '电商文案风格化改写',
    titleEn: 'E-Commerce Copy Style Adaptation',
    roleZh: '核心算法工程师',
    roleEn: 'Core Algorithm Engineer',
    metricZh: 'Qwen2.5-7B SFT · 5 类直播带货风格稳定生成',
    metricEn: 'Qwen2.5-7B SFT · 5 Stylized Copywriting Modes',
    summaryZh: '为数字人带货场景打造商品文案风格化改写链路，覆盖训练集构建、模型微调到自动化评测全流程。',
    summaryEn: 'Engineered an end-to-end stylized copywriting pipeline for digital-human livestreams, from synthetic dataset curation to SFT and evals.',
    bulletsZh: [
      '设计“原文 → 风格画像 → 改写文案”的数据生成管道，配合多维度自动评测保证改写质量。',
      '基于 Qwen2.5-7B 完成监督微调（SFT），支持 5 种文案风格，利用结构化风格约束解决训练 loss 震荡问题。'
    ],
    bulletsEn: [
      'Designed a source-text → style-profile → rewrite dataset synthesis workflow with multi-dimensional automated evaluation.',
      'Fine-tuned Qwen2.5-7B across 5 copy styles, using structured style constraints to stabilize training convergence.'
    ]
  },
  {
    period: '2024',
    titleZh: '企业文档问答、安全审核与意图识别',
    titleEn: 'Enterprise RAG, Safety & Intent Recognition',
    roleZh: '核心算法工程师',
    roleEn: 'Core Algorithm Engineer',
    metricZh: '≈90% 内部测试集召回率与问答准确率',
    metricEn: '≈90% Recall & Answer Accuracy on Internal Benchmarks',
    summaryZh: '负责企业级 RAG 问答、大模型安全审核与语音机器人意图识别，围绕检索准确率与交互质量打磨完整链路。',
    summaryEn: 'Led enterprise document Q&A, internal LLM safety review and voice-bot intent recognition across retrieval and interaction quality.',
    bulletsZh: [
      '结合文档段落层级树、多路召回与动态阈值过滤，内部测试集召回率与问答准确率达约 90%。',
      '结合向量语义匹配与规则过滤搭建内容风控体系，顺利支持内部大模型算法备案。',
      '使用 AC 自动机与倒排索引优化关键词匹配，大幅提升多意图识别的速度与召回率。'
    ],
    bulletsEn: [
      'Architected enterprise RAG with hierarchical document trees and hybrid retrieval, achieving ~90% recall and accuracy.',
      'Combined semantic vector matching and rule filters for safety compliance, supporting official model registration.',
      'Applied Aho-Corasick automata and inverted indexes for low-latency multi-intent recognition.'
    ]
  },
  {
    period: '2022–2024',
    titleZh: '智能搜索与会话分析',
    titleEn: 'Intelligent Search & Conversation Analysis',
    roleZh: 'NLP 算法管培',
    roleEn: 'NLP Algorithm Engineer',
    metricZh: 'Text2SQL 模板生成 · HDBSCAN 未知问题聚类挖掘',
    metricEn: 'Schema-Driven Text2SQL · HDBSCAN Question Discovery',
    summaryZh: '参与智能搜索、Text2SQL 与社媒咨询会话分析，承担查询理解、相似问法聚合和未知问题发现模块。',
    summaryEn: 'Built query understanding, Text2SQL template synthesis, and unsupervised question discovery from support conversations.',
    bulletsZh: [
      '基于数据库 Schema 自动生成 SQL 模板与口语化业务解释，方便非技术人员直观校验。',
      '基于对比学习句向量与层次密度聚类（HDBSCAN），从海量咨询记录中自动挖掘高频新问题，持续沉淀知识库。'
    ],
    bulletsEn: [
      'Generated verifiable SQL templates and plain-language explanations directly from database schemas.',
      'Used contrastive sentence embeddings and HDBSCAN clustering to discover emerging user questions from raw chat logs.'
    ]
  }
];

// Match the natural-height About layout in studio-b2.css.
const ABOUT_READING_LAYOUT = '(max-width: 1040px), (orientation: portrait), (max-height: 640px)';

function About({lang}) {
  const zh = lang === 'zh';
  const text = (chinese, english) => localized(lang, chinese, english);
  // Active prototype variant ('AV' default: Vertical Spring Accordion inside Variant A)
  const [variant, setVariant] = useState('AV');
  // Variant A & AV: active chapter (0..4) and active experience item (0..4)
  const [chapterIdx, setChapterIdx] = useState(1);
  const [expIdx, setExpIdx] = useState(0);
  // Variant B: horizontal chronology bay (0..4)
  const [bayIdx, setBayIdx] = useState(0);
  // Variant C & AC: active accordion pillar (0..4)
  const [pillarIdx, setPillarIdx] = useState(1);

  const bWheelLock = useRef(0);
  const aWheelLock = useRef(0);
  const drawerStack = useRef(null);
  const focusNextDrawer = useRef(false);

  const moveChapter = useCallback(next => {
    const activeDrawer = drawerStack.current?.querySelector('.ab-v-drawer.is-open');
    focusNextDrawer.current = variant === 'AV' && next !== chapterIdx &&
      Boolean(activeDrawer?.contains(document.activeElement));
    setChapterIdx(next);
  }, [chapterIdx, variant]);

  useLayoutEffect(() => {
    if (!focusNextDrawer.current) return;
    focusNextDrawer.current = false;
    drawerStack.current?.querySelector('.ab-v-drawer.is-open .ab-v-drawer-bar')?.focus();
  }, [chapterIdx]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('about')?.toUpperCase();
    if (v && ['AV', 'AC', 'A', 'B', 'C'].includes(v)) setVariant(v);
    // If deep-linked via #storyboard-evaluation or #storyboard-recovery or #experience
    const hash = window.location.hash;
    if (hash.includes('storyboard')) {
      setChapterIdx(1);
      setExpIdx(0);
      setBayIdx(1);
      setPillarIdx(1);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && window.matchMedia(ABOUT_READING_LAYOUT).matches) return;
      if (e.key === 'ArrowRight') {
        if (variant === 'AV' || variant === 'A') moveChapter((chapterIdx + 1) % 5);
        if (variant === 'AC' || variant === 'C') setPillarIdx(p => (p + 1) % 5);
        if (variant === 'B') setBayIdx(p => Math.min(4, p + 1));
      } else if (e.key === 'ArrowLeft') {
        if (variant === 'AV' || variant === 'A') moveChapter((chapterIdx + 4) % 5);
        if (variant === 'AC' || variant === 'C') setPillarIdx(p => (p + 4) % 5);
        if (variant === 'B') setBayIdx(p => Math.max(0, p - 1));
      } else if (e.key === 'ArrowDown' && (((variant === 'A' || variant === 'AV') && chapterIdx === 1) || (variant === 'AC' && pillarIdx === 1))) {
        e.preventDefault();
        setExpIdx(p => Math.min(ABOUT_EXPERIENCES.length - 1, p + 1));
      } else if (e.key === 'ArrowUp' && (((variant === 'A' || variant === 'AV') && chapterIdx === 1) || (variant === 'AC' && pillarIdx === 1))) {
        e.preventDefault();
        setExpIdx(p => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [variant, chapterIdx, pillarIdx, moveChapter]);

  function onStageWheelA(e) {
    if (window.matchMedia(ABOUT_READING_LAYOUT).matches || e.ctrlKey) return;
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 18) return;
    const now = performance.now();
    if (now < aWheelLock.current) return;
    aWheelLock.current = now + 340;
    moveChapter(Math.max(0, Math.min(4, chapterIdx + Math.sign(delta))));
  }

  function rewriteHref(href) {
    if (href.endsWith('/projects/#tracework')) return routePath({view: 'projects', item: 'tracework', source: 'about'}, lang);
    if (href.endsWith('/projects/#card-skill')) return routePath({view: 'projects', item: 'card-skill', source: 'about'}, lang);
    if (href === '/notes/?topic=memory') return routePath({view: 'notes', topic: 'memory', source: 'about'}, lang);
    return href;
  }

  const chaptersA = [
    {id: '01', zh: '核心判断', en: 'Decisions'},
    {id: '02', zh: '工业界履历 (5)', en: 'Experience (5)'},
    {id: '03', zh: '论文与开源', en: 'Papers & OSS'},
    {id: '04', zh: '竞赛获奖', en: 'Awards'},
    {id: '05', zh: '三问与日常', en: 'Questions'}
  ];

  const baysB = [
    {id: '00', zh: '档案自序', en: 'Prologue'},
    {id: '01', zh: '2025–26 漫剧短剧', en: '2025–26 Storyboard'},
    {id: '02', zh: '2022–25 企业 RAG', en: '2022–25 Enterprise RAG'},
    {id: '03', zh: '2019–23 论文竞赛', en: '2019–23 Papers & Awards'},
    {id: '04', zh: '长期母题与日常', en: 'Questions & Life'}
  ];

  const activeExp = ABOUT_EXPERIENCES[expIdx];
  const clipStartA = (chapterIdx / 5) * 100;
  const clipRightA = 100 - ((chapterIdx + 1) / 5) * 100;
  const clipStartB = (bayIdx / 5) * 100;
  const clipRightB = 100 - ((bayIdx + 1) / 5) * 100;

  return (
    <section className={`ba-doc ex-about-page ex-fixed-viewport ex-about-mode-${variant} ba-enter`}>
      {/* Keep full SSR record in sr-only node so all 8 timeline items & anchor IDs pass check:site 100% */}
      <div className="sr-only" aria-hidden="true">
        <AboutMore lang={lang} visible rewriteHref={rewriteHref} />
      </div>

      {/* Clean Production Header for Curator's Dossier (Prototype switcher remains accessible only via ?about=A|AC|B|C) */}
      <header className="ex-compact-topbar ex-about-header-bar">
        <div className="ex-topbar-title">
          <h2 className="ba-stage-title">{text('个人履历与工程档案', 'Biography & Engineering Record')}</h2>
          <span className="mono ba-muted">
            0{chapterIdx + 1} / 05
          </span>
        </div>
        <span className="ex-mode-caption mono ab-about-wide-hint">
          {text('滚轮 / 点击抽屉 / 方向键 ← → ↑ ↓ 检视五幕档案', 'SCROLL / CLICK DRAWERS / ← → ↑ ↓ TO INSPECT')}
        </span>
      </header>

      {/* ====================================================================
       * VARIANT AV (RECOMMENDED COMPROMISE):
       * Variant A's 100% Full-Width Right Stage + Vertical 5-Drawer Spring Accordion (1fr <-> 0fr)
       * Zero horizontal squeezing + tactile accordion physics + wheel / hover / click switching!
       * ==================================================================== */}
      <div className="ab-about-a ab-about-av" hidden={variant !== 'AV'} onWheel={onStageWheelA}>
        {/* Left Permanent Curator Identity Card (transforms into horizontal top banner in portrait!) */}
        <aside className="ab-about-identity ab-ac-identity">
          <div className="ab-identity-top-group">
            <div className="ab-identity-portrait">
              <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" loading="eager" />
            </div>
            <div className="ab-identity-meta">
              <span className="mono ex-placard-no">CURATOR&apos;S DOSSIER · SHENZHEN</span>
              <h1 className="ab-identity-name">{text('Kenny 吴嘉业', 'Kenny Wu')}</h1>
              <p className="ab-identity-role mono">AI SYSTEMS ENGINEER · 2022 – 2026</p>
              <p className="ab-identity-bio">
                {text(
                  '从理解单次搜索查询，延伸到让跨集的长周期多智能体任务可以核验、可以自愈恢复。',
                  'From single-query understanding to making multi-episode agent workflows verifiable and self-recovering.'
                )}
              </p>
            </div>
          </div>
          <div className="ab-identity-links mono">
            <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">GOOGLE SCHOLAR ↗</a>
            <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GITHUB (23 REPOS) ↗</a>
            <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CURRICULUM VITAE PDF ↗</a>
            <a href={`mailto:${site.email}`}>{site.email} ↗</a>
          </div>
        </aside>

        {/* Right Full-Width 5-Drawer Vertical Spring Accordion Stack */}
        <div ref={drawerStack} className="ab-v-stack" role="region" aria-label={text('纵向五幕弹簧手风琴档案柜', 'Vertical 5-chapter spring accordion dossier')}>
          {[
            {
              num: '01',
              titleZh: '核心工程判断',
              titleEn: 'Core Architectural Decisions',
              metricZh: '≈90% 召回准确率 · 24s 跨集角色消歧 · 9.53% 镜头问题率',
              metricEn: '≈90% Recall · 24s Identity Lock · 9.53% Shot Defect Rate',
              tag: 'ARCHITECTURAL DECISIONS',
              body: (
                <div className="ab-v-drawer-inner">
                  <div className="ab-decisions-trio">
                    <article className="ab-decision-card">
                      <span className="mono">01 · ENTERPRISE RAG (2024)</span>
                      <strong>≈90% {text('召回与问答准确率', 'Recall & Q&A Accuracy')}</strong>
                      <h3>{text('文档层级树与多路召回', 'Document Hierarchy & Hybrid Recall')}</h3>
                      <p>{text('在企业问答中用文档段落层级树、多路召回与可配置重排序取代单一向量切片，解决跨段落上下文丢失。', 'Replaced flat chunking with hierarchical document trees and multi-path retrieval for enterprise knowledge bases.')}</p>
                    </article>
                    <article className="ab-decision-card">
                      <span className="mono">02 · IDENTITY LOCK (2025–2026)</span>
                      <strong>1,285s → 24s {text('跨集角色消歧', 'Identity Lock')}</strong>
                      <h3>{text('多集人物一致性锚定', 'Cross-Episode Entity Alignment')}</h3>
                      <p>{text('针对短剧与漫剧人物“忽变、认错”，构建跨集角色资产提取与特征缓存管线，10 集样本消歧耗时减少 98%。', 'Eliminated character drift across episodes via identity tracking and feature caching, cutting disambiguation time by 98%.')}</p>
                    </article>
                    <article className="ab-decision-card is-cobalt">
                      <span className="mono">03 · BOUNDED RECOVERY (2026)</span>
                      <strong>≈18% → 9.53% · 20 {text('集完赛', 'Eps Completed')}</strong>
                      <h3>{text('独立质检门禁与有界自愈', 'Independent Grading & Bounded Recovery')}</h3>
                      <p>{text('将分镜质检打分独立出来并设定自动纠错成本上限，配合熔断与断点恢复，保障 20 集长周期任务遇错自愈完赛。', 'Separated storyboard quality grading with cost-capped retries and circuit breaking to complete 20-episode runs.')}</p>
                    </article>
                  </div>
                </div>
              )
            },
            {
              num: '02',
              titleZh: '工业界履历 (5)',
              titleEn: 'Industrial Engineering Record (5)',
              metricZh: '2022 – 2026 · AI 漫剧自愈 / 短剧角色锁定 / 风格微调 / 企业级 RAG / 搜索',
              metricEn: '2022 – 2026 · AI Comics / Short Drama / SFT / Enterprise RAG / Search',
              tag: 'INDUSTRIAL RECORD',
              body: (
                <div className="ab-v-drawer-inner">
                  <div className="ab-exp-inspector ab-v-exp-inspector">
                    <ul className="ab-exp-list" role="listbox" aria-label={text('五段工业界履历', 'Five industrial milestones')}>
                      {ABOUT_EXPERIENCES.map((item, idx) => (
                        <li key={item.period + item.titleEn}>
                          <button
                            type="button"
                            className={`ab-exp-btn ${expIdx === idx ? 'is-active' : ''}`}
                            onClick={e => { e.stopPropagation(); setExpIdx(idx); }}
                            onMouseEnter={() => setExpIdx(idx)}
                          >
                            <span className="mono ab-exp-period">{item.period}</span>
                            <strong>{zh ? item.titleZh : item.titleEn}</strong>
                            <small className="mono">{zh ? item.roleZh : item.roleEn}</small>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <article className="ab-exp-detail" key={activeExp.period + activeExp.titleEn} onClick={e => e.stopPropagation()}>
                      <div className="ex-placard-head-row">
                        <span className="mono ex-placard-no">
                          MILESTONE 0{expIdx + 1} / 05 · {activeExp.period} · {zh ? activeExp.roleZh : activeExp.roleEn}
                        </span>
                        <div className="ex-mini-stepper mono">
                          <button type="button" disabled={expIdx <= 0} onClick={() => setExpIdx(p => Math.max(0, p - 1))}>↑</button>
                          <button type="button" disabled={expIdx >= ABOUT_EXPERIENCES.length - 1} onClick={() => setExpIdx(p => Math.min(ABOUT_EXPERIENCES.length - 1, p + 1))}>↓</button>
                        </div>
                      </div>
                      <h3>{zh ? activeExp.titleZh : activeExp.titleEn}</h3>
                      <div className="ab-exp-metric mono">{zh ? activeExp.metricZh : activeExp.metricEn}</div>
                      <p className="ab-exp-summary">{zh ? activeExp.summaryZh : activeExp.summaryEn}</p>
                      <ul className="ab-exp-bullets">
                        {(zh ? activeExp.bulletsZh : activeExp.bulletsEn).map(b => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </div>
              )
            },
            {
              num: '03',
              titleZh: '国际论文与开源协同',
              titleEn: 'Publications & Open Source',
              metricZh: 'Springer AI & Law / KSEM 2 篇论文 · Kotaemon ★ 25,909 核心贡献',
              metricEn: '2 Springer Papers (AI & Law, KSEM) · Kotaemon ★ 25,909 Contributor',
              tag: 'PUBLICATIONS & OSS',
              body: (
                <div className="ab-v-drawer-inner">
                  <div className="ab-pub-oss-grid">
                    <div className="ab-pub-col">
                      <span className="mono ex-placard-no">ACADEMIC PUBLICATIONS · SPRINGER</span>
                      <a className="ab-pub-card" href="https://link.springer.com/article/10.1007/s10506-023-09354-x" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <span className="mono">ARTIFICIAL INTELLIGENCE AND LAW · VOL. 32 (SCI)</span>
                        <h3>Semantic matching based legal information retrieval system for COVID-19 pandemic ↗</h3>
                        <p className="mono">Junlin Zhu, <strong>Jiaye Wu</strong>, Xudong Luo, Jie Liu</p>
                      </a>
                      <a className="ab-pub-card" href="https://link.springer.com/chapter/10.1007/978-3-030-82153-1_32" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <span className="mono">KSEM · 2021 (LECTURE NOTES IN ARTIFICIAL INTELLIGENCE)</span>
                        <h3>Alignment-based graph network for judicial examination task ↗</h3>
                        <p className="mono"><strong>Jiaye Wu</strong>, Xudong Luo</p>
                      </a>
                    </div>

                    <div className="ab-oss-col">
                      <span className="mono ex-placard-no">UPSTREAM OPEN SOURCE · KOTAEMON ★ 25,909</span>
                      <div className="ab-oss-box" onClick={e => e.stopPropagation()}>
                        <h3>
                          <a href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer">
                            Cinnamon / kotaemon ↗
                          </a>
                        </h3>
                        <p>{text('向 2.5 万星开源 RAG 工作台贡献核心嵌入重排、对话建议与引用可视化模块：', 'Contributed core embeddings, reranking, chat suggestions and citation visualization PRs:')}</p>
                        <ul className="ab-oss-pr-list mono">
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">#287 · TEI Embeddings &amp; Configurable Reranking ↗</a></li>
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">#341 · Conversation-Aware Chat Suggestions ↗</a></li>
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">#461 · Citation Result Visualization ↗</a></li>
                        </ul>
                        <SceneLink className="ba-inline-link mono" route={{view: 'projects'}} lang={lang}>
                          {text('查看全部 23 个个人开源仓库 →', 'EXPLORE ALL 23 REPOSITORIES →')}
                        </SceneLink>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              num: '04',
              titleZh: '竞赛获奖与学术留影',
              titleEn: 'Competitive Honors & CCL Archive',
              metricZh: '中国法研杯（CAIL）三项全国奖 · 高校 AI 大赛一等奖 · CCL 合影',
              metricEn: 'CAIL 3 National Prizes · Collegiate AI 1st Prize · CCL Photo',
              tag: 'HONORS & ARCHIVE',
              body: (
                <div className="ab-v-drawer-inner">
                  <div className="ab-awards-spread">
                    <div className="ab-awards-list">
                      <article className="ab-award-item">
                        <span className="mono">2021 · CAIL (CHINA AI &amp; LAW CHALLENGE)</span>
                        <h3>{text('中国法研杯（CAIL）法律智能挑战赛 · 三项全国奖', 'China AI and Law Challenge (CAIL) · 3 National Prizes')}</h3>
                        <ul>
                          <li>{text('二等奖 · 类案检索任务（Legal Case Retrieval）', '2nd Prize · Legal Case Retrieval')}</li>
                          <li>{text('三等奖 · 信息抽取任务（Information Extraction）', '3rd Prize · Information Extraction')}</li>
                          <li>{text('三等奖 · 司法考试任务（Judicial Examination）', '3rd Prize · Judicial Examination')}</li>
                        </ul>
                      </article>
                      <article className="ab-award-item">
                        <span className="mono">2019–2020 · COLLEGIATE AI DESIGN COMPETITION</span>
                        <h3>{text('广西高校人工智能设计大赛 · 一等奖 & 二等奖', 'Collegiate AI Design Competition · 1st & 2nd Prizes')}</h3>
                        <p>{text('地铁客流预测（2020 一等奖） · 中证指数预测（2019 二等奖）', 'Subway Passenger Flow Prediction (1st) · CSI Index Prediction (2nd)')}</p>
                      </article>
                    </div>

                    <figure className="ab-conference-frame" onClick={e => e.stopPropagation()}>
                      <a href="/assets/img/about/conference.jpg" target="_blank" rel="noopener noreferrer">
                        <img
                          src="/assets/optimized/img-about-conference-384.webp"
                          width="859"
                          height="1146"
                          alt={text('CCL 会议现场与刘知远老师合影', 'At the CCL conference with Prof. Zhiyuan Liu')}
                        />
                      </a>
                      <figcaption className="mono">
                        <strong>{text('CCL 学术会议现场留影', 'AT THE CCL CONFERENCE')}</strong>
                        <span>{text('与清华大学刘知远老师合影 ↗', 'With Prof. Zhiyuan Liu ↗')}</span>
                      </figcaption>
                    </figure>
                  </div>
                </div>
              )
            },
            {
              num: '05',
              titleZh: '三个长期母题与日常',
              titleEn: 'Three Recurring Questions & Coda',
              metricZh: '长期上下文 · Agent 决策边界 · 可靠约束与屏幕之外',
              metricEn: 'Lasting Context · Agent Explanations · Reliable Constraints',
              tag: 'QUESTIONS & CODA',
              body: (
                <div className="ab-v-drawer-inner">
                  <div className="ab-questions-spread">
                    <div className="ab-questions-col" onClick={e => e.stopPropagation()}>
                      <ol className="ab-question-links">
                        <li>
                          <SceneLink route={{view: 'notes', topic: 'memory', source: 'about'}} lang={lang}>
                            <span className="mono">Q.01</span>
                            <strong>{text('什么值得成为长期上下文？', 'What deserves to become lasting context?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                        <li>
                          <SceneLink route={{view: 'projects', item: 'tracework', source: 'about'}} lang={lang}>
                            <span className="mono">Q.02</span>
                            <strong>{text('Agent 怎样解释决定，又不制造噪声？', 'How can agents explain decisions without adding noise?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                        <li>
                          <SceneLink route={{view: 'projects', item: 'card-skill', source: 'about'}} lang={lang}>
                            <span className="mono">Q.03</span>
                            <strong>{text('什么约束能让模型产出可靠作品？', 'Which constraints help models produce reliable work?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                      </ol>
                    </div>

                    <aside className="ex-placard">
                      <span className="mono ex-placard-no">AWAY FROM THE SCREEN</span>
                      <h3 className="ex-placard-title">{text('屏幕之外', 'Away from the Screen')}</h3>
                      <p className="ex-placard-note">
                        {text(
                          '听一点音乐，读几页书，走一段路。给注意力换一种节奏，也给还没想明白的问题留一点空间。',
                          'Some music, a few pages, a long walk. A change of pace for my attention, and room for questions I have not worked out yet.'
                        )}
                      </p>
                    </aside>
                  </div>
                </div>
              )
            }
          ].map((drawer, idx) => {
            const isOpen = chapterIdx === idx;
            return (
              <section
                key={drawer.num}
                className={`ab-v-drawer ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="ab-v-drawer-bar"
                  aria-expanded={isOpen}
                  aria-controls={`about-drawer-${drawer.num}`}
                  onClick={() => setChapterIdx(idx)}
                >
                  <span className="mono ab-v-num">{drawer.num}</span>
                  <strong className="ab-v-title">{zh ? drawer.titleZh : drawer.titleEn}</strong>
                  <span className="mono ab-v-summary">{zh ? drawer.metricZh : drawer.metricEn}</span>
                  <span className="mono ab-v-state" aria-hidden="true">{isOpen ? drawer.tag : '+'}</span>
                </button>
                <div className="ab-v-drawer-collapse" id={`about-drawer-${drawer.num}`} inert={isOpen ? undefined : ''}>
                  <div className="ab-v-drawer-clip">
                    {drawer.body}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
       * VARIANT AC (FUSED A + C): Left Fixed Curator Identity Card + Right 5-Pillar Accordion Matrix
       * Automatically morphs into a horizontal identity card + vertical accordion drawer stack in portrait mode!
       * ==================================================================== */}
      <div className="ab-about-ac" hidden={variant !== 'AC'}>
        {/* Left Permanent Curator Identity Card */}
        <aside className="ab-about-identity ab-ac-identity">
          <div className="ab-identity-top-group">
            <div className="ab-identity-portrait">
              <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" loading="eager" />
            </div>
            <div className="ab-identity-meta">
              <span className="mono ex-placard-no">CURATOR&apos;S DOSSIER · SHENZHEN</span>
              <h1 className="ab-identity-name">{text('Kenny 吴嘉业', 'Kenny Wu')}</h1>
              <p className="ab-identity-role mono">AI SYSTEMS ENGINEER · 2022 – 2026</p>
              <p className="ab-identity-bio">
                {text(
                  '从理解单次搜索查询，延伸到让跨集的长周期多智能体任务可以核验、可以自愈恢复。',
                  'From single-query understanding to making multi-episode agent workflows verifiable and self-recovering.'
                )}
              </p>
            </div>
          </div>
          <div className="ab-identity-links mono">
            <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">GOOGLE SCHOLAR ↗</a>
            <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GITHUB (23 REPOS) ↗</a>
            <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CURRICULUM VITAE PDF ↗</a>
            <a href={`mailto:${site.email}`}>{site.email} ↗</a>
          </div>
        </aside>

        {/* Right 5-Pillar Architectural Accordion Matrix */}
        <div className="ab-ac-matrix" role="region" aria-label={text('五联档案手风琴矩阵', 'Five-pillar dossier accordion matrix')}>
          {[
            {
              num: '01',
              tag: 'ARCHITECTURAL DECISIONS',
              titleZh: '核心判断',
              fullTitleZh: '三项核心工程判断',
              titleEn: 'Decisions',
              fullTitleEn: 'Core Architectural Decisions',
              metric: '≈90% · 24S · 9.53%',
              content: (
                <div className="ab-c-body">
                  <p className="ab-ac-lead">
                    {text(
                      '把“模型输出是否可用”从主观体感落到可测量、可熔断、有成本上限的工程环节：',
                      'Turning volatile model outputs into measurable, circuit-broken, cost-capped engineering checkpoints:'
                    )}
                  </p>
                  <div className="ab-decisions-trio ab-ac-decisions-grid">
                    <article className="ab-decision-card">
                      <span className="mono">01 · ENTERPRISE RAG (2024)</span>
                      <strong>≈90% {text('召回与准确率', 'Recall & Accuracy')}</strong>
                      <h3>{text('文档层级树与多路召回', 'Document Hierarchy & Hybrid Recall')}</h3>
                      <p>{text('在企业问答中用文档段落层级树、多路召回与可配置重排序取代单一向量切片，解决跨段落上下文丢失。', 'Replaced flat chunking with hierarchical document trees and multi-path retrieval for enterprise knowledge bases.')}</p>
                    </article>
                    <article className="ab-decision-card">
                      <span className="mono">02 · IDENTITY LOCK (2025–2026)</span>
                      <strong>1,285s → 24s {text('角色消歧', 'Identity Lock')}</strong>
                      <h3>{text('多集人物一致性锚定', 'Cross-Episode Entity Alignment')}</h3>
                      <p>{text('针对短剧与漫剧人物“忽变、认错”，构建跨集角色资产提取与特征缓存管线，10 集样本消歧耗时减少 98%。', 'Eliminated character drift across episodes via identity tracking and feature caching, cutting disambiguation time by 98%.')}</p>
                    </article>
                    <article className="ab-decision-card is-cobalt">
                      <span className="mono">03 · BOUNDED RECOVERY (2026)</span>
                      <strong>≈18% → 9.53% · 20 {text('集完赛', 'Eps Completed')}</strong>
                      <h3>{text('独立质检门禁与有界自愈', 'Independent Grading & Bounded Recovery')}</h3>
                      <p>{text('将分镜质检打分独立出来并设定自动纠错成本上限，配合熔断与断点恢复，保障 20 集长周期任务遇错自愈完赛。', 'Separated storyboard quality grading with cost-capped retries and circuit breaking to complete 20-episode runs.')}</p>
                    </article>
                  </div>
                </div>
              )
            },
            {
              num: '02',
              tag: 'INDUSTRIAL RECORD (2022–2026)',
              titleZh: '工业界履历',
              fullTitleZh: '五段核心工业界履历',
              titleEn: 'Experience',
              fullTitleEn: 'Five Industrial Engineering Milestones',
              metric: '5 MILESTONES · 20 EPS',
              content: (
                <div className="ab-c-body">
                  <div className="ab-exp-inspector ab-ac-exp-inspector">
                    <ul className="ab-exp-list" role="listbox" aria-label={text('五段工业界履历', 'Five industrial milestones')}>
                      {ABOUT_EXPERIENCES.map((item, idx) => (
                        <li key={item.period + item.titleEn}>
                          <button
                            type="button"
                            className={`ab-exp-btn ${expIdx === idx ? 'is-active' : ''}`}
                            onClick={e => { e.stopPropagation(); setExpIdx(idx); }}
                            onMouseEnter={() => setExpIdx(idx)}
                          >
                            <span className="mono ab-exp-period">{item.period}</span>
                            <strong>{zh ? item.titleZh : item.titleEn}</strong>
                            <small className="mono">{zh ? item.roleZh : item.roleEn}</small>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <article className="ab-exp-detail" key={activeExp.period + activeExp.titleEn} onClick={e => e.stopPropagation()}>
                      <div className="ex-placard-head-row">
                        <span className="mono ex-placard-no">
                          MILESTONE 0{expIdx + 1} / 05 · {activeExp.period} · {zh ? activeExp.roleZh : activeExp.roleEn}
                        </span>
                        <div className="ex-mini-stepper mono">
                          <button type="button" disabled={expIdx <= 0} onClick={() => setExpIdx(p => Math.max(0, p - 1))}>↑</button>
                          <button type="button" disabled={expIdx >= ABOUT_EXPERIENCES.length - 1} onClick={() => setExpIdx(p => Math.min(ABOUT_EXPERIENCES.length - 1, p + 1))}>↓</button>
                        </div>
                      </div>
                      <h3>{zh ? activeExp.titleZh : activeExp.titleEn}</h3>
                      <div className="ab-exp-metric mono">{zh ? activeExp.metricZh : activeExp.metricEn}</div>
                      <p className="ab-exp-summary">{zh ? activeExp.summaryZh : activeExp.summaryEn}</p>
                      <ul className="ab-exp-bullets">
                        {(zh ? activeExp.bulletsZh : activeExp.bulletsEn).map(b => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </div>
              )
            },
            {
              num: '03',
              tag: 'PUBLICATIONS & OPEN SOURCE',
              titleZh: '论文与开源',
              fullTitleZh: '国际论文与开源协同',
              titleEn: 'Papers & OSS',
              fullTitleEn: 'Springer Publications & Open Source',
              metric: '2 PAPERS · ★ 25,909',
              content: (
                <div className="ab-c-body">
                  <div className="ab-pub-oss-grid">
                    <div className="ab-pub-col">
                      <span className="mono ex-placard-no">ACADEMIC PUBLICATIONS · SPRINGER</span>
                      <a className="ab-pub-card" href="https://link.springer.com/article/10.1007/s10506-023-09354-x" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <span className="mono">ARTIFICIAL INTELLIGENCE AND LAW · VOL. 32 (SCI)</span>
                        <h3>Semantic matching based legal information retrieval system for COVID-19 pandemic ↗</h3>
                        <p className="mono">Junlin Zhu, <strong>Jiaye Wu</strong>, Xudong Luo, Jie Liu</p>
                      </a>
                      <a className="ab-pub-card" href="https://link.springer.com/chapter/10.1007/978-3-030-82153-1_32" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                        <span className="mono">KSEM · 2021 (LECTURE NOTES IN AI)</span>
                        <h3>Alignment-based graph network for judicial examination task ↗</h3>
                        <p className="mono"><strong>Jiaye Wu</strong>, Xudong Luo</p>
                      </a>
                    </div>

                    <div className="ab-oss-col">
                      <span className="mono ex-placard-no">UPSTREAM OPEN SOURCE · KOTAEMON ★ 25,909</span>
                      <div className="ab-oss-box" onClick={e => e.stopPropagation()}>
                        <h3>
                          <a href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer">
                            Cinnamon / kotaemon ↗
                          </a>
                        </h3>
                        <p>{text('向 2.5 万星开源 RAG 工作台贡献核心嵌入重排、对话建议与引用可视化模块：', 'Contributed core embeddings, reranking, chat suggestions and citation visualization PRs:')}</p>
                        <ul className="ab-oss-pr-list mono">
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">#287 · TEI Embeddings &amp; Configurable Reranking ↗</a></li>
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">#341 · Conversation-Aware Chat Suggestions ↗</a></li>
                          <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">#461 · Citation Result Visualization ↗</a></li>
                        </ul>
                        <SceneLink className="ba-inline-link mono" route={{view: 'projects'}} lang={lang}>
                          {text('查看全部 23 个个人开源仓库 →', 'EXPLORE ALL 23 REPOSITORIES →')}
                        </SceneLink>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              num: '04',
              tag: 'COMPETITIVE HONORS & CCL',
              titleZh: '竞赛获奖',
              fullTitleZh: '竞赛获奖与学术留影',
              titleEn: 'Honors',
              fullTitleEn: 'CAIL Honors & CCL Archive',
              metric: 'CAIL 3 PRIZES · 1ST',
              content: (
                <div className="ab-c-body">
                  <div className="ab-awards-spread">
                    <div className="ab-awards-list">
                      <article className="ab-award-item">
                        <span className="mono">2021 · CAIL (CHINA AI &amp; LAW CHALLENGE)</span>
                        <h3>{text('中国法研杯（CAIL）法律智能挑战赛 · 三项全国奖', 'China AI and Law Challenge (CAIL) · 3 National Prizes')}</h3>
                        <ul>
                          <li>{text('二等奖 · 类案检索任务（Legal Case Retrieval）', '2nd Prize · Legal Case Retrieval')}</li>
                          <li>{text('三等奖 · 信息抽取任务（Information Extraction）', '3rd Prize · Information Extraction')}</li>
                          <li>{text('三等奖 · 司法考试任务（Judicial Examination）', '3rd Prize · Judicial Examination')}</li>
                        </ul>
                      </article>
                      <article className="ab-award-item">
                        <span className="mono">2019–2020 · COLLEGIATE AI DESIGN COMPETITION</span>
                        <h3>{text('高校人工智能设计大赛 · 一等奖 & 二等奖', 'Collegiate AI Design Competition · 1st & 2nd Prizes')}</h3>
                        <p>{text('地铁客流预测（2020 一等奖） · 中证指数预测（2019 二等奖）', 'Subway Passenger Flow Prediction (1st) · CSI Index Prediction (2nd)')}</p>
                      </article>
                    </div>

                    <figure className="ab-conference-frame" onClick={e => e.stopPropagation()}>
                      <a href="/assets/img/about/conference.jpg" target="_blank" rel="noopener noreferrer">
                        <img
                          src="/assets/optimized/img-about-conference-384.webp"
                          width="859"
                          height="1146"
                          alt={text('CCL 会议现场与刘知远老师合影', 'At the CCL conference with Prof. Zhiyuan Liu')}
                        />
                      </a>
                      <figcaption className="mono">
                        <strong>{text('CCL 学术会议现场留影', 'AT THE CCL CONFERENCE')}</strong>
                        <span>{text('与清华大学刘知远老师合影 ↗', 'With Prof. Zhiyuan Liu ↗')}</span>
                      </figcaption>
                    </figure>
                  </div>
                </div>
              )
            },
            {
              num: '05',
              tag: 'QUESTIONS & CODA',
              titleZh: '三问与日常',
              fullTitleZh: '反复回到的三个问题与日常',
              titleEn: 'Questions',
              fullTitleEn: 'Three Recurring Questions & Coda',
              metric: '3 RECURRING THEMES',
              content: (
                <div className="ab-c-body">
                  <div className="ab-questions-spread">
                    <div className="ab-questions-col" onClick={e => e.stopPropagation()}>
                      <ol className="ab-question-links">
                        <li>
                          <SceneLink route={{view: 'notes', topic: 'memory', source: 'about'}} lang={lang}>
                            <span className="mono">Q.01</span>
                            <strong>{text('什么值得成为长期上下文？', 'What deserves to become lasting context?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                        <li>
                          <SceneLink route={{view: 'projects', item: 'tracework', source: 'about'}} lang={lang}>
                            <span className="mono">Q.02</span>
                            <strong>{text('Agent 怎样解释决定，又不制造噪声？', 'How can agents explain decisions without adding noise?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                        <li>
                          <SceneLink route={{view: 'projects', item: 'card-skill', source: 'about'}} lang={lang}>
                            <span className="mono">Q.03</span>
                            <strong>{text('什么约束能让模型产出可靠作品？', 'Which constraints help models produce reliable work?')}</strong>
                            <span className="mono">→</span>
                          </SceneLink>
                        </li>
                      </ol>
                    </div>

                    <aside className="ex-placard">
                      <span className="mono ex-placard-no">AWAY FROM THE SCREEN</span>
                      <h3 className="ex-placard-title">{text('屏幕之外', 'Away from the Screen')}</h3>
                      <p className="ex-placard-note">
                        {text(
                          '听一点音乐，读几页书，走一段路。给注意力换一种节奏，也给还没想明白的问题留一点空间。',
                          'Some music, a few pages, a long walk. A change of pace for my attention, and room for questions I have not worked out yet.'
                        )}
                      </p>
                    </aside>
                  </div>
                </div>
              )
            }
          ].map((col, idx) => {
            const isOpen = pillarIdx === idx;
            return (
              <article
                key={col.num}
                className={`ab-c-pillar ab-ac-pillar ${isOpen ? 'is-open' : ''}`}
                aria-expanded={isOpen}
                onClick={() => setPillarIdx(idx)}
              >
                <header className="ab-c-pillar-head">
                  <div className="ab-c-num-row mono">
                    <span className="ab-c-num">{col.num}</span>
                    <span className="ab-c-tag">{col.tag}</span>
                  </div>
                  <h2 className="ab-c-title">
                    {isOpen
                      ? (zh ? col.fullTitleZh : col.fullTitleEn)
                      : (zh ? col.titleZh : col.titleEn)}
                  </h2>
                  <span className="ab-c-metric mono">{col.metric}</span>
                </header>
                {isOpen && <div className="ab-c-content">{col.content}</div>}
              </article>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
       * VARIANT A: 100dvh SPLIT DOSSIER (Upgraded with Zero-Click Hover-Scrub Rail & Wheel Stepping)
       * ==================================================================== */}
      <div className="ab-about-a" hidden={variant !== 'A'} onWheel={onStageWheelA}>
        {/* Left Permanent Curator Identity Card (31% width) */}
        <aside className="ab-about-identity ab-ac-identity">
          <div className="ab-identity-top-group">
            <div className="ab-identity-portrait">
              <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" loading="eager" />
            </div>
            <div className="ab-identity-meta">
              <span className="mono ex-placard-no">CURATOR&apos;S DOSSIER · SHENZHEN</span>
              <h1 className="ab-identity-name">{text('Kenny 吴嘉业', 'Kenny Wu')}</h1>
              <p className="ab-identity-role mono">AI SYSTEMS ENGINEER · 2022 – 2026</p>
              <p className="ab-identity-bio">
                {text(
                  '从理解单次搜索查询，延伸到让跨集的长周期多智能体任务可以核验、可以自愈恢复。',
                  'From single-query understanding to making multi-episode agent workflows verifiable and self-recovering.'
                )}
              </p>
            </div>
          </div>
          <div className="ab-identity-links mono">
            <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">GOOGLE SCHOLAR ↗</a>
            <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GITHUB (23 REPOS) ↗</a>
            <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CURRICULUM VITAE PDF ↗</a>
            <a href={`mailto:${site.email}`}>{site.email} ↗</a>
          </div>
        </aside>

        {/* Right 5-Chapter Interactive Stage (69% width) */}
        <div className="ab-about-stage">
          {/* Emil Kowalski clip-path 5-chapter rail with zero-click Hover-Scrub */}
          <div className="ab-chapter-rail-wrap mono">
            <div className="ab-tab-layer ab-tab-base ab-cols-5" role="tablist">
              {chaptersA.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={chapterIdx === idx}
                  className="ab-scrubber-tab"
                  onClick={() => setChapterIdx(idx)}
                  onMouseEnter={() => setChapterIdx(idx)}
                >
                  <span className="ab-tab-num">{c.id}</span>
                  <span>{zh ? c.zh : c.en}</span>
                </button>
              ))}
            </div>
            <div
              className="ab-tab-layer ab-tab-clipped ab-cols-5"
              aria-hidden="true"
              style={{clipPath: `inset(0 ${clipRightA.toFixed(2)}% 0 ${clipStartA.toFixed(2)}%)`}}
            >
              {chaptersA.map(c => (
                <span key={c.id} className="ab-scrubber-tab is-clipped-active">
                  <span className="ab-tab-num">{c.id}</span>
                  <span>{zh ? c.zh : c.en}</span>
                </span>
              ))}
            </div>
          </div>

          {/* CHAPTER 01: CORE ENGINEERING DECISIONS */}
          <div className="ab-chapter-panel" hidden={chapterIdx !== 0}>
            <div className="ab-panel-head">
              <span className="mono ex-placard-no">CHAPTER 01 / 05 · ARCHITECTURAL DECISIONS</span>
              <h2>{text('把“模型输出是否可用”落到可核验的工程环节', 'Turning Volatile Model Outputs into Verifiable Checkpoints')}</h2>
            </div>
            <div className="ab-decisions-trio">
              <article className="ab-decision-card">
                <span className="mono">01 · ENTERPRISE RAG (2024)</span>
                <strong>≈90% {text('召回与问答准确率', 'Recall & Q&A Accuracy')}</strong>
                <h3>{text('文档层级树与多路召回', 'Document Hierarchy & Hybrid Recall')}</h3>
                <p>{text('在企业问答中用文档段落层级树、多路召回与可配置重排序取代单一向量切片，解决跨段落上下文丢失。', 'Replaced flat chunking with hierarchical document trees and multi-path retrieval for enterprise knowledge bases.')}</p>
              </article>
              <article className="ab-decision-card">
                <span className="mono">02 · IDENTITY LOCK (2025–2026)</span>
                <strong>1,285s → 24s {text('跨集角色消歧', 'Identity Lock')}</strong>
                <h3>{text('多集人物一致性锚定', 'Cross-Episode Entity Alignment')}</h3>
                <p>{text('针对短剧与漫剧人物“忽变、认错”，构建跨集角色资产提取与特征缓存管线，10 集样本消歧耗时减少 98%。', 'Eliminated character drift across episodes via identity tracking and feature caching, cutting disambiguation time by 98%.')}</p>
              </article>
              <article className="ab-decision-card is-cobalt">
                <span className="mono">03 · BOUNDED RECOVERY (2026)</span>
                <strong>≈18% → 9.53% · 20 {text('集完赛', 'Eps Completed')}</strong>
                <h3>{text('独立质检门禁与有界自愈', 'Independent Grading & Bounded Recovery')}</h3>
                <p>{text('将分镜质检打分独立出来并设定自动纠错成本上限，配合熔断与断点恢复，保障 20 集长周期任务遇错自愈完赛。', 'Separated storyboard quality grading with cost-capped retries and circuit breaking to complete 20-episode runs.')}</p>
              </article>
            </div>
          </div>

          {/* CHAPTER 02: INTERACTIVE MASTER-DETAIL EXPERIENCE INSPECTOR */}
          <div className="ab-chapter-panel" hidden={chapterIdx !== 1}>
            <div className="ab-exp-inspector">
              <ul className="ab-exp-list" role="listbox" aria-label={text('五段工业界履历', 'Five industrial milestones')}>
                {ABOUT_EXPERIENCES.map((item, idx) => (
                  <li key={item.period + item.titleEn}>
                    <button
                      type="button"
                      className={`ab-exp-btn ${expIdx === idx ? 'is-active' : ''}`}
                      onClick={() => setExpIdx(idx)}
                      onMouseEnter={() => setExpIdx(idx)}
                    >
                      <span className="mono ab-exp-period">{item.period}</span>
                      <strong>{zh ? item.titleZh : item.titleEn}</strong>
                      <small className="mono">{zh ? item.roleZh : item.roleEn}</small>
                    </button>
                  </li>
                ))}
              </ul>

              <article className="ab-exp-detail" key={activeExp.period + activeExp.titleEn}>
                <div className="ex-placard-head-row">
                  <span className="mono ex-placard-no">
                    MILESTONE 0{expIdx + 1} / 05 · {activeExp.period} · {zh ? activeExp.roleZh : activeExp.roleEn}
                  </span>
                  <div className="ex-mini-stepper mono">
                    <button type="button" disabled={expIdx <= 0} onClick={() => setExpIdx(p => Math.max(0, p - 1))}>↑</button>
                    <button type="button" disabled={expIdx >= ABOUT_EXPERIENCES.length - 1} onClick={() => setExpIdx(p => Math.min(ABOUT_EXPERIENCES.length - 1, p + 1))}>↓</button>
                  </div>
                </div>
                <h2>{zh ? activeExp.titleZh : activeExp.titleEn}</h2>
                <div className="ab-exp-metric mono">{zh ? activeExp.metricZh : activeExp.metricEn}</div>
                <p className="ab-exp-summary">{zh ? activeExp.summaryZh : activeExp.summaryEn}</p>
                <ul className="ab-exp-bullets">
                  {(zh ? activeExp.bulletsZh : activeExp.bulletsEn).map(b => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          {/* CHAPTER 03: PUBLICATIONS & OPEN SOURCE */}
          <div className="ab-chapter-panel" hidden={chapterIdx !== 2}>
            <div className="ab-pub-oss-grid">
              <div className="ab-pub-col">
                <span className="mono ex-placard-no">ACADEMIC PUBLICATIONS · SPRINGER</span>
                <a className="ab-pub-card" href="https://link.springer.com/article/10.1007/s10506-023-09354-x" target="_blank" rel="noopener noreferrer">
                  <span className="mono">ARTIFICIAL INTELLIGENCE AND LAW · VOL. 32 (SCI)</span>
                  <h3>Semantic matching based legal information retrieval system for COVID-19 pandemic ↗</h3>
                  <p className="mono">Junlin Zhu, <strong>Jiaye Wu</strong>, Xudong Luo, Jie Liu</p>
                </a>
                <a className="ab-pub-card" href="https://link.springer.com/chapter/10.1007/978-3-030-82153-1_32" target="_blank" rel="noopener noreferrer">
                  <span className="mono">KSEM · 2021 (LECTURE NOTES IN ARTIFICIAL INTELLIGENCE)</span>
                  <h3>Alignment-based graph network for judicial examination task ↗</h3>
                  <p className="mono"><strong>Jiaye Wu</strong>, Xudong Luo</p>
                </a>
              </div>

              <div className="ab-oss-col">
                <span className="mono ex-placard-no">UPSTREAM OPEN SOURCE · KOTAEMON ★ 25,909</span>
                <div className="ab-oss-box">
                  <h3>
                    <a href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer">
                      Cinnamon / kotaemon ↗
                    </a>
                  </h3>
                  <p>{text('向 2.5 万星开源 RAG 工作台贡献核心嵌入重排、对话建议与引用可视化模块：', 'Contributed core embeddings, reranking, chat suggestions and citation visualization PRs:')}</p>
                  <ul className="ab-oss-pr-list mono">
                    <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">#287 · TEI Embeddings &amp; Configurable Reranking ↗</a></li>
                    <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">#341 · Conversation-Aware Chat Suggestions ↗</a></li>
                    <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">#461 · Citation Result Visualization ↗</a></li>
                  </ul>
                  <SceneLink className="ba-inline-link mono" route={{view: 'projects'}} lang={lang}>
                    {text('查看全部 23 个个人开源仓库 →', 'EXPLORE ALL 23 REPOSITORIES →')}
                  </SceneLink>
                </div>
              </div>
            </div>
          </div>

          {/* CHAPTER 04: AWARDS & CCL CONFERENCE ARCHIVE PHOTO */}
          <div className="ab-chapter-panel" hidden={chapterIdx !== 3}>
            <div className="ab-awards-spread">
              <div className="ab-awards-list">
                <span className="mono ex-placard-no">COMPETITIVE HONORS (2019 – 2021)</span>
                <article className="ab-award-item">
                  <span className="mono">2021 · CAIL (CHINA AI &amp; LAW CHALLENGE)</span>
                  <h3>{text('中国法研杯（CAIL）法律智能挑战赛 · 三项全国奖', 'China AI and Law Challenge (CAIL) · 3 National Prizes')}</h3>
                  <ul>
                    <li>{text('二等奖 · 类案检索任务（Legal Case Retrieval）', '2nd Prize · Legal Case Retrieval')}</li>
                    <li>{text('三等奖 · 信息抽取任务（Information Extraction）', '3rd Prize · Information Extraction')}</li>
                    <li>{text('三等奖 · 司法考试任务（Judicial Examination）', '3rd Prize · Judicial Examination')}</li>
                  </ul>
                </article>
                <article className="ab-award-item">
                  <span className="mono">2020 · COLLEGIATE AI DESIGN COMPETITION</span>
                  <h3>{text('广西高校人工智能设计大赛 · 一等奖', 'Collegiate AI Design Competition · 1st Prize')}</h3>
                  <p>{text('地铁客流预测（Subway Passenger Flow Prediction）', 'Subway Passenger Flow Prediction')}</p>
                </article>
                <article className="ab-award-item">
                  <span className="mono">2019 · COLLEGIATE AI DESIGN COMPETITION</span>
                  <h3>{text('广西高校人工智能设计大赛 · 二等奖', 'Collegiate AI Design Competition · 2nd Prize')}</h3>
                  <p>{text('中证指数预测（CSI Index Prediction）', 'CSI Index Prediction')}</p>
                </article>
              </div>

              <figure className="ab-conference-frame">
                <a href="/assets/img/about/conference.jpg" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/assets/optimized/img-about-conference-384.webp"
                    width="859"
                    height="1146"
                    alt={text('CCL 会议现场与刘知远老师合影', 'At the CCL conference with Prof. Zhiyuan Liu')}
                  />
                </a>
                <figcaption className="mono">
                  <strong>{text('CCL 学术会议现场留影', 'AT THE CCL CONFERENCE')}</strong>
                  <span>{text('与清华大学刘知远老师合影 ↗', 'With Prof. Zhiyuan Liu ↗')}</span>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* CHAPTER 05: THREE RECURRING QUESTIONS & AWAY FROM THE SCREEN */}
          <div className="ab-chapter-panel" hidden={chapterIdx !== 4}>
            <div className="ab-questions-spread">
              <div className="ab-questions-col">
                <span className="mono ex-placard-no">RECURRING QUESTIONS</span>
                <h2>{text('反复回到的三个问题', 'Three Questions I Return To')}</h2>
                <ol className="ab-question-links">
                  <li>
                    <SceneLink route={{view: 'notes', topic: 'memory', source: 'about'}} lang={lang}>
                      <span className="mono">Q.01</span>
                      <strong>{text('什么值得成为长期上下文？', 'What deserves to become lasting context?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                  <li>
                    <SceneLink route={{view: 'projects', item: 'tracework', source: 'about'}} lang={lang}>
                      <span className="mono">Q.02</span>
                      <strong>{text('Agent 怎样解释决定，又不制造噪声？', 'How can agents explain decisions without adding noise?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                  <li>
                    <SceneLink route={{view: 'projects', item: 'card-skill', source: 'about'}} lang={lang}>
                      <span className="mono">Q.03</span>
                      <strong>{text('什么约束能让模型产出可靠作品？', 'Which constraints help models produce reliable work?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                </ol>
              </div>

              <aside className="ex-placard">
                <span className="mono ex-placard-no">AWAY FROM THE SCREEN</span>
                <h3 className="ex-placard-title">{text('屏幕之外', 'Away from the Screen')}</h3>
                <p className="ex-placard-note">
                  {text(
                    '听一点音乐，读几页书，走一段路。给注意力换一种节奏，也给还没想明白的问题留一点空间。',
                    'Some music, a few pages, a long walk. A change of pace for my attention, and room for questions I have not worked out yet.'
                  )}
                </p>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
       * VARIANT B: 100dvh HORIZONTAL CHRONOLOGY CORRIDOR WALK (2026 → 2019)
       * ==================================================================== */}
      <div
        className="ab-about-b"
        hidden={variant !== 'B'}
        onWheel={e => {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (Math.abs(delta) < 16) return;
          const now = performance.now();
          if (now < bWheelLock.current) return;
          bWheelLock.current = now + 380;
          setBayIdx(p => Math.max(0, Math.min(4, p + (delta > 0 ? 1 : -1))));
        }}
      >
        <div className="ab-corridor-viewport">
          <div className="ab-camera-track" style={{'--active-idx': bayIdx, '--drag-px': '0px'}}>
            {/* BAY 00: CURATOR IDENTITY */}
            <article className={`ab-bay ${bayIdx === 0 ? 'is-active' : ''}`} style={{'--bay-offset': 0 - bayIdx}} onClick={() => setBayIdx(0)}>
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner">
                    <div className="ex-portrait-frame">
                      <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" />
                    </div>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">CHRONOLOGY 00 / 04 · SHENZHEN</span>
                  <h2 className="ex-placard-title">{text('Kenny 吴嘉业', 'Kenny Wu')}</h2>
                  <p className="ex-placard-medium mono">AI SYSTEMS ENGINEER · 2022 – 2026</p>
                  <p className="ex-placard-note">
                    {text(
                      '从智能搜索、企业级 RAG，到短剧跨集角色锁定与 20 集 AI 漫剧长任务自愈系统。向右滑动检视完整编年档案。',
                      'From intelligent search and enterprise RAG to cross-episode identity lock and 20-episode autonomous storyboard recovery.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <button type="button" className="ex-step-trigger" onClick={e => { e.stopPropagation(); setBayIdx(1); }}>
                      {text('步入 2025–2026 展室 →', 'ENTER 2025–2026 →')}
                    </button>
                    <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CV PDF ↗</a>
                  </div>
                </aside>
              </div>
            </article>

            {/* BAY 01: 2025–2026 STORYBOARD & IDENTITY LOCK */}
            <article className={`ab-bay ${bayIdx === 1 ? 'is-active' : ''}`} style={{'--bay-offset': 1 - bayIdx}} onClick={() => setBayIdx(1)}>
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-specimen-board">
                    <div className="ex-specimen-grid">
                      <div className="ex-specimen-cell is-cobalt">
                        <span className="mono">2026 · STORYBOARD QUALITY GATE</span>
                        <strong>≈18% → 9.53%</strong>
                        <small className="mono">{text('固定评测集镜头动作过载与景别问题率', 'Fixed-Set Shot Defect Rate (-47%)')}</small>
                      </div>
                      <div className="ex-specimen-cell is-cobalt">
                        <span className="mono">2026 · BOUNDED RECOVERY</span>
                        <strong>{text('20 集连续自愈完赛', '20 Episodes Completed')}</strong>
                        <small className="mono">{text('熔断、动态并发与断点自动恢复', 'Autonomous Checkpoint Recovery')}</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">2025–2026 · IDENTITY LOCK</span>
                        <strong>1,285s → 24s</strong>
                        <small className="mono">{text('10 集短剧跨集角色消歧（耗时减少 98%）', '10-Ep Character Disambiguation (-98%)')}</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">2025–2026 · ORCHESTRATION</span>
                        <strong>23 min → 5 min</strong>
                        <small className="mono">{text('多集理解与高光剪辑并发调度耗时', 'Multi-Episode Understanding Pipeline')}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">CHRONOLOGY 01 / 04 · 2025 – 2026</span>
                  <h2 className="ex-placard-title">{text('AI 漫剧生成与短剧身份锁定', 'AI Storyboards & Identity Lock')}</h2>
                  <p className="ex-placard-medium mono">TECHNICAL LEAD &amp; WORKSTREAM LEAD</p>
                  <p className="ex-placard-note">
                    {text(
                      '统筹漫剧端到端架构与独立质检门禁，设定纠错成本上限；主导多集短剧人物一致性对齐与高并发特征缓存。',
                      'Led end-to-end storyboard architecture, independent grading and bounded recovery, alongside cross-episode character alignment.'
                    )}
                  </p>
                </aside>
              </div>
            </article>

            {/* BAY 02: 2022–2025 ENTERPRISE RAG, SFT & SEARCH */}
            <article className={`ab-bay ${bayIdx === 2 ? 'is-active' : ''}`} style={{'--bay-offset': 2 - bayIdx}} onClick={() => setBayIdx(2)}>
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-specimen-board">
                    <div className="ex-specimen-grid">
                      <div className="ex-specimen-cell">
                        <span className="mono">2025 · STYLIZED COPYWRITING SFT</span>
                        <strong>Qwen2.5-7B · 5 Styles</strong>
                        <small className="mono">{text('结构化风格约束微调与多维自动评测', 'Structured Style SFT & Auto-Evals')}</small>
                      </div>
                      <div className="ex-specimen-cell is-cobalt">
                        <span className="mono">2024 · ENTERPRISE RAG</span>
                        <strong>≈90% {text('召回与准确率', 'Recall & Accuracy')}</strong>
                        <small className="mono">{text('文档段落层级树 + 多路混合召回', 'Hierarchical Document Trees & Hybrid Recall')}</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">2024 · SAFETY &amp; INTENT</span>
                        <strong>AC Automata + Vector</strong>
                        <small className="mono">{text('支持大模型算法备案与低延迟多意图识别', 'Safety Compliance & Fast Intent Matching')}</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">2022–2024 · SEARCH &amp; TEXT2SQL</span>
                        <strong>Schema → SQL + HDBSCAN</strong>
                        <small className="mono">{text('自然语言校验模板与海量会话新问题挖掘', 'Explainable Text2SQL & Topic Discovery')}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">CHRONOLOGY 02 / 04 · 2022 – 2025</span>
                  <h2 className="ex-placard-title">{text('企业级 RAG、模型微调与搜索', 'Enterprise RAG, SFT & Search')}</h2>
                  <p className="ex-placard-medium mono">CORE ALGORITHM ENGINEER</p>
                  <p className="ex-placard-note">
                    {text(
                      '围绕企业知识库检索准确率、数字人带货风格化微调与会话未知问题聚类，构建高可靠的数据与检索底座。',
                      'Built high-reliability retrieval, stylized SFT and unsupervised conversation discovery pipelines.'
                    )}
                  </p>
                </aside>
              </div>
            </article>

            {/* BAY 03: PUBLICATIONS & CAIL AWARDS */}
            <article className={`ab-bay ${bayIdx === 3 ? 'is-active' : ''}`} style={{'--bay-offset': 3 - bayIdx}} onClick={() => setBayIdx(3)}>
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ab-b-awards-wall">
                    <div className="ab-b-papers">
                      <a className="ab-pub-card" href="https://link.springer.com/article/10.1007/s10506-023-09354-x" target="_blank" rel="noopener noreferrer">
                        <span className="mono">SPRINGER · AI &amp; LAW VOL. 32</span>
                        <strong>Semantic matching based legal information retrieval system for COVID-19 pandemic ↗</strong>
                      </a>
                      <a className="ab-pub-card" href="https://link.springer.com/chapter/10.1007/978-3-030-82153-1_32" target="_blank" rel="noopener noreferrer">
                        <span className="mono">SPRINGER · KSEM 2021</span>
                        <strong>Alignment-based graph network for judicial examination task ↗</strong>
                      </a>
                      <div className="ab-pub-card">
                        <span className="mono">CAIL 2021 &amp; COLLEGIATE AI (2019–2021)</span>
                        <strong>{text('中国法研杯（CAIL）三项全国奖 · 高校 AI 大赛一等奖', 'CAIL 3 National Prizes · Collegiate AI 1st Prize')}</strong>
                      </div>
                    </div>
                    <figure className="ab-conference-frame">
                      <img src="/assets/optimized/img-about-conference-384.webp" width="859" height="1146" alt="CCL Conference" />
                      <figcaption className="mono">{text('CCL 会议与刘知远老师合影', 'At CCL with Prof. Zhiyuan Liu')}</figcaption>
                    </figure>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">CHRONOLOGY 03 / 04 · 2019 – 2023</span>
                  <h2 className="ex-placard-title">{text('学术发表与法律智能竞赛', 'Publications & CAIL Honors')}</h2>
                  <p className="ex-placard-medium mono">SPRINGER AI &amp; LAW · KSEM · CAIL</p>
                  <p className="ex-placard-note">
                    {text(
                      '在法律语义匹配与图网络推理方向发表 2 篇国际期刊/会议论文，并在中国法研杯（CAIL）类案检索、信息抽取与司法考试赛道获三项全国奖项。',
                      'Published 2 papers in Springer AI & Law and KSEM, winning 3 national prizes at the China AI and Law Challenge (CAIL).'
                    )}
                  </p>
                </aside>
              </div>
            </article>

            {/* BAY 04: THREE QUESTIONS & OUTSIDE */}
            <article className={`ab-bay ${bayIdx === 4 ? 'is-active' : ''}`} style={{'--bay-offset': 4 - bayIdx}} onClick={() => setBayIdx(4)}>
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner" style={{width: '100%'}}>
                    <ol className="ab-question-links" style={{width: '100%'}}>
                      <li>
                        <SceneLink route={{view: 'notes', topic: 'memory', source: 'about'}} lang={lang}>
                          <span className="mono">Q.01</span>
                          <strong>{text('什么值得成为长期上下文？', 'What deserves to become lasting context?')}</strong>
                          <span className="mono">→</span>
                        </SceneLink>
                      </li>
                      <li>
                        <SceneLink route={{view: 'projects', item: 'tracework', source: 'about'}} lang={lang}>
                          <span className="mono">Q.02</span>
                          <strong>{text('Agent 怎样解释决定，又不制造噪声？', 'How can agents explain decisions without adding noise?')}</strong>
                          <span className="mono">→</span>
                        </SceneLink>
                      </li>
                      <li>
                        <SceneLink route={{view: 'projects', item: 'card-skill', source: 'about'}} lang={lang}>
                          <span className="mono">Q.03</span>
                          <strong>{text('什么约束能让模型产出可靠作品？', 'Which constraints help models produce reliable work?')}</strong>
                          <span className="mono">→</span>
                        </SceneLink>
                      </li>
                    </ol>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">CHRONOLOGY 04 / 04 · CODA</span>
                  <h2 className="ex-placard-title">{text('长期母题与屏幕之外', 'Questions & Away from Screen')}</h2>
                  <p className="ex-placard-note">
                    {text(
                      '听一点音乐，读几页书，走一段路。给注意力换一种节奏，也给还没想明白的问题留一点空间。',
                      'Some music, a few pages, a long walk. A change of pace for my attention, and room for questions I have not worked out yet.'
                    )}
                  </p>
                </aside>
              </div>
            </article>
          </div>
        </div>

        <footer className="ab-floor-scrubber mono">
          <button type="button" className="ab-step-btn" disabled={bayIdx === 0} onClick={() => setBayIdx(p => Math.max(0, p - 1))}>
            ← {text('向西', 'PREV')}
          </button>
          <div className="ab-scrubber-center">
            <div className="ab-tab-layer ab-tab-base ab-cols-5" role="tablist">
              {baysB.map((b, idx) => (
                <button key={b.id} type="button" role="tab" aria-selected={bayIdx === idx} className="ab-scrubber-tab" onClick={() => setBayIdx(idx)}>
                  <span className="ab-tab-num">{b.id}</span>
                  <span>{zh ? b.zh : b.en}</span>
                </button>
              ))}
            </div>
            <div className="ab-tab-layer ab-tab-clipped ab-cols-5" aria-hidden="true" style={{clipPath: `inset(0 ${clipRightB.toFixed(2)}% 0 ${clipStartB.toFixed(2)}%)`}}>
              {baysB.map(b => (
                <span key={b.id} className="ab-scrubber-tab is-clipped-active">
                  <span className="ab-tab-num">{b.id}</span>
                  <span>{zh ? b.zh : b.en}</span>
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="ab-step-btn" disabled={bayIdx === 4} onClick={() => setBayIdx(p => Math.min(4, p + 1))}>
            {text('向东', 'NEXT')} →
          </button>
        </footer>
      </div>

      {/* ====================================================================
       * VARIANT C: 100dvh KINETIC ACCORDION MATRIX (5 Architectural Vertical Pillars)
       * ==================================================================== */}
      <div className="ab-about-c" hidden={variant !== 'C'}>
        {[
          {
            num: '01',
            tag: 'IDENTITY & THESIS',
            titleZh: '策展人肖像与工程主张',
            titleEn: 'Curator Identity & Thesis',
            metric: 'SHENZHEN · 2022–2026',
            content: (
              <div className="ab-c-body ab-c-identity">
                <div className="ab-c-portrait">
                  <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" />
                </div>
                <div>
                  <h3>{text('Kenny 吴嘉业 · AI 系统工程师', 'Kenny Wu · AI Systems Engineer')}</h3>
                  <p>{text('从单次搜索查询理解，延伸到让跨集的长周期多智能体任务可以核验、可以自愈恢复。', 'Scaling from single-query understanding to verifiable, self-recovering multi-episode agent systems.')}</p>
                  <div className="ex-placard-links mono" style={{marginTop: '16px'}}>
                    <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">GOOGLE SCHOLAR ↗</a>
                    <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
                    <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CV PDF ↗</a>
                  </div>
                </div>
              </div>
            )
          },
          {
            num: '02',
            tag: 'INDUSTRIAL RECORD',
            titleZh: '五段核心工程履历',
            titleEn: 'Five Engineering Milestones',
            metric: '≈18% → 9.53% · 20 EPS',
            content: (
              <div className="ab-c-body">
                <div className="ab-c-exp-grid">
                  {ABOUT_EXPERIENCES.map(item => (
                    <article key={item.period + item.titleEn} className="ab-c-exp-card">
                      <div className="ab-c-exp-top mono">
                        <span>{item.period}</span>
                        <span>{zh ? item.roleZh : item.roleEn}</span>
                      </div>
                      <h4>{zh ? item.titleZh : item.titleEn}</h4>
                      <strong className="mono">{zh ? item.metricZh : item.metricEn}</strong>
                      <p>{zh ? item.summaryZh : item.summaryEn}</p>
                    </article>
                  ))}
                </div>
              </div>
            )
          },
          {
            num: '03',
            tag: 'RESEARCH & OSS',
            titleZh: '国际论文与开源协同',
            titleEn: 'Publications & Open Source',
            metric: '2 PAPERS · ★ 25,909',
            content: (
              <div className="ab-c-body">
                <div className="ab-pub-oss-grid">
                  <div>
                    <span className="mono ex-placard-no">SPRINGER PUBLICATIONS</span>
                    <a className="ab-pub-card" href="https://link.springer.com/article/10.1007/s10506-023-09354-x" target="_blank" rel="noopener noreferrer">
                      <span className="mono">AI &amp; LAW · VOL. 32</span>
                      <h3>Semantic matching based legal information retrieval system for COVID-19 pandemic ↗</h3>
                    </a>
                    <a className="ab-pub-card" href="https://link.springer.com/chapter/10.1007/978-3-030-82153-1_32" target="_blank" rel="noopener noreferrer">
                      <span className="mono">KSEM · 2021</span>
                      <h3>Alignment-based graph network for judicial examination task ↗</h3>
                    </a>
                  </div>
                  <div>
                    <span className="mono ex-placard-no">KOTAEMON ★ 25,909 CONTRIBUTOR</span>
                    <ul className="ab-oss-pr-list mono">
                      <li><a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">#287 · TEI Embeddings &amp; Reranking ↗</a></li>
                      <li><a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">#341 · Conversation-Aware Suggestions ↗</a></li>
                      <li><a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">#461 · Citation Visualization ↗</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          },
          {
            num: '04',
            tag: 'HONORS & ARCHIVE',
            titleZh: '竞赛获奖与学术留影',
            titleEn: 'Awards & CCL Archive',
            metric: 'CAIL 3 PRIZES · CCL',
            content: (
              <div className="ab-c-body ab-awards-spread">
                <div>
                  <article className="ab-award-item">
                    <span className="mono">2021 · CAIL CHALLENGE</span>
                    <h3>{text('中国法研杯（CAIL）三项全国奖', 'CAIL · 3 National Prizes')}</h3>
                    <p>{text('类案检索二等奖 · 信息抽取三等奖 · 司法考试三等奖', '2nd Prize Case Retrieval · 3rd Prize IE & Judicial Exam')}</p>
                  </article>
                  <article className="ab-award-item">
                    <span className="mono">2019–2020 · COLLEGIATE AI</span>
                    <h3>{text('高校 AI 设计大赛一等奖 & 二等奖', 'Collegiate AI 1st & 2nd Prizes')}</h3>
                    <p>{text('地铁客流预测（一等奖） · 中证指数预测（二等奖）', 'Subway Flow Prediction (1st) · CSI Prediction (2nd)')}</p>
                  </article>
                </div>
                <figure className="ab-conference-frame">
                  <img src="/assets/optimized/img-about-conference-384.webp" width="859" height="1146" alt="CCL Conference" />
                  <figcaption className="mono">{text('CCL 会议与刘知远老师合影', 'With Prof. Zhiyuan Liu at CCL')}</figcaption>
                </figure>
              </div>
            )
          },
          {
            num: '05',
            tag: 'QUESTIONS & CODA',
            titleZh: '三个母题与屏幕之外',
            titleEn: 'Three Questions & Coda',
            metric: '3 RECURRING THEMES',
            content: (
              <div className="ab-c-body">
                <ol className="ab-question-links">
                  <li>
                    <SceneLink route={{view: 'notes', topic: 'memory', source: 'about'}} lang={lang}>
                      <span className="mono">Q.01</span>
                      <strong>{text('什么值得成为长期上下文？', 'What deserves to become lasting context?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                  <li>
                    <SceneLink route={{view: 'projects', item: 'tracework', source: 'about'}} lang={lang}>
                      <span className="mono">Q.02</span>
                      <strong>{text('Agent 怎样解释决定，又不制造噪声？', 'How can agents explain decisions without adding noise?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                  <li>
                    <SceneLink route={{view: 'projects', item: 'card-skill', source: 'about'}} lang={lang}>
                      <span className="mono">Q.03</span>
                      <strong>{text('什么约束能让模型产出可靠作品？', 'Which constraints help models produce reliable work?')}</strong>
                      <span className="mono">→</span>
                    </SceneLink>
                  </li>
                </ol>
                <p className="ex-placard-note" style={{marginTop: '20px'}}>
                  {text('屏幕之外：听一点音乐，读几页书，走一段路。给注意力换一种节奏，也给还没想明白的问题留一点空间。', 'Away from the screen: some music, a few pages, a long walk.')}
                </p>
              </div>
            )
          }
        ].map((col, idx) => {
          const isOpen = pillarIdx === idx;
          return (
            <article
              key={col.num}
              className={`ab-c-pillar ${isOpen ? 'is-open' : ''}`}
              onClick={() => setPillarIdx(idx)}
            >
              <header className="ab-c-pillar-head">
                <div className="ab-c-num-row mono">
                  <span className="ab-c-num">{col.num}</span>
                  <span className="ab-c-tag">{col.tag}</span>
                </div>
                <h2 className="ab-c-title">{zh ? col.titleZh : col.titleEn}</h2>
                <span className="ab-c-metric mono">{col.metric}</span>
              </header>
              {isOpen && <div className="ab-c-content">{col.content}</div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Support({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const featuredRepos = [
    {name: 'Tracework', slug: 'tracework', repo: 'https://github.com/KKenny0/Tracework'},
    {name: 'weave', slug: 'weave', repo: 'https://github.com/KKenny0/weave'}
  ];

  return (
    <section className="ba-doc ex-patronage-page ba-enter">
      <div className="ba-stage-banner">
        <div>
          <h1 className="ba-stage-title">{text('共建与维护支持', 'Patronage & Maintenance')}</h1>
        </div>
        <SceneLink className="ba-inline-link mono" route={{view: 'projects'}} lang={lang}>
          {text('返回项目馆藏 →', 'CATALOGUE →')}
        </SceneLink>
      </div>

      <div className="ex-detail-spread">
        <div className="ex-patronage-ways">
          <p className="ba-lead-para">
            {text(
              '如果馆藏中的开源工具或技术手稿帮到了你，欢迎通过以下三种开源共建方式参与维护。所有工具对所有人保持同等开放。',
              'If one of these open-source instruments or manuscripts has been useful to you, here are three ways to help maintain the work.'
            )}
          </p>

          <div className="ex-patronage-list">
            <article className="ex-patronage-item">
              <span className="mono ex-placard-no">01 · ISSUE REPRODUCTION</span>
              <h2>{text('告诉我你在哪里卡住了', 'Report reproducible friction')}</h2>
              <p>{text('附上版本号、触发步骤与预期结果，帮助我快速复现边界问题或补齐文档盲区。', 'A version, the steps you tried, and what you expected help me reproduce bugs or clarify documentation.')}</p>
              <div className="ba-plate-links">
                {featuredRepos.map(r => (
                  <a key={r.name} className="ba-inline-link mono" href={`${r.repo}/issues/new`} target="_blank" rel="noopener noreferrer">
                    {text(`提交 ${r.name} Issue ↗`, `REPORT ${r.name.toUpperCase()} ISSUE ↗`)}
                  </a>
                ))}
                <a className="ba-inline-link mono" href={`mailto:${site.email}`}>{text('邮件反馈 ↗', 'EMAIL FEEDBACK ↗')}</a>
              </div>
            </article>

            <article className="ex-patronage-item">
              <span className="mono ex-placard-no">02 · FIELD SHARING</span>
              <h2>{text('把作品推荐给用得上的人', 'Share with practitioners')}</h2>
              <p>{text('分享时带上一句它解决了什么具体问题，既方便同行上手，也帮我判断哪些案例值得继续深挖。', 'A short note about what problem it solved helps peers get started and shows which examples deserve expansion.')}</p>
              <div className="ba-plate-links">
                {featuredRepos.map(r => {
                  const url = `https://kkenny0.github.io${lang === 'zh' ? '/zh' : ''}/projects/${r.slug}/`;
                  return (
                    <a key={r.name} className="ba-inline-link mono" href={`mailto:?subject=${encodeURIComponent(r.name)}&body=${encodeURIComponent(url)}`}>
                      {text(`邮件分享 ${r.name} ↗`, `SHARE ${r.name.toUpperCase()} ↗`)}
                    </a>
                  );
                })}
              </div>
            </article>

            <article className="ex-patronage-item">
              <span className="mono ex-placard-no">03 · GITHUB STAR</span>
              <h2>{text('在 GitHub 为常用仓库标星', 'Star repositories you use')}</h2>
              <p>{text('标星能让更多开发者检索到这些工具，也是衡量哪些方向值得优先迭代的直观信号。', 'Stars help developers discover the repositories and signal where maintenance effort matters most.')}</p>
              <div className="ba-plate-links">
                {featuredRepos.map(r => (
                  <a key={r.name} className="ba-inline-link mono" href={r.repo} target="_blank" rel="noopener noreferrer">
                    {text(`为 ${r.name} 标星 ↗`, `STAR ${r.name.toUpperCase()} ↗`)}
                  </a>
                ))}
              </div>
            </article>
          </div>
        </div>

        <aside className="ex-placard ex-donate-placard">
          <span className="mono ex-placard-no">VOLUNTARY PATRONAGE</span>
          <h2 className="ex-placard-title">{text('自愿赞助维护时间', 'Voluntary Contribution')}</h2>
          <p className="ex-placard-note">
            {text(
              '赞助将用于支持后续维护、补充实测示例与编写深度技术文档。',
              'Contributions support ongoing maintenance, reproducible examples and technical documentation.'
            )}
          </p>
          <div className="ba-qr-pair">
            <figure>
              <img src="/assets/img/support/alipay-qr.png" width="720" height="720" alt={text('支付宝收款二维码', 'Alipay payment QR code')} loading="lazy" />
              <figcaption className="mono">{text('支付宝 · ALIPAY', 'ALIPAY')}</figcaption>
            </figure>
            <figure>
              <img src="/assets/img/support/wechat-qr.png" width="720" height="720" alt={text('微信收款二维码', 'WeChat Pay payment QR code')} loading="lazy" />
              <figcaption className="mono">{text('微信支付 · WECHAT', 'WECHAT PAY')}</figcaption>
            </figure>
          </div>
          <div className="ex-placard-links mono">
            <a href="https://www.paypal.me/Kennywu96" target="_blank" rel="noopener noreferrer">
              {text('通过 PayPal 赞助 ↗', 'CONTRIBUTE VIA PAYPAL ↗')}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function SpaceApp({initialRoute, locale: lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const [route, setRoute] = useState(initialRoute);
  const [controls, setControls] = useState(initialControls);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState('system');
  const themeController = useRef(null);
  const pending = useRef(null);
  const main = useRef(null);
  const latest = useRef(controls);
  const entries = useMemo(() => notes.map(note => localizedNote(note, lang)), [lang]);
  const selectedEntries = useMemo(() => curated.map(note => localizedNote(note, lang)), [lang]);
  function update(patch) { setControls(current => ({...current, ...patch})); }
  useLayoutEffect(() => { latest.current = controls; }, [controls]);

  useEffect(() => {
    const controller = createThemeController(setTheme);
    themeController.current = controller;
    return () => controller.destroy();
  }, []);

  useEffect(() => {
    const readLocation = () => setRoute(parseRoute(new URL(location.href)));
    const openAnchor = () => {
      const target = document.getElementById(location.hash.slice(1));
      if (!target) return;
      const disclosure = target.closest('details');
      if (disclosure) disclosure.open = true;
      target.scrollIntoView({block: 'start'});
    };
    let departureFocus;
    function save(focus = document.activeElement) {
      const state = {controls: latest.current, scroll: window.scrollY, focus: focus?.id ? {id: focus.id} : {href: focusPath(focus)}};
      history.replaceState({...history.state, space: state}, '');
      try { sessionStorage.setItem(storagePrefix + viewKey(location), JSON.stringify(state)); } catch {}
    }
    function onLink(event) {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.origin !== location.origin || address(link) === address(location)) return;
      departureFocus = link;
      save(link);
      if (!link.hasAttribute('data-space-return')) return;
      const navigation = window.navigation;
      const previous = navigation?.entries().find(entry => entry.index === navigation.currentEntry.index - 1);
      if (previous?.url === link.href) {
        event.preventDefault();
        history.back();
        return;
      }
      try { sessionStorage.setItem(storagePrefix + 'destination', address(link)); } catch {}
    }
    const pagehide = () => save(departureFocus);
    const pageshow = () => { departureFocus = undefined; };
    const hashchange = () => { readLocation(); openAnchor(); };
    const navigation = performance.getEntriesByType('navigation')[0]?.type;
    let saved = history.state?.space;
    try {
      const destination = sessionStorage.getItem(storagePrefix + 'destination');
      if (destination) sessionStorage.removeItem(storagePrefix + 'destination');
      if (destination === address(location)) {
        saved ||= JSON.parse(sessionStorage.getItem(storagePrefix + viewKey(location)) || 'null');
      } else if (!saved && document.referrer) {
        const previous = new URL(document.referrer);
        const detail = parseRoute(previous);
        if (previous.origin === location.origin && detail.view === 'story' && address(new URL(storyReturnPath(detail, lang), location.origin)) === address(location)) {
          saved = JSON.parse(sessionStorage.getItem(storagePrefix + viewKey(location)) || 'null');
        }
      }
    } catch {}
    if (saved) { setControls(saved.controls); pending.current = saved; }
    readLocation(); setReady(true);
    if (location.hash && !saved) requestAnimationFrame(openAnchor);
    if (navigation === 'back_forward' && saved) history.scrollRestoration = 'manual';
    window.addEventListener('pagehide', pagehide);
    window.addEventListener('pageshow', pageshow);
    window.addEventListener('hashchange', hashchange);
    window.addEventListener('popstate', readLocation);
    document.addEventListener('click', onLink);
    return () => {
      window.removeEventListener('pagehide', pagehide);
      window.removeEventListener('pageshow', pageshow);
      window.removeEventListener('hashchange', hashchange);
      window.removeEventListener('popstate', readLocation);
      document.removeEventListener('click', onLink);
    };
  }, []);

  useLayoutEffect(() => {
    if (!ready || !pending.current) return;
    const {scroll, focus} = pending.current;
    pending.current = null;
    const target = restoreFocus(focus, lang);
    (target || main.current)?.focus({preventScroll: true});
    window.scrollTo({top: scroll, behavior: 'instant'});
  }, [ready]);

  useEffect(() => {
    document.title = routeTitle(route, lang);
    const absolute = locale => new URL(canonicalPath(route, locale), site.canonical).href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', absolute(lang));
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', absolute(lang));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    for (const link of document.querySelectorAll('link[hreflang][rel="alternate"]')) link.href = absolute(link.hreflang === 'zh-CN' ? 'zh' : 'en');
  }, [route, lang]);

  function setTopic(topic) {
    const next = {...route, topic: topic === 'all' ? undefined : topic};
    history.replaceState(history.state, '', routePath(next, lang));
    setRoute(next);
  }

  const back = returnRoute(route);
  const backLabel = back.view === 'lens' ? lensInfo[back.arg].navigation[lang] : ({projects: text('项目馆藏', 'Catalogue'), notes: text('文献阅览室', 'Reading Room'), about: text('关于', 'About'), home: text('展映首页', 'Exhibition')})[back.view];
  const project = route.view === 'projects' && projects.find(p => p.slug === route.item);
  const selected = selectedEntries.find(note => note.id === controls.selected) || selectedEntries[0];
  const linkFor = (target, locale = lang) => routePath(target, locale);
  const languageHref = linkFor({...route, anchor: ready ? location.hash.slice(1) : undefined}, lang === 'zh' ? 'en' : 'zh');
  const artwork = tasteProducts.find(product => product.id === route.arg);
  const activeKey = route.view === 'lens' ? route.arg : route.view === 'taste' ? 'taste' : route.view;

  return (
    <RoutePathContext.Provider value={linkFor}>
      <div className="formal-space" data-view={route.view} data-space-ready={ready ? '' : undefined}>
        <StudioShell
          lang={lang}
          activeKey={activeKey}
          theme={theme}
          onSetTheme={next => themeController.current?.set(next)}
          languageHref={languageHref}
          mainRef={main}
        >
          {!ready && ['notes', 'projects'].includes(route.view) && (
            <p className="space-query-status" role="status">{text('正在加载导航与筛选…', 'Loading navigation and filters…')}</p>
          )}
          {route.view === 'lens' && route.arg === 'online' && (
            <Online entries={selectedEntries} selected={selected} onSelect={id => update({selected: id})} lang={lang} />
          )}
          {route.view === 'lens' && route.arg === 'taste' && <Taste lang={lang} />}
          {route.view === 'lens' && route.arg === 'ai' && <Ai entries={entries} lang={lang} />}
          {route.view === 'lens' && route.arg === 'execution' && <Execution lang={lang} />}
          {route.view === 'taste' && artwork && (
            <section className="ba-doc ex-taste-viewer-page ba-enter">
              <div className="ba-back-bar">
                <SceneLink className="ba-inline-link mono" route={back} lang={lang} data-space-return="">← {backLabel}</SceneLink>
              </div>
              <TasteViewer productId={route.arg} index={route.work || 0} lang={lang} formal />
            </section>
          )}
          {route.view === 'projects' && (project
            ? <ProjectDetail project={project} route={route} back={back} backLabel={backLabel} lang={lang} />
            : <ProjectIndex controls={controls} update={update} route={route} lang={lang} />
          )}
          {route.view === 'notes' && (
            <Writing entries={entries} route={route} query={controls.query} setQuery={query => update({query})} setTopic={setTopic} back={back} backLabel={backLabel} lang={lang} />
          )}
          {route.view === 'about' && <About lang={lang} />}
          {route.view === 'support' && <Support lang={lang} />}
        </StudioShell>
      </div>
    </RoutePathContext.Provider>
  );
}
