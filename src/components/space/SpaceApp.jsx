import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
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

function ProjectMedia({project, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const media = projectVisual[project.slug];
  const image = project.focus || project.image;
  if (project.slug === 'videowipe') {
    return (
      <figure className="space-work-media space-comparison">
        {[['videowipe-before.jpg', text('处理前', 'Before')], ['videowipe-after.jpg', text('处理后', 'After')]].map(([src, label]) => (
          <figure key={src}>
            <Media src={ASSETS + src} alt={text(`${label}的视频帧`, `${label} frame`)} loading="eager" />
            <figcaption>{label}</figcaption>
          </figure>
        ))}
        <figcaption>{text('同一帧视频的字幕清除对照。', 'Subtitle removal on the same video frame.')}</figcaption>
      </figure>
    );
  }
  if (media) return <figure className="space-work-media"><Media src={ASSETS + media.src} alt={text(`${project.name} 的${media.kind === 'poster' ? '海报作品' : '实际界面'}`, `${project.name} ${media.kind === 'poster' ? 'poster output' : 'interface'}`)} loading="eager" /></figure>;
  if (image) return <figure className="space-work-media"><Media src={image.src} width={image.width} height={image.height} alt={text(image.altZh, image.alt)} loading="eager" />{image.caption && <figcaption>{text(image.captionZh, image.caption)}</figcaption>}</figure>;
  if (project.slug === 'script-weaver') {
    return (
      <figure className="space-work-media space-work-flow">
        <ol>{(lang === 'zh' ? ['故事构想', '可编辑剧本', '分镜', '视频提示词'] : ['Story premise', 'Editable script', 'Storyboards', 'Video prompts']).map(step => <li key={step}>{step}</li>)}</ol>
        <figcaption>{text('根据公开仓库说明整理的产物流程。', 'Workflow based on the public repository description.')}</figcaption>
      </figure>
    );
  }
  return null;
}

function ProjectDetail({project, route, back, backLabel, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const story = project.detailUrl && {view: 'story', arg: project.slug, source: 'work', via: route.source, origin: route.via};
  const stars = liveStars(project);
  return (
    <article className="ba-doc ba-enter">
      <div className="ba-back-bar">
        <SceneLink className="ba-inline-link mono" route={back} lang={lang} data-space-return="">← {backLabel}</SceneLink>
      </div>
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">PROJECT / {project.practice.toUpperCase()}</span>
          <h1 className="ba-stage-title">{project.name}</h1>
        </div>
        <span className="mono ba-datum">★ {stars}</span>
      </div>
      <p className="ba-lead-para">{text(project.thesisZh, project.thesis)}</p>
      <ProjectMedia project={project} lang={lang} />
      <p className="ba-lead-para">{text(project.descriptionZh, project.description)}</p>
      <div className="ba-plate-links">
        <a className="ba-inline-link mono" href={project.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
        {project.homepage && <a className="ba-inline-link mono" href={project.homepage} target="_blank" rel="noopener noreferrer">{text('访问产品 ↗', 'VISIT PRODUCT ↗')}</a>}
        {story && <SceneLink className="ba-inline-link mono" data-story-link="" route={story} lang={lang}>{text('阅读长案例 →', 'READ CASE STUDY →')}</SceneLink>}
        {project.slug === 'card-skill' && <SceneLink className="ba-inline-link mono" route={{view: 'taste', arg: 'card-skill'}} lang={lang}>{text('查看作品 →', 'VIEW ARTWORK →')}</SceneLink>}
        {['obsidian-kami', 'kami-reader-companion'].includes(project.slug) && <SceneLink className="ba-inline-link mono" route={{view: 'taste', arg: 'kami-reader'}} lang={lang}>{text('查看阅读界面 →', 'VIEW READING LAYOUTS →')}</SceneLink>}
      </div>
      <p className="mono ba-muted" style={{marginTop: '20px'}}>
        {project.language && `${project.language} · `}{project.archived && text('已归档 · ', 'ARCHIVED · ')}{stars} STARS · {project.forks} FORKS · {text('快照', 'SNAPSHOT')} <time dateTime={githubSnapshot.date}>{githubSnapshot.date}</time>
      </p>
    </article>
  );
}

function ProjectIndex({controls, update, route, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const {query, practice, sort, archived, options} = controls;
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

  return (
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">02. PROJECTS / WORK INDEX</span>
          <h1 className="ba-stage-title">{text('项目台', 'Projects')}</h1>
        </div>
        <span className="mono ba-muted">{matches.length} / {projects.length} REPOS · SNAPSHOT {githubSnapshot.date}</span>
      </div>

      <div className="ba-toolbar">
        <input
          id="project-search"
          type="search"
          className="ba-search"
          value={query}
          onChange={e => update({query: e.target.value})}
          placeholder={text('搜索项目名称或关键词…', 'Search project name or keyword…')}
          aria-label={text('搜索项目', 'Search projects')}
        />
        <div className="ba-filter-pills" role="group" aria-label={text('按方向筛选', 'Filter by practice')}>
          {Object.entries(practices).map(([id, label]) => (
            <button type="button" key={id} aria-pressed={practice === id} className={`mono ${practice === id ? 'is-active' : ''}`} onClick={() => update({practice: id})}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <details className="ba-options" open={options} onToggle={e => update({options: e.currentTarget.open})}>
        <summary>{text('排序与归档', 'SORTING & ARCHIVE')}</summary>
        <div className="ba-options-body">
          <label className="ba-check">
            <input type="checkbox" checked={archived} onChange={e => update({archived: e.target.checked})} />
            {text('包含归档项目', 'Include archived projects')}
          </label>
          <label className="ba-check">
            {text('排序', 'Sort')}
            <select value={sort} onChange={e => update({sort: e.target.value})}>
              <option value="selected">{text('精选', 'Selected')}</option>
              <option value="stars">{text('标星数', 'Stars')}</option>
              <option value="updated">{text('最近更新', 'Recently updated')}</option>
            </select>
          </label>
        </div>
      </details>

      <ul className="ba-index-rows">
        {matches.map((project, idx) => (
          <li key={project.slug}>
            <SceneLink id={project.slug} route={{view: 'projects', item: project.slug, source: 'projects', via: route.source}} lang={lang}>
              <span className="mono ba-row-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="mono ba-row-cat">{practices[project.practice]}</span>
              <div className="ba-row-main">
                <strong>{project.name} {project.archived && <small className="mono">{text('已归档', 'ARCHIVED')}</small>}</strong>
                <p>{text(project.thesisZh, project.thesis)}</p>
              </div>
              <span className="mono ba-row-stat">★ {liveStars(project)} →</span>
            </SceneLink>
          </li>
        ))}
      </ul>
      {!matches.length && <p className="ba-empty">{text('没有匹配的项目。', 'No matching projects.')}</p>}
    </section>
  );
}

function Writing({route, entries, query, setQuery, setTopic, back, backLabel, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const topics = {
    all: text('全部', 'All'),
    ai: text('技术写作', 'Technical writing'),
    memory: text('记忆', 'Memory'),
    context: text('上下文', 'Context'),
    agents: text('智能体', 'Agents')
  };
  const note = entries.find(n => n.id === route.item);

  if (note) {
    return (
      <article className="ba-doc ba-enter">
        <div className="ba-back-bar">
          <SceneLink className="ba-inline-link mono" route={back} lang={lang} data-space-return="">← {backLabel}</SceneLink>
        </div>
        <div className="ba-stage-banner">
          <div>
            <span className="mono ba-kicker">{isTechnicalWriting(note) ? topics.ai : text('观察', 'OBSERVATION')} · <time dateTime={note.date}>{note.date}</time></span>
            <h1 className="ba-stage-title">{note.title}</h1>
          </div>
          <span className="mono ba-datum">{note.source}</span>
        </div>
        <div className="ba-summary-box">
          <span className="mono ba-kicker">{lang === 'zh' ? '摘要' : note.hasEnglishSummary ? 'ENGLISH SUMMARY' : 'CHINESE SUMMARY'}</span>
          <p className="ba-summary-text" lang={lang === 'en' && !note.hasEnglishSummary ? 'zh-CN' : undefined}>{note.teaser}</p>
        </div>
        <div className="ba-plate-links">
          <a className="ba-inline-link mono" href={note.url} hrefLang="zh-CN" target="_blank" rel="noopener noreferrer">
            {note.provisional ? text('在微信阅读中文合集 ↗', 'OPEN WECHAT COLLECTION ↗') : text('在知乎阅读中文原文 ↗', 'READ ON ZHIHU ↗')}
          </a>
          <SceneLink className="ba-inline-link mono" data-space-return="" route={{view: 'notes', topic: route.topic, source: route.source === 'notes' ? route.via : route.source}} lang={lang}>
            {text('浏览文章索引 →', 'BROWSE WRITING INDEX →')}
          </SceneLink>
        </div>
      </article>
    );
  }

  const topic = route.topic || 'all';
  const matches = entries.filter(n =>
    (topic === 'all' || (topic === 'ai' ? isTechnicalWriting(n) : n.topic === topic)) &&
    [n.title, n.originalTitle, n.teaser, n.source, topics[n.topic]].join(' ').toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">03. WRITING / ARCHIVE</span>
          <h1 className="ba-stage-title">{text('观察与文章', 'Writing')}</h1>
        </div>
        <span className="mono ba-muted">{matches.length} ENTRIES</span>
      </div>

      <div className="ba-toolbar">
        <input
          id="writing-search"
          type="search"
          className="ba-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={text('搜索标题或关键词…', 'Search title or keyword…')}
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

      <ul className="ba-index-rows">
        {matches.map(n => (
          <li key={n.id}>
            <SceneLink id={`note-${n.id}`} route={{view: 'notes', item: n.id, source: 'notes', topic: route.topic, via: route.source}} lang={lang}>
              <time dateTime={n.date} className="mono ba-row-num">{n.date}</time>
              <span className="mono ba-row-cat">{n.source}</span>
              <div className="ba-row-main">
                <strong>{n.title}</strong>
                <p>{n.teaser}</p>
              </div>
              <span className="mono ba-row-stat">→</span>
            </SceneLink>
          </li>
        ))}
      </ul>
      {!matches.length && <p className="ba-empty">{text('没有匹配的文章。', 'No matching writing.')}</p>}
    </section>
  );
}

function Online({entries, selected, onSelect, lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const idx = Math.max(0, entries.findIndex(n => n.id === selected.id));
  const activeNote = entries[idx] || entries[0];
  const lens = lensInfo.online;

  return (
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">LENS 01 / ONLINE</span>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <figure className="ba-lens-avatar">
          <Media src={`${ASSETS}${lens.character}`} alt={lens.name} />
        </figure>
      </div>

      <div className="ba-online-split">
        <div className="ba-online-card">
          <span className="mono ba-kicker">{activeNote.date} · {activeNote.source}</span>
          <h2>{activeNote.title}</h2>
          <p>{activeNote.teaser}</p>
          <div className="ba-inline-bar">
            <div className="ba-plate-links">
              <a className="ba-inline-link mono" href={activeNote.url} target="_blank" rel="noopener noreferrer">
                {activeNote.provisional ? text('在合集查看 ↗', 'OPEN COLLECTION ↗') : text('阅读原文 ↗', 'READ ORIGINAL ↗')}
              </a>
              <SceneLink className="ba-inline-link mono" route={{view: 'notes', item: activeNote.id, source: 'online'}} lang={lang}>
                {text('查看摘要 →', 'VIEW SUMMARY →')}
              </SceneLink>
            </div>
            <div className="ba-stepper">
              <button type="button" disabled={idx <= 0} onClick={() => onSelect(entries[Math.max(0, idx - 1)].id)} aria-label={text('较新的观察', 'Newer observation')}>←</button>
              <span className="mono">{String(idx + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
              <button type="button" disabled={idx >= entries.length - 1} onClick={() => onSelect(entries[Math.min(entries.length - 1, idx + 1)].id)} aria-label={text('较早的观察', 'Older observation')}>→</button>
            </div>
          </div>
        </div>

        <ul className="ba-mini-notes ba-selectable-notes">
          {entries.map(n => (
            <li key={n.id}>
              <button type="button" className={n.id === activeNote.id ? 'is-active' : ''} onClick={() => onSelect(n.id)}>
                <time className="mono">{n.date}</time>
                <span>{n.label || n.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ba-plate-links" style={{marginTop: '24px'}}>
        <SceneLink className="ba-inline-link mono" route={{view: 'notes', source: 'online'}} lang={lang}>
          {text('浏览完整观察档案 →', 'EXPLORE FULL ARCHIVE →')}
        </SceneLink>
      </div>
    </section>
  );
}

function Taste({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const lens = lensInfo.taste;
  const descriptions = {
    'kami-reader': text('长文优先。用暖纸色与衬线字拉开正文、图示和侧栏的层次，让侧栏退到读者需要它的时候。', 'Long-form reading comes first. Warm paper and serif text establish a hierarchy between prose, diagrams and a sidebar that stays in the background until needed.'),
    'card-skill': text('先决定读者该看见什么。读书海报保留三条主线，A2A 封面只画交接边界，研究解释图突出阶段顺序。不同信息关系用不同版式。', 'Decide what the reader should see first. The reading poster keeps three threads, the A2A cover shows only the handoff, and the research diagram stresses the sequence of stages. Each layout follows the relationship it needs to show.')
  };

  return (
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">LENS 02 / TASTE</span>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <figure className="ba-lens-avatar">
          <Media src={`${ASSETS}${lens.character}`} alt={lens.name} />
        </figure>
      </div>
      <p className="ba-lead-para">{text('一套版式照顾持续阅读，一套工具帮助选出值得放大的内容。', 'One set of layouts supports sustained reading. The other helps decide what to put in focus.')}</p>

      {[...tasteProducts].reverse().map(product => (
        <section key={product.id} className="ba-taste-section">
          <h2>{product.name}</h2>
          <p className="ba-lead-para" style={{marginBottom: '10px'}}>{descriptions[product.id]}</p>
          <div className="ba-taste-works">
            {product.works.map((work, index) => {
              const [title, description] = lang === 'zh' ? [work.title, work.description] : tasteEnglish[work.image];
              return (
                <SceneLink key={work.id} className="ba-taste-work-card" route={{view: 'taste', arg: product.id, work: index}} lang={lang}>
                  <Media src={ASSETS + work.image} alt="" loading={product.id === 'kami-reader' ? 'eager' : 'lazy'} />
                  <strong>{title} <span aria-hidden="true">→</span></strong>
                  <p>{description}</p>
                </SceneLink>
              );
            })}
          </div>
        </section>
      ))}

      <div className="ba-plate-links" style={{marginTop: '26px'}}>
        <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'taste'}} lang={lang}>
          {text('浏览全部项目 →', 'BROWSE ALL PROJECTS →')}
        </SceneLink>
      </div>
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
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">LENS 03 / AI</span>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <figure className="ba-lens-avatar">
          <Media src={`${ASSETS}${lens.character}`} alt={lens.name} />
        </figure>
      </div>

      <div className="ba-ai-grid">
        <div>
          <span className="mono ba-kicker">{text('GitHub 项目', 'GITHUB PROJECTS')}</span>
          <article className="ba-plate" style={{marginTop: '14px'}}>
            <div className="ba-plate-head">
              <span className="mono">SCHEMATIC</span>
              <span className="mono">★ {liveStars(scriptWeaver)}</span>
            </div>
            <h3>Script-Weaver</h3>
            <div className="ba-schematic">
              <span>PREMISE</span><i>→</i><span>SCRIPT</span><i>→</i><span>BOARDS</span>
            </div>
            <p>{text(scriptWeaver.thesisZh, scriptWeaver.thesis)}</p>
            <div className="ba-plate-links">
              <SceneLink className="ba-inline-link mono" route={{view: 'projects', item: 'script-weaver', source: 'ai'}} lang={lang}>{text('项目详情 →', 'PROJECT DETAILS →')}</SceneLink>
              <a className="ba-inline-link mono" href={scriptWeaver.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            </div>
          </article>

          <article className="ba-plate" style={{marginTop: '16px'}}>
            <div className="ba-plate-head">
              <span className="mono">INTERACTIVE DEMO</span>
              <span className="mono">★ {liveStars(videowipe)}</span>
            </div>
            <h3>VideoWipe</h3>
            <div className="ba-mat">
              <VideoWipeCompare text={text} />
            </div>
            <p>{text(videowipe.thesisZh, videowipe.thesis)}</p>
            <div className="ba-plate-links">
              <SceneLink className="ba-inline-link mono" route={{view: 'projects', item: 'videowipe', source: 'ai'}} lang={lang}>{text('项目详情 →', 'PROJECT DETAILS →')}</SceneLink>
              <a className="ba-inline-link mono" href={videowipe.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            </div>
          </article>
        </div>

        <div>
          <span className="mono ba-kicker">{text('技术写作', 'TECHNICAL WRITING')}</span>
          <div className="ba-essay-stack">
            {aiWritings.map((note, idx) => (
              <SceneLink key={note.id} className="ba-essay-card" route={{view: 'notes', item: note.id, source: 'ai'}} lang={lang}>
                <span className="mono ba-kicker">ESSAY 0{idx + 1} · {note.date}</span>
                <h3>{note.title}</h3>
                <p>{note.teaser}</p>
                <span className="mono ba-muted">{note.source} →</span>
              </SceneLink>
            ))}
          </div>
          <div className="ba-plate-links" style={{marginTop: '20px'}}>
            <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'ai'}} lang={lang}>{text('全部项目 →', 'ALL PROJECTS →')}</SceneLink>
            <SceneLink className="ba-inline-link mono" route={{view: 'notes', source: 'ai', topic: 'ai'}} lang={lang}>{text('全部技术写作 →', 'ALL TECHNICAL WRITING →')}</SceneLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Execution({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  const lens = lensInfo.execution;
  const evidence = anchor => ({view: 'about', source: 'execution', anchor});

  return (
    <article className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">LENS 04 / EXECUTION</span>
          <h1 className="ba-stage-title">{lens.navigation[lang]}</h1>
        </div>
        <div className="ba-banner-right">
          <span className="mono ba-datum">( 2022 — 2026 )</span>
          <figure className="ba-lens-avatar">
            <Media src={`${ASSETS}${lens.character}`} alt={lens.name} />
          </figure>
        </div>
      </div>

      <h2 style={{margin: '0 0 12px', font: '500 clamp(22px, 2.8vw, 32px)/1.2 var(--display-serif)'}}>
        {text('一次长任务，怎么恢复并确认完成？', 'How does a long run recover and reach completion?')}
      </h2>
      <p className="ba-lead-para">
        {text(
          '2026 年，我负责 AI 漫剧生成系统的技术方案、质量评估和验收标准。中间报错需要有界恢复，生成结果也需要独立检查。',
          'In 2026 I led the technical design, quality evaluation and acceptance criteria for an AI comics generation system. Mid-run failures needed bounded recovery. The output needed independent checks.'
        )}
      </p>

      <ol className="ba-exec-steps">
        {(lang === 'zh'
          ? ['理解剧本', '提取角色资产', '生成结构化多镜头分镜', '独立质检与有界纠错']
          : ['Understand the script', 'Extract character assets', 'Generate structured multi-shot storyboards', 'Grade quality and bound corrections']
        ).map((step, i) => (
          <li key={step}>
            <span className="mono ba-kicker">STAGE 0{i + 1}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>

      <p className="ba-lead-para">
        {text(
          '质量侧把分镜质检打分独立出来，并为自动纠错设定成本上限。运行侧通过熔断、动态并发和断点恢复处理长任务中的偶发故障。固定集评估检查了分镜问题率，长任务实测记录了报错后能否把这一轮跑完。',
          'For output quality, we graded storyboards independently and capped the cost of automatic correction. For runtime failures, we used circuit breaking, dynamic concurrency and bounded checkpoint recovery. The fixed set measured storyboard quality. The long run recorded whether that particular batch finished after errors.'
        )}
      </p>

      <div className="ba-exec-stats">
        <div className="ba-stat-box">
          <span className="mono ba-kicker">{text('固定评测集', 'FIXED EVALUATION SET')}</span>
          <strong>≈18% → 9.53%</strong>
          <span>{text('同一固定集合上的动作过载与景别失当问题率。', 'Rate of overloaded action and unsuitable shot scale on the same fixed set.')}</span>
          <SceneLink className="ba-inline-link mono" route={evidence('storyboard-evaluation')} lang={lang}>
            {text('查看公开履历中的评测记录 →', 'SEE EVALUATION ENTRY →')}
          </SceneLink>
        </div>
        <div className="ba-stat-box">
          <span className="mono ba-kicker">{text('单次长任务实测', 'ONE LONG-RUN TEST')}</span>
          <strong>{text('20 集', '20 episodes')}</strong>
          <span>{text('一次实际运行，中途报错后自动恢复并跑完全部 20 集。', 'One observed run recovered from intermediate failures and completed all 20 episodes.')}</span>
          <SceneLink className="ba-inline-link mono" route={evidence('storyboard-recovery')} lang={lang}>
            {text('查看公开履历中的恢复记录 →', 'SEE RECOVERY ENTRY →')}
          </SceneLink>
        </div>
      </div>

      <p className="ba-lead-para" style={{fontSize: '13.5px', marginTop: '18px'}}>
        {text(
          '公开材料是个人履历。评测样本量、原始打分、运行日志和故障明细未公开。两条记录可核对网页引用和各自口径。单次运行不足以估算长期成功率。',
          'The public source is my work record. It provides no sample count, raw scores, run logs or incident details. The linked entries let readers check the wording and scope. One run cannot establish a long-run success rate.'
        )}
      </p>

      <div className="ba-plate-links">
        <SceneLink className="ba-inline-link mono" route={evidence('storyboard-generation')} lang={lang}>{text('查看技术职责 →', 'SEE TECHNICAL RESPONSIBILITIES →')}</SceneLink>
        <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'execution'}} lang={lang}>{text('浏览项目台 →', 'BROWSE PROJECTS →')}</SceneLink>
      </div>
    </article>
  );
}

function About({lang}) {
  const text = (zh, en) => localized(lang, zh, en);
  function rewriteHref(href) {
    if (href.endsWith('/projects/#tracework')) return routePath({view: 'projects', item: 'tracework', source: 'about'}, lang);
    if (href.endsWith('/projects/#card-skill')) return routePath({view: 'projects', item: 'card-skill', source: 'about'}, lang);
    if (href === '/notes/?topic=memory') return routePath({view: 'notes', topic: 'memory', source: 'about'}, lang);
    return href;
  }

  return (
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">01. ABOUT / PROFILE &amp; RECORD</span>
          <h1 className="ba-stage-title">{text('关于 Kenny 吴嘉业', 'About Kenny Wu')}</h1>
        </div>
        <div className="ba-banner-right">
          <span className="mono ba-datum">( 2022 — 2026 )</span>
          <a className="ba-inline-link mono" href={`mailto:${site.email}`}>EMAIL ↗</a>
        </div>
      </div>

      <div className="ba-about-lead">
        <p className="ba-lead-para">
          {text(
            '我在深圳做 AI 工程。早期做智能搜索和会话分析，后来负责企业问答与交互质量，再到短剧剪辑和 AI 漫剧生成。工作从理解一次查询，延伸到让跨集的任务可以核验、可以恢复。',
            'I’m an AI engineer in Shenzhen. I started in intelligent search and conversation analysis, worked on enterprise Q&A and interaction quality, and moved into short-drama editing and AI comics generation. The work grew from understanding a single query to making multi-episode jobs verifiable and recoverable.'
          )}
        </p>
        <div className="ba-about-coords mono">
          <span>{text('坐标 · 深圳', 'SHENZHEN · AI ENGINEER')}</span>
          <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">GOOGLE SCHOLAR ↗</a>
          <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
          <a href="/assets/files/curriculum_vitae.pdf" target="_blank" rel="noopener noreferrer">CV ↗</a>
        </div>
        <div className="ba-decisions-box">
          <span className="mono ba-kicker">{text('我负责的工程判断', 'DECISIONS I’M RESPONSIBLE FOR')}</span>
          <p>
            {text(
              '企业问答里，我用文档层级和多路召回来处理检索；短剧剪辑里，我负责跨集角色对齐；漫剧生成里，我负责决定怎么验收分镜，以及失败后允许花多少成本纠错。这些工作把“模型输出是否可用”落到可以检查的环节。',
              'In enterprise Q&A, I used document hierarchy and multiple retrieval paths. In short-drama editing, I led cross-episode character alignment. In AI comics generation, I owned storyboard acceptance criteria and the bounds on corrective work. Each role gave me a concrete place to check whether the model’s output was usable.'
            )}
          </p>
          <div className="ba-plate-links">
            <SceneLink className="ba-inline-link mono" route={{view: 'lens', arg: 'execution', source: 'about'}} lang={lang}>
              {text('看漫剧生成案例 →', 'READ COMICS GENERATION CASE →')}
            </SceneLink>
            <SceneLink className="ba-inline-link mono" route={{view: 'projects', source: 'about'}} lang={lang}>
              {text('浏览公开项目 →', 'EXPLORE PUBLIC PROJECTS →')}
            </SceneLink>
          </div>
        </div>
      </div>

      <div className="ba-about-record">
        <AboutMore lang={lang} visible rewriteHref={rewriteHref} />
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
    <section className="ba-doc ba-enter">
      <div className="ba-stage-banner">
        <div>
          <span className="mono ba-kicker">04. SUPPORT / MAINTAIN THE WORK</span>
          <h1 className="ba-stage-title">{text('参与维护这些项目', 'Help maintain the work')}</h1>
        </div>
        <SceneLink className="ba-inline-link mono" route={{view: 'projects'}} lang={lang}>
          {text('查看项目台 →', 'PROJECTS →')}
        </SceneLink>
      </div>

      <p className="ba-lead-para">
        {text(
          '如果这里的作品帮到了你，可以用下面这些方式支持后续维护。所有人都可以同样使用这些工具。',
          'If one of my projects has been useful to you, here are a few ways to help me maintain the work. Everyone has the same access to the tools.'
        )}
      </p>

      <div className="ba-support-grid">
        <div className="ba-support-col">
          <span className="mono ba-kicker">{text('方式 01 / 反馈、分享与标星', 'WAY 01 / FEEDBACK, SHARING & STARS')}</span>
          <article className="ba-support-item">
            <h2>{text('告诉我你在哪里卡住了', 'Tell me where you got stuck')}</h2>
            <p>{text('附上版本、操作步骤和预期结果，能帮我复现问题，或找出文档里没写清楚的地方。', 'A version, the steps you tried, and what you expected help me reproduce a bug or fix an unclear instruction.')}</p>
            <div className="ba-plate-links">
              {featuredRepos.map(r => (
                <a key={r.name} className="ba-inline-link mono" href={`${r.repo}/issues/new`} target="_blank" rel="noopener noreferrer">
                  {text(`反馈 ${r.name} 的问题 ↗`, `REPORT ${r.name.toUpperCase()} ISSUE ↗`)}
                </a>
              ))}
              <a className="ba-inline-link mono" href={`mailto:${site.email}`}>{text('通过邮件反馈其他项目 ↗', 'EMAIL FEEDBACK ↗')}</a>
            </div>
          </article>

          <article className="ba-support-item">
            <h2>{text('把作品分享给用得上的人', 'Share a project with someone who needs it')}</h2>
            <p>{text('分享时带上一句它解决了什么问题，能让对方更容易上手，也帮我判断哪些例子值得补进文档。', 'A short note about why it helped gives someone a place to start and helps me see which examples deserve more documentation.')}</p>
            <div className="ba-plate-links">
              {featuredRepos.map(r => {
                const url = `https://kkenny0.github.io${lang === 'zh' ? '/zh' : ''}/projects/${r.slug}/`;
                return (
                  <a key={r.name} className="ba-inline-link mono" href={`mailto:?subject=${encodeURIComponent(r.name)}&body=${encodeURIComponent(url)}`}>
                    {text(`通过邮件分享 ${r.name} ↗`, `SHARE ${r.name.toUpperCase()} BY EMAIL ↗`)}
                  </a>
                );
              })}
            </div>
          </article>

          <article className="ba-support-item">
            <h2>{text('给用过的项目标星', 'Star a project you use')}</h2>
            <p>{text('标星让更多人找到仓库，也让我大致知道哪些项目有人关注。', 'Stars help people find the repositories and give me a rough signal of where there is interest.')}</p>
            <div className="ba-plate-links">
              {featuredRepos.map(r => (
                <a key={r.name} className="ba-inline-link mono" href={r.repo} target="_blank" rel="noopener noreferrer">
                  {text(`在 GitHub 给 ${r.name} 标星 ↗`, `STAR ${r.name.toUpperCase()} ON GITHUB ↗`)}
                </a>
              ))}
            </div>
          </article>
        </div>

        <div className="ba-support-col ba-support-donate">
          <span className="mono ba-kicker">{text('方式 02 / 自愿捐助', 'WAY 02 / VOLUNTARY CONTRIBUTION')}</span>
          <p>{text('捐助支持我继续投入维护、补充示例和编写文档。所有人都可以同样使用这些工具。', 'Contributions support time for maintenance, examples and documentation. Everyone has the same access to the tools.')}</p>
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
          <a className="ba-inline-link mono" href="https://www.paypal.me/Kennywu96" target="_blank" rel="noopener noreferrer">
            {text('通过 PayPal 捐助 ↗', 'CONTRIBUTE VIA PAYPAL ↗')}
          </a>
        </div>
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
  const backLabel = back.view === 'lens' ? lensInfo[back.arg].navigation[lang] : ({projects: text('项目台', 'Projects'), notes: text('文章', 'Writing'), about: text('关于', 'About'), home: text('首页', 'Home')})[back.view];
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
            <section className="ba-doc ba-enter">
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
