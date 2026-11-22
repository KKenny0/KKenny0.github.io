import React, {useState} from 'react';
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

export function VideoWipeCompare({text}) {
  const [split, setSplit] = useState(54);
  return (
    <div className="ba-compare">
      <div
        className="ba-compare-stage"
        style={{'--ba-split': `${split}%`}}
        onPointerMove={e => {
          if (e.buttons !== 1) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setSplit(Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))));
        }}
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setSplit(Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))));
        }}
      >
        <Media src={`${ASSETS}videowipe-before.jpg`} alt={text('处理前：带字幕视频帧', 'Before: burned-in subtitles')} loading="eager" draggable={false} />
        <Media className="ba-compare-after" src={`${ASSETS}videowipe-after.jpg`} alt={text('处理后：字幕已清除', 'After: subtitles removed')} loading="eager" draggable={false} />
        <span className="ba-compare-line" aria-hidden="true"><span className="ba-compare-knob" /></span>
        <span className="ba-compare-tag ba-tag-before mono">{text('处理前', 'BEFORE')}</span>
        <span className="ba-compare-tag ba-tag-after mono">{text('处理后', 'AFTER')}</span>
      </div>
      <div className="ba-compare-bar">
        <span className="mono">{text('拖动或点击对比字幕清除', 'DRAG OR CLICK TO COMPARE')}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={split}
          aria-label={text('字幕清除前后对比', 'Before and after subtitle removal')}
          onChange={e => setSplit(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export function StudioShell({lang, activeKey, theme, onSetTheme, languageHref, mainRef, children}) {
  const zh = lang === 'zh';
  const text = (chinese, english) => prototypeText(lang, chinese, english);

  const pageNav = [
    {id: 'home', route: {view: 'home', arg: ''}, num: '00', label: text('总览展墙', 'EXHIBITION')},
    {id: 'about', route: {view: 'about'}, num: '01', label: text('关于', 'ABOUT')},
    {id: 'projects', route: {view: 'projects'}, num: '02', label: text('项目台', 'PROJECTS')},
    {id: 'notes', route: {view: 'notes'}, num: '03', label: text('文章', 'WRITING')},
    {id: 'support', route: {view: 'support'}, num: '04', label: text('支持', 'SUPPORT')}
  ];

  const themeOptions = [
    {id: 'system', short: text('系统', 'Auto'), label: text('跟随系统', 'System theme')},
    {id: 'light', short: text('亮', 'L'), label: text('亮色', 'Light theme')},
    {id: 'dark', short: text('暗', 'D'), label: text('暗色', 'Dark theme')}
  ];

  return (
    <div className="ba-shell">
      <div className="ba-grid">
        <aside className="ba-rail">
          <div className="ba-rail-top">
            <span className="mono ba-kicker">STUDIO · 2026</span>
            <div className="ba-rail-tools">
              <a className="ba-chip mono" href={languageHref} hrefLang={zh ? 'en' : 'zh-CN'} aria-label={text('切换语言', 'Switch language')}>
                {zh ? 'EN' : '中'}
              </a>
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
            </div>
          </div>

          <SceneLink className="ba-portrait-frame" route={{view: 'about'}} lang={lang}>
            <span className="mono ba-crop-tag">FIG. 00 / {text('关于我', 'ABOUT')} ↗</span>
            <Media src={`${ASSETS}self-profo.jpg`} alt={text('Kenny Wu 的肖像', 'Portrait of Kenny Wu')} loading="eager" />
          </SceneLink>

          <div className="ba-bio">
            <p className="ba-bio-name">Kenny Wu</p>
            <p className="mono ba-muted">{text('AI 工程师 · 深圳', 'AI ENGINEER · SHENZHEN')}</p>
            <p className="ba-statement">
              {text(
                '持续观察，做产品与创作，理解系统，也把工作带到完成。',
                'Observations, products, technical research and work in practice.'
              )}
            </p>
          </div>

          <div className="ba-nav-group">
            <span className="mono ba-group-label">{text('站点目录 / PAGES', 'DIRECTORY / PAGES')}</span>
            <nav className="ba-brackets" aria-label={text('主导航', 'Main navigation')}>
              {pageNav.map(item => {
                const isActive = activeKey === item.id;
                return (
                  <SceneLink key={item.id} route={item.route} lang={lang} aria-current={isActive ? 'page' : undefined}>
                    <span className="ba-nav-label">
                      {isActive && <span className="ba-active-dot" aria-hidden="true" />}
                      <span className="mono">{item.label}</span>
                    </span>
                    <span className="mono">{item.num}</span>
                  </SceneLink>
                );
              })}
            </nav>
          </div>

          <div className="ba-nav-group">
            <span className="mono ba-group-label">{text('四个镜头 / LENSES', 'FOUR LENSES')}</span>
            <nav className="ba-lens-matrix" aria-label={text('四个镜头', 'Four lenses')}>
              {LENS_KEYS.map(id => {
                const lens = lensInfo[id];
                const isActive = activeKey === id;
                return (
                  <SceneLink key={id} route={{view: 'lens', arg: id}} lang={lang} aria-current={isActive ? 'page' : undefined}>
                    <span className="ba-lens-num-row">
                      <span className="mono">{lens.number}</span>
                      {isActive && <span className="ba-active-dot" aria-hidden="true" />}
                    </span>
                    <strong>{lens.navigation[lang]}</strong>
                  </SceneLink>
                );
              })}
            </nav>
          </div>

          <a className="ba-cta mono" href={`mailto:${site.email}`}>
            {text('发起合作联系 ↗', 'GET IN TOUCH ↗')}
          </a>
        </aside>

        <main id="main" className="ba-stage" ref={mainRef} tabIndex={-1}>
          {children}

          <footer className="ba-colophon" aria-label="Colophon">
            <div>
              <span className="mono ba-colophon-label">IDENTITY</span>
              <p>Kenny Wu · Shenzhen</p>
            </div>
            <div>
              <span className="mono ba-colophon-label">TYPOGRAPHY</span>
              <p>Charter · JinKai · Mono</p>
            </div>
            <div>
              <span className="mono ba-colophon-label">PALETTE</span>
              <p>Cerulean Ink</p>
            </div>
            <div>
              <span className="mono ba-colophon-label">LINKS</span>
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
    </div>
  );
}
