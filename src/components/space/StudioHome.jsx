import React, {useEffect, useMemo, useRef, useState} from 'react';
import {curated, lensInfo, projects} from '../../data/space';
import {localizedNote, prototypeText, tasteEnglish} from '../../data/space-i18n';
import {tasteProducts} from '../../data/taste';
import metrics from '../../data/collage-metrics.json';
import {routePath} from '../../lib/space-routes';
import {createThemeController} from '../../lib/theme';
import {Media} from './Media';
import {SceneLink} from './SceneLink';
import {ASSETS, LENS_KEYS, StudioShell, VideoWipeCompare} from './StudioShell';

export default function StudioHome({lang}) {
  const zh = lang === 'zh';
  const text = (chinese, english) => prototypeText(lang, chinese, english);
  const [theme, setTheme] = useState('system');
  const themeController = useRef(null);

  useEffect(() => {
    const controller = createThemeController(setTheme);
    themeController.current = controller;
    return () => controller.destroy();
  }, []);

  const selectedNotes = useMemo(() => curated.map(n => localizedNote(n, lang)), [lang]);
  const videowipe = projects.find(p => p.slug === 'videowipe');
  const scriptWeaver = projects.find(p => p.slug === 'script-weaver');
  const kami = tasteProducts.find(p => p.id === 'kami-reader');
  const kamiShot = kami.works[0];
  const [kamiTitle] = zh ? [kamiShot.title] : tasteEnglish[kamiShot.image];
  const languageHref = routePath({view: 'home', arg: ''}, zh ? 'en' : 'zh');

  return (
    <StudioShell
      lang={lang}
      activeKey="home"
      theme={theme}
      onSetTheme={next => themeController.current?.set(next)}
      languageHref={languageHref}
    >
      <div className="ba-plates ba-enter">
        <div className="ba-stage-banner">
          <div>
            <span className="mono ba-kicker">{text('编号展墙 · N°01 — N°06', 'EXHIBITION · N°01 — N°06')}</span>
            <h1 className="ba-stage-title">{zh ? '持续观察，也把想法做出来。' : 'Keep noticing. Put ideas into form.'}</h1>
          </div>
          <span className="mono ba-datum">( 2022 — 2026 )</span>
        </div>

        {/* Plate 01: VideoWipe Interactive */}
        <article className="ba-plate ba-plate-wide">
          <div className="ba-plate-head">
            <span className="mono">N°01 · VIDEOWIPE / INTERACTIVE</span>
            <span className="mono">★ {metrics['KKenny0/videowipe']?.stars ?? videowipe.stars}</span>
          </div>
          <div className="ba-mat">
            <VideoWipeCompare text={text} />
          </div>
          <div className="ba-plate-foot">
            <div>
              <h2>VideoWipe</h2>
              <p>{text(videowipe.thesisZh, videowipe.thesis)}</p>
            </div>
            <div className="ba-plate-links">
              <SceneLink className="ba-inline-link mono" route={{view: 'projects', item: 'videowipe', source: 'home'}} lang={lang}>
                {text('项目详情 →', 'PROJECT DETAILS →')}
              </SceneLink>
              <a className="ba-inline-link mono" href={videowipe.url} target="_blank" rel="noopener noreferrer">GITHUB ↗</a>
            </div>
          </div>
        </article>

        {/* Plate 02: Kami Reader (Taste) */}
        <SceneLink className="ba-plate is-clickable" route={{view: 'lens', arg: 'taste'}} lang={lang}>
          <div className="ba-plate-head">
            <span className="mono">N°02 · TASTE / KAMI READER</span>
            <span className="mono">★ {metrics['KKenny0/obsidian-kami']?.stars ?? 0}</span>
          </div>
          <div className="ba-mat ba-mat-media">
            <div className="ba-plate-img">
              <Media src={`${ASSETS}${kamiShot.image}`} alt={kamiTitle} loading="eager" />
            </div>
          </div>
          <div className="ba-plate-caption">
            <h3>Kami Reader</h3>
            <p>{text('长文优先的暖纸衬线阅读界面与主题套件。', 'Long-form serif reading layout and Obsidian companion.')}</p>
          </div>
        </SceneLink>

        {/* Plate 03: Script-Weaver (AI) */}
        <SceneLink className="ba-plate is-clickable" route={{view: 'lens', arg: 'ai'}} lang={lang}>
          <div className="ba-plate-head">
            <span className="mono">N°03 · AI / SCRIPT-WEAVER</span>
            <span className="mono">★ {metrics['KKenny0/script-weaver']?.stars ?? scriptWeaver.stars}</span>
          </div>
          <div className="ba-mat ba-mat-media">
            <div className="ba-schematic">
              <span>PREMISE</span><i>→</i><span>SCRIPT</span><i>→</i><span>BOARDS</span>
            </div>
          </div>
          <div className="ba-plate-caption">
            <h3>Script-Weaver</h3>
            <p>{text(scriptWeaver?.thesisZh, scriptWeaver?.thesis)}</p>
          </div>
        </SceneLink>

        {/* Plate 04: Observations (Online) */}
        <SceneLink className="ba-plate is-clickable" route={{view: 'lens', arg: 'online'}} lang={lang}>
          <div className="ba-plate-head">
            <span className="mono">N°04 · ONLINE / OBSERVATIONS</span>
            <span className="mono">{selectedNotes.length} SELECTED</span>
          </div>
          <div className="ba-mat">
            <ul className="ba-mini-notes">
              {selectedNotes.slice(0, 3).map(n => (
                <li key={n.id}>
                  <time className="mono">{n.date}</time>
                  <span>{n.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ba-plate-action">
            <span className="ba-inline-link mono">
              {text(`查看全部 ${selectedNotes.length} 条观察 →`, `VIEW ALL ${selectedNotes.length} OBSERVATIONS →`)}
            </span>
          </div>
        </SceneLink>

        {/* Plate 05: Execution */}
        <SceneLink className="ba-plate is-clickable" route={{view: 'lens', arg: 'execution'}} lang={lang}>
          <div className="ba-plate-head">
            <span className="mono">N°05 · EXECUTION / DELIVERY</span>
            <span className="mono">2026</span>
          </div>
          <div className="ba-mat">
            <div className="ba-stat-box">
              <strong>≈18% → 9.53%</strong>
              <span>{text('固定评测集分镜问题率 · 20 集长任务断点恢复', 'Fixed-set storyboard issue rate · 20-ep bounded recovery')}</span>
            </div>
          </div>
          <div className="ba-plate-action">
            <span className="ba-inline-link mono">
              {text('查看 4 阶段工程链路 →', 'INSPECT 4-STAGE PIPELINE →')}
            </span>
          </div>
        </SceneLink>

        {/* Plate 06: Four Lenses Cast */}
        <article className="ba-plate ba-plate-wide">
          <div className="ba-plate-head">
            <span className="mono">N°06 · FOUR LENSES / CHARACTERS</span>
            <span className="mono">01 — 04</span>
          </div>
          <div className="ba-cast-row">
            {LENS_KEYS.map(id => {
              const lens = lensInfo[id];
              return (
                <SceneLink key={id} className="ba-cast-item" route={{view: 'lens', arg: id}} lang={lang}>
                  <Media src={`${ASSETS}${lens.character}`} alt={lens.name} />
                  <strong>{lens.navigation[lang]}</strong>
                  <span className="mono">{lens.number}. {lens.name.toUpperCase()}</span>
                </SceneLink>
              );
            })}
          </div>
        </article>
      </div>
    </StudioShell>
  );
}
