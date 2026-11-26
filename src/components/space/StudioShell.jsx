import React, {memo, useRef, useState} from 'react';
import {lensInfo} from '../../data/space';
import {prototypeText} from '../../data/space-i18n';
import metrics from '../../data/collage-metrics.json';
import {site} from '../../data/site';
import {Media} from './Media';
import {SceneLink} from './SceneLink';

export const ASSETS = '/assets/space/';
export const LENS_KEYS = ['online', 'taste', 'ai', 'execution'];

export function liveStars(project) {
  const repoKey = project.url?.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  return (repoKey && metrics[repoKey]?.stars) ?? metrics[`KKenny0/${project.slug}`]?.stars ?? project.stars;
}

/**
 * Optical Eraser Loupe + Curtain Split comparison for VideoWipe.
 * - Default 'loupe' mode: cursor becomes a circular optical lens that erases burned-in subtitles in real time.
 * - 'curtain' mode: full-height vertical split wipe.
 */
export const VideoWipeCompare = memo(function VideoWipeCompare({
  text,
  inputId = 'cg-comparison',
  loading = 'eager',
  sizes = '(max-width: 760px) 94vw, (max-width: 1280px) 86vw, 1180px'
}) {
  const [mode, setMode] = useState('loupe');
  const [pos, setPos] = useState({x: 54, y: 67});
  const touch = useRef(null);

  function updateFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(90, Math.max(10, ((event.clientY - rect.top) / rect.height) * 100)));
    setPos(current => current.x === x && current.y === y ? current : {x, y});
  }

  function handlePointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.pointerType === 'touch') {
      touch.current = {id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false};
    } else if (mode === 'curtain') {
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    }
  }

  function handlePointerMove(event) {
    if (!event.isPrimary) return;
    if (event.pointerType === 'touch') {
      const gesture = touch.current;
      if (gesture?.id !== event.pointerId) return;
      if (!gesture.dragging) {
        const dx = Math.abs(event.clientX - gesture.x);
        const dy = Math.abs(event.clientY - gesture.y);
        if (dx < 8 || dx <= dy) return;
        gesture.dragging = true;
      }
    } else if (mode === 'curtain' && event.buttons !== 1) return;
    updateFromPointer(event);
  }

  function endTouch(event) {
    if (touch.current?.id === event.pointerId) touch.current = null;
  }

  return (
    <div className={`ba-compare is-${mode}`}>
      <div className="ba-compare-preview">
        <div
          className="ba-compare-stage"
          style={{
            '--ba-split': `${pos.x}%`,
            '--loupe-x': `${pos.x}%`,
            '--loupe-y': `${pos.y}%`
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endTouch}
          onPointerCancel={endTouch}
          onLostPointerCapture={endTouch}
          onClick={updateFromPointer}
        >
          <Media
            src={`${ASSETS}videowipe-before.jpg`}
            alt={text('处理前：画面带烧录字幕', 'Before: burned-in subtitles')}
            loading={loading}
            draggable={false}
            sizes={sizes}
          />
          <Media
            className="ba-compare-after"
            src={`${ASSETS}videowipe-after.jpg`}
            alt={text('处理后：字幕被清除', 'After: subtitles removed')}
            loading={loading}
            draggable={false}
            sizes={sizes}
          />

          {mode === 'loupe' ? (
            <span className="ba-loupe-ring" aria-hidden="true">
              <span className="ba-loupe-crosshair" />
              <span className="ba-loupe-tag mono">{text('消字透镜 · 实时抹除', 'ERASER LOUPE · LIVE')}</span>
            </span>
          ) : (
            <span className="ba-compare-line" aria-hidden="true">
              <span className="ba-compare-knob" />
            </span>
          )}
        </div>

        <div className="ba-compare-captions">
          <span className="ba-compare-tag ba-tag-before mono">{text('原画 · 带烧录字幕', 'ORIGINAL · SUBTITLED')}</span>
          <span className="ba-compare-tag ba-tag-after mono">
            {mode === 'loupe' ? text('移动鼠标、轻点或横拖检视', 'MOVE, TAP OR DRAG TO INSPECT') : text('处理后 · 字幕已清除', 'CLEANED · SUBTITLE-FREE')}
          </span>
        </div>
      </div>

      <div className="ba-compare-bar">
        <div className="ba-mode-switch" role="group" aria-label={text('检视模式', 'Inspection mode')}>
          <button
            type="button"
            className={`mono ${mode === 'loupe' ? 'is-active' : ''}`}
            aria-pressed={mode === 'loupe'}
            onClick={() => setMode('loupe')}
          >
            ◎ {text('光学透镜', 'OPTICAL LOUPE')}
          </button>
          <button
            type="button"
            className={`mono ${mode === 'curtain' ? 'is-active' : ''}`}
            aria-pressed={mode === 'curtain'}
            onClick={() => setMode('curtain')}
          >
            ▥ {text('全幅拉幕', 'SPLIT CURTAIN')}
          </button>
        </div>

        <label className="ba-range-wrap" htmlFor={inputId}>
          <span className="mono">{text('拖动或使用方向键比较', 'Drag or use arrow keys to compare')}</span>
          <input
            id={inputId}
            type="range"
            min="0"
            max="100"
            value={pos.x}
            aria-label={text('字幕清除前后对比', 'Before and after subtitle removal')}
            onChange={event => {
              const x = Number(event.target.value);
              setPos(current => ({...current, x}));
            }}
          />
        </label>
      </div>
    </div>
  );
});

export function StudioShell({lang, activeKey, theme, onSetTheme, languageHref, mainRef, children}) {
  const zh = lang === 'zh';
  const text = (chinese, english) => prototypeText(lang, chinese, english);

  const pageNav = [
    {id: 'home', route: {view: 'home', arg: ''}, num: '00', label: text('展映', 'Home')},
    {id: 'about', route: {view: 'about'}, num: '01', label: text('关于', 'About')},
    {id: 'projects', route: {view: 'projects'}, num: '02', label: text('项目', 'Projects')},
    {id: 'notes', route: {view: 'notes'}, num: '03', label: text('文章', 'Writing')},
    {id: 'support', route: {view: 'support'}, num: '04', label: text('支持', 'Support')}
  ];

  const themeOptions = [
    {id: 'system', short: text('系统', 'Auto'), label: text('跟随系统', 'System theme')},
    {id: 'light', short: text('亮', 'L'), label: text('亮色', 'Light theme')},
    {id: 'dark', short: text('暗', 'D'), label: text('暗色', 'Dark theme')}
  ];

  return (
    <div className="ba-shell" data-view={activeKey}>
      {/* Avant-Garde Top Editorial Masthead (Zero Left-Sidebar Clutter) */}
      <header className="ba-masthead">
        <div className="ba-masthead-brand">
          <SceneLink className="ba-wordmark" route={{view: 'home', arg: ''}} lang={lang}>
            Kenny Wu
          </SceneLink>
          <span className="mono ba-coords">SHENZHEN · AI ENGINEER</span>
        </div>

        <nav className="ba-masthead-nav" aria-label={text('主导航', 'Main navigation')}>
          <div className="ba-nav-cluster">
            {pageNav.map(item => {
              const isActive = activeKey === item.id;
              return (
                <SceneLink key={item.id} route={item.route} lang={lang} aria-current={isActive ? 'page' : undefined}>
                  {isActive && <span className="ba-active-dot" aria-hidden="true" />}
                  <small className="mono">{item.num}</small>
                  <span>{item.label}</span>
                </SceneLink>
              );
            })}
          </div>

          <span className="ba-nav-divider" aria-hidden="true">/</span>

          <div className="ba-nav-cluster ba-nav-lenses" aria-label={text('四个镜头', 'Four lenses')}>
            {LENS_KEYS.map(id => {
              const lens = lensInfo[id];
              const isActive = activeKey === id;
              return (
                <SceneLink key={id} route={{view: 'lens', arg: id}} lang={lang} aria-current={isActive ? 'page' : undefined}>
                  {isActive && <span className="ba-active-dot" aria-hidden="true" />}
                  <small className="mono">{lens.number}</small>
                  <span>{lens.navigation[lang]}</span>
                </SceneLink>
              );
            })}
          </div>
        </nav>

        <div className="ba-masthead-tools">
          <div className="ba-theme-group" role="group" aria-label={text('明暗主题', 'Theme')}>
            {themeOptions.map(opt => (
              <button
                key={opt.id}
                type="button"
                className="mono"
                aria-label={opt.label}
                aria-pressed={theme === opt.id}
                onClick={() => onSetTheme(opt.id)}
              >
                {opt.short}
              </button>
            ))}
          </div>
          <a className="ba-chip mono" href={languageHref} hrefLang={zh ? 'en' : 'zh-CN'} aria-label={text('切换语言', 'Switch language')}>
            {zh ? 'EN' : '中'}
          </a>
          <a className="ba-contact-pill mono" href={`mailto:${site.email}`}>
            {text('联系 ↗', 'CONTACT ↗')}
          </a>
        </div>
      </header>

      <main id="main" className="ba-stage" ref={mainRef} tabIndex={-1}>
        {children}

        <footer className="ba-colophon" aria-label="Colophon">
          <div>
            <span className="mono ba-colophon-label">01 / IDENTITY</span>
            <p>Kenny Wu · Shenzhen</p>
          </div>
          <div>
            <span className="mono ba-colophon-label">02 / TYPOGRAPHY</span>
            <p>Charter · JinKai · JetBrains Mono</p>
          </div>
          <div>
            <span className="mono ba-colophon-label">03 / EDITION</span>
            <p>Director’s Cut · 2026</p>
          </div>
          <div>
            <span className="mono ba-colophon-label">04 / CHANNELS</span>
            <p className="ba-colophon-links">
              <a href="https://github.com/KKenny0" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              {' · '}
              <a href="https://scholar.google.com/citations?user=q9Z8cmIAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">Scholar ↗</a>
              {' · '}
              <a href={`mailto:${site.email}`}>Email ↗</a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
