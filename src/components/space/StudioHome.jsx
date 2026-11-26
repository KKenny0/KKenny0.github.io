import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {aiWritingIds, curated, notes, projects} from '../../data/space';
import {localizedNote, prototypeText, tasteEnglish} from '../../data/space-i18n';
import {tasteProducts} from '../../data/taste';
import metrics from '../../data/collage-metrics.json';
import {routePath} from '../../lib/space-routes';
import {createThemeController} from '../../lib/theme';
import {Media} from './Media';
import {SceneLink} from './SceneLink';
import {ASSETS, StudioShell, VideoWipeCompare} from './StudioShell';

// Match the compact gallery media query in studio-b2.css.
const COMPACT_GALLERY = '(max-width: 1180px), (max-height: 735px)';
const INDEX_THUMB_SIZES = '(max-width: 540px) 42vw, (max-width: 1180px) 28vw, (max-height: 735px) 28vw, 14vw';
const HOME_COMPARE_SIZES = '(max-width: 1180px) min(720px, 92vw), (max-height: 735px) min(720px, 92vw), clamp(0px, calc(69vw - 264px), 705px)';

const ROOM_LIST = [
  {id: '00', lens: 'online', titleZh: '策展自序', titleEn: 'Prologue'},
  {id: '01', lens: 'ai', titleZh: 'VideoWipe', titleEn: 'VideoWipe'},
  {id: '02', lens: 'taste', titleZh: 'Kami Reader', titleEn: 'Kami Reader'},
  {id: '03', lens: 'taste', titleZh: 'Card-Skill', titleEn: 'Card-Skill'},
  {id: '04', lens: 'execution', titleZh: '系统工程交付', titleEn: 'Engineering'},
  {id: '05', lens: 'online', titleZh: '研究与观察文献', titleEn: 'Manuscripts'}
];

// Apple WWDC 2018 rubber-band resistance at boundaries
function rubberband(overshoot, dimension, constant = 0.55) {
  if (dimension <= 0) return 0;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Apple WWDC 2018 momentum projection
function projectMomentum(initialVelocity, decelerationRate = 0.994) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export default function StudioHome({lang}) {
  const zh = lang === 'zh';
  const text = useCallback((chinese, english) => prototypeText(lang, chinese, english), [lang]);
  const [theme, setTheme] = useState('system');

  const [roomIdx, setRoomIdx] = useState(0);
  const [indexStatus, setIndexStatus] = useState('unopened');
  const overviewOpen = indexStatus === 'open';

  const themeController = useRef(null);
  const compactMedia = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const indexButtonRef = useRef(null);
  const indexRef = useRef(null);
  const tabRefs = useRef([]);
  const pendingRoomFocus = useRef(null);
  const drag = useRef(null);
  const wheelLockUntil = useRef(0);

  useEffect(() => {
    const controller = createThemeController(setTheme);
    themeController.current = controller;
    return () => controller.destroy();
  }, []);

  useEffect(() => {
    const room = new URLSearchParams(window.location.search).get('room');
    if (room !== null && /^\d+$/.test(room) && Number(room) < ROOM_LIST.length) {
      setRoomIdx(Number(room));
    }
  }, []);

  const resetDrag = useCallback(() => {
    const gesture = drag.current;
    if (!gesture) return;
    drag.current = null;
    cancelAnimationFrame(gesture.frame);
    gesture.viewport.classList.remove('is-dragging');
    gesture.track.style.removeProperty('--drag-px');
    if (gesture.viewport.hasPointerCapture(gesture.pointerId)) {
      gesture.viewport.releasePointerCapture(gesture.pointerId);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_GALLERY);
    compactMedia.current = media;
    const resetCamera = () => {
      resetDrag();
      wheelLockUntil.current = 0;
    };
    media.addEventListener('change', resetCamera);
    window.addEventListener('resize', resetCamera);
    window.addEventListener('blur', resetCamera);
    return () => {
      media.removeEventListener('change', resetCamera);
      window.removeEventListener('resize', resetCamera);
      window.removeEventListener('blur', resetCamera);
      resetCamera();
    };
  }, [resetDrag]);

  const openIndex = () => {
    resetDrag();
    setIndexStatus('open');
  };

  const closeIndex = useCallback(() => {
    indexButtonRef.current?.focus();
    setIndexStatus('closed');
  }, []);

  useEffect(() => {
    if (!overviewOpen) return;
    const sheet = indexRef.current;
    const header = sheet.parentElement;
    const fitIndex = () => {
      const available = window.innerHeight - header.getBoundingClientRect().bottom - 18;
      sheet.style.maxHeight = `${Math.max(0, available)}px`;
    };
    fitIndex();
    sheet.scrollTop = 0;
    const focusFrame = requestAnimationFrame(() => {
      sheet.querySelector('button')?.focus({preventScroll: true});
    });
    const observer = new ResizeObserver(fitIndex);
    observer.observe(header);
    observer.observe(header.closest('.ba-shell').querySelector('.ba-masthead'));
    window.addEventListener('scroll', fitIndex, {passive: true});
    window.addEventListener('resize', fitIndex);
    return () => {
      cancelAnimationFrame(focusFrame);
      observer.disconnect();
      window.removeEventListener('scroll', fitIndex);
      window.removeEventListener('resize', fitIndex);
    };
  }, [overviewOpen]);

  const goToRoom = useCallback((nextIdx, focusTarget) => {
    resetDrag();
    const clamped = Math.max(0, Math.min(ROOM_LIST.length - 1, nextIdx));
    pendingRoomFocus.current = null;
    setRoomIdx(clamped);
    if (overviewOpen) {
      closeIndex();
    } else if (focusTarget === 'tabpanel' && compactMedia.current?.matches) {
      if (clamped !== roomIdx) pendingRoomFocus.current = clamped;
    } else if (focusTarget) {
      tabRefs.current[clamped]?.focus({preventScroll: true});
    }
  }, [closeIndex, overviewOpen, resetDrag, roomIdx]);

  useEffect(() => {
    if (pendingRoomFocus.current !== roomIdx) return;
    pendingRoomFocus.current = null;
    const panel = trackRef.current.querySelector('.ab-bay.is-active');
    panel.focus({preventScroll: true});
    panel.scrollIntoView({block: 'start', behavior: 'instant'});
  }, [roomIdx]);

  useEffect(() => {
    const onKeyDown = event => {
      if (overviewOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeIndex();
        }
        return;
      }
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target.closest?.('input, textarea, select, [contenteditable]')) return;
      const focusTarget = target.closest?.('[role="tab"], [role="tabpanel"]')?.getAttribute('role');
      if (/^[0-5]$/.test(event.key)) {
        goToRoom(Number(event.key), focusTarget);
      } else if (!compactMedia.current?.matches && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        if (target.closest?.('button, a')) return;
        event.preventDefault();
        goToRoom(roomIdx + (event.key === 'ArrowRight' ? 1 : -1), focusTarget);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeIndex, goToRoom, overviewOpen, roomIdx]);

  const handleTabKeyDown = (event, idx) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const last = ROOM_LIST.length - 1;
    const nextByKey = {
      ArrowLeft: idx === 0 ? last : idx - 1,
      ArrowRight: idx === last ? 0 : idx + 1,
      Home: 0,
      End: last
    };
    if (!Object.hasOwn(nextByKey, event.key)) return;
    event.preventDefault();
    goToRoom(nextByKey[event.key], 'tab');
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const onWheel = event => {
      if (compactMedia.current?.matches || overviewOpen || drag.current || event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const now = performance.now();
      if (Math.abs(delta) < 18 || now < wheelLockUntil.current) return;
      wheelLockUntil.current = now + 420;
      goToRoom(roomIdx + Math.sign(delta), viewport.contains(document.activeElement) ? 'tab' : undefined);
    };
    viewport.addEventListener('wheel', onWheel, {passive: true});
    return () => viewport.removeEventListener('wheel', onWheel);
  }, [goToRoom, overviewOpen, roomIdx]);

  const handlePointerDown = event => {
    if (compactMedia.current?.matches || overviewOpen || drag.current || !event.isPrimary || event.button !== 0) return;
    if (event.target.closest('a, button, input, label, .ba-compare')) return;
    drag.current = {
      viewport: event.currentTarget,
      track: trackRef.current,
      width: event.currentTarget.clientWidth,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      offset: 0,
      frame: 0,
      locked: false
    };
  };

  const handlePointerMove = event => {
    const gesture = drag.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    if (!gesture.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dx) < Math.abs(dy)) {
        resetDrag();
        return;
      }
      gesture.locked = true;
      gesture.viewport.classList.add('is-dragging');
      gesture.viewport.setPointerCapture(event.pointerId);
    }

    const now = performance.now();
    const dt = Math.max(1, now - gesture.lastTime);
    const instantVelocity = ((event.clientX - gesture.lastX) / dt) * 1000;
    gesture.velocityX = gesture.velocityX * 0.35 + instantVelocity * 0.65;
    gesture.lastX = event.clientX;
    gesture.lastTime = now;
    const atEdge = (roomIdx === 0 && dx > 0) || (roomIdx === ROOM_LIST.length - 1 && dx < 0);
    gesture.offset = atEdge ? rubberband(dx, gesture.width, 0.42) : dx;

    if (!gesture.frame) {
      gesture.frame = requestAnimationFrame(() => {
        gesture.frame = 0;
        gesture.track.style.setProperty('--drag-px', `${gesture.offset}px`);
      });
    }
  };

  const handlePointerUp = event => {
    const gesture = drag.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    resetDrag();
    if (!gesture.locked || compactMedia.current?.matches) return;

    const velocity = performance.now() - gesture.lastTime < 100 ? gesture.velocityX : 0;
    const projected = gesture.offset + projectMomentum(velocity, 0.992);
    const threshold = gesture.width * 0.8 * 0.22;
    const focusTarget = gesture.viewport.contains(document.activeElement) ? 'tab' : undefined;
    if (projected < -threshold || velocity < -240) goToRoom(roomIdx + 1, focusTarget);
    else if (projected > threshold || velocity > 240) goToRoom(roomIdx - 1, focusTarget);
  };

  const cancelPointer = event => {
    if (event.pointerId === drag.current?.pointerId) resetDrag();
  };

  const entries = useMemo(() => notes.map(n => localizedNote(n, lang)), [lang]);
  const selectedNotes = useMemo(() => curated.map(n => localizedNote(n, lang)), [lang]);
  const aiWritings = useMemo(() => aiWritingIds.map(id => entries.find(n => n.id === id)).filter(Boolean), [entries]);

  const videowipe = projects.find(p => p.slug === 'videowipe');
  const scriptWeaver = projects.find(p => p.slug === 'script-weaver');
  const kami = tasteProducts.find(p => p.id === 'kami-reader');
  const cardSkill = tasteProducts.find(p => p.id === 'card-skill');
  const kamiShot = kami.works[0];
  const posterShot = cardSkill.works[0];
  const [kamiTitle] = zh ? [kamiShot.title] : tasteEnglish[kamiShot.image];
  const [posterTitle] = zh ? [posterShot.title] : tasteEnglish[posterShot.image];
  const languageHref = routePath({view: 'home', arg: ''}, zh ? 'en' : 'zh');

  const kamiDownloads =
    (metrics['kami-reader-theme-downloads']?.downloads ?? 0) +
    (metrics['kami-reader-companion-downloads']?.downloads ?? 0);

  // Emil Kowalski clip-path indicator percentages for the 6 room tabs
  const activeStartPct = (roomIdx / ROOM_LIST.length) * 100;
  const activeRightInsetPct = 100 - ((roomIdx + 1) / ROOM_LIST.length) * 100;

  const roomPanel = idx => ({
    id: `gallery-room-${idx}`,
    role: 'tabpanel',
    'aria-labelledby': `gallery-tab-${idx}`,
    'aria-hidden': roomIdx !== idx,
    tabIndex: roomIdx === idx ? 0 : -1,
    className: `ab-bay${roomIdx === idx ? ' is-active' : ''}`,
    style: {'--bay-offset': idx - roomIdx},
    onClick: () => {
      if (!overviewOpen && roomIdx !== idx) goToRoom(idx);
    }
  });

  return (
    <StudioShell
      lang={lang}
      activeKey="home"
      theme={theme}
      onSetTheme={next => themeController.current?.set(next)}
      languageHref={languageHref}
    >
      <div className="ab-gallery">
        <div className="ab-gallery-header">
          <div className="ab-wayfinding mono">
            <div className="ab-wayfinding-left">
              <span className="ab-cobalt-dot" aria-hidden="true" />
              <span>
                {text(
                  `SOLO EXHIBITION · ROOM 0${roomIdx} / 05 · ${ROOM_LIST[roomIdx].titleZh}`,
                  `SOLO EXHIBITION · ROOM 0${roomIdx} / 05 · ${ROOM_LIST[roomIdx].titleEn.toUpperCase()}`
                )}
              </span>
            </div>

            <div className="ab-wayfinding-right">
              <span className="ab-gesture-hint">
                {text('滚轮 / 拖拽白墙 / 方向键 ← → 漫步长廊', 'SCROLL / DRAG WALL / ← → TO WALK')}
              </span>
              <button
                type="button"
                className={`ab-overview-btn mono ${overviewOpen ? 'is-open' : ''}`}
                ref={indexButtonRef}
                aria-expanded={overviewOpen}
                aria-controls="gallery-index"
                onClick={overviewOpen ? closeIndex : openIndex}
              >
                {overviewOpen ? text('关闭总览 ×', 'CLOSE INDEX ×') : text('▦ 展品总览 (6)', '▦ ALL PLATES (6)')}
              </button>
            </div>
          </div>

          {/* ====================================================================
           * OPTIONAL POPOVER LIGHT-TABLE CONTACT SHEET (Origin-Aware Entrance & Exit)
           * ==================================================================== */}
          <div
            className={`ab-contact-sheet ${overviewOpen ? 'is-open' : ''}`}
            ref={indexRef}
            id="gallery-index"
            role="dialog"
            inert={overviewOpen ? undefined : ''}
            aria-hidden={!overviewOpen}
            aria-label={text('展品看片台总览', 'Exhibition Contact Sheet')}
          >
            <div className="ab-sheet-grid">
              <button type="button" className={`ab-sheet-card ${roomIdx === 0 ? 'is-current' : ''}`} onClick={() => goToRoom(0)}>
                <div className="ab-sheet-thumb">
                  {indexStatus !== 'unopened' && <Media src={`${ASSETS}self-profo.jpg`} alt="" sizes={INDEX_THUMB_SIZES} />}
                </div>
                <div className="ab-sheet-meta mono">
                  <span>00</span>
                  <strong>{text('策展自序与肖像', 'Prologue & Portrait')}</strong>
                </div>
              </button>

              <button type="button" className={`ab-sheet-card ${roomIdx === 1 ? 'is-current' : ''}`} onClick={() => goToRoom(1)}>
                <div className="ab-sheet-thumb">
                  {indexStatus !== 'unopened' && <Media src={`${ASSETS}videowipe-after.jpg`} alt="" sizes={INDEX_THUMB_SIZES} />}
                </div>
                <div className="ab-sheet-meta mono">
                  <span>01</span>
                  <strong>VideoWipe</strong>
                </div>
              </button>

              <button type="button" className={`ab-sheet-card ${roomIdx === 2 ? 'is-current' : ''}`} onClick={() => goToRoom(2)}>
                <div className="ab-sheet-thumb">
                  {indexStatus !== 'unopened' && <Media src={`${ASSETS}${kamiShot.image}`} alt="" sizes={INDEX_THUMB_SIZES} />}
                </div>
                <div className="ab-sheet-meta mono">
                  <span>02</span>
                  <strong>Kami Reader</strong>
                </div>
              </button>

              <button type="button" className={`ab-sheet-card ${roomIdx === 3 ? 'is-current' : ''}`} onClick={() => goToRoom(3)}>
                <div className="ab-sheet-thumb">
                  {indexStatus !== 'unopened' && <Media src={`${ASSETS}${posterShot.image}`} alt="" sizes={INDEX_THUMB_SIZES} />}
                </div>
                <div className="ab-sheet-meta mono">
                  <span>03</span>
                  <strong>Card-Skill</strong>
                </div>
              </button>

              <button type="button" className={`ab-sheet-card ${roomIdx === 4 ? 'is-current' : ''}`} onClick={() => goToRoom(4)}>
                <div className="ab-sheet-thumb ab-sheet-typo">
                  <strong>≈18% → 9.53%</strong>
                  <small className="mono">20 EPS RECOVERY</small>
                </div>
                <div className="ab-sheet-meta mono">
                  <span>04</span>
                  <strong>{text('系统工程交付', 'Engineering')}</strong>
                </div>
              </button>

              <button type="button" className={`ab-sheet-card ${roomIdx === 5 ? 'is-current' : ''}`} onClick={() => goToRoom(5)}>
                <div className="ab-sheet-thumb ab-sheet-typo">
                  <strong>{text('4 控制面与记忆', '4 Control Planes')}</strong>
                  <small className="mono">{entries.length} ESSAYS</small>
                </div>
                <div className="ab-sheet-meta mono">
                  <span>05</span>
                  <strong>{text('研究与观察文献', 'Manuscripts')}</strong>
                </div>
              </button>
            </div>
          </div>
        </div>

        <footer className="ab-floor-scrubber mono" aria-label={text('长廊展位步进器', 'Gallery corridor scrubber')}>
          <button
            type="button"
            className="ab-step-btn"
            aria-disabled={roomIdx === 0}
            onClick={() => roomIdx > 0 && goToRoom(roomIdx - 1)}
          >
            ← {text('向西漫步', 'WEST')}
          </button>

          <div className="ab-scrubber-center">
            {/* Base layer (inactive tabs) */}
            <div className="ab-tab-layer ab-tab-base" role="tablist" aria-label={text('展厅房间', 'Gallery rooms')}>
              {ROOM_LIST.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  id={`gallery-tab-${idx}`}
                  ref={el => { tabRefs.current[idx] = el; }}
                  aria-controls={`gallery-room-${idx}`}
                  aria-label={`${r.id} ${zh ? r.titleZh : r.titleEn}`}
                  aria-selected={roomIdx === idx}
                  tabIndex={roomIdx === idx ? 0 : -1}
                  onKeyDown={event => handleTabKeyDown(event, idx)}
                  className="ab-scrubber-tab"
                  onClick={() => goToRoom(idx)}
                >
                  <span className="ab-tab-num">{r.id}</span>
                  <span className="ab-tab-label">{zh ? r.titleZh : r.titleEn}</span>
                </button>
              ))}
            </div>

            {/* Duplicated active layer clipped via hardware-accelerated clip-path: inset(...) */}
            <div
              className="ab-tab-layer ab-tab-clipped"
              aria-hidden="true"
              style={{
                clipPath: `inset(0 ${activeRightInsetPct.toFixed(2)}% 0 ${activeStartPct.toFixed(2)}%)`
              }}
            >
              {ROOM_LIST.map(r => (
                <span key={r.id} className="ab-scrubber-tab is-clipped-active">
                  <span className="ab-tab-num">{r.id}</span>
                  <span className="ab-tab-label">{zh ? r.titleZh : r.titleEn}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="ab-step-btn"
            aria-disabled={roomIdx === ROOM_LIST.length - 1}
            onClick={() => roomIdx < ROOM_LIST.length - 1 && goToRoom(roomIdx + 1)}
          >
            {text('向东漫步', 'EAST')} →
          </button>
        </footer>

        {/* ====================================================================
         * A+B FUSED KINETIC WHITE-WALL CORRIDOR APERTURE
         * - Hardware-accelerated translate3d camera track (Zero OS scrollbars)
         * - Center room has Variant A's pure white wall + miniature placard
         * - Adjacent rooms (prev/next) peek from the left/right edges with depth scale
         * ==================================================================== */}
        <section
          ref={viewportRef}
          className="ab-corridor-viewport"
          aria-label={text('水平漫步白墙展厅', 'White-wall exhibition gallery')}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={cancelPointer}
          onLostPointerCapture={cancelPointer}
          onPointerLeave={event => {
            if (!drag.current?.locked) cancelPointer(event);
          }}
        >
          <div ref={trackRef} className="ab-camera-track" style={{'--active-idx': roomIdx}}>
            {/* ----------------------------------------------------------------
             * BAY 00: CURATOR'S STATEMENT & FISHEYE PORTRAIT
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(0)}>
              <div className="ab-bay-inner" inert={roomIdx === 0 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner">
                    <SceneLink className="ex-portrait-frame" route={{view: 'about'}} lang={lang}>
                      <Media
                        src={`${ASSETS}self-profo.jpg`}
                        alt={text('Kenny Wu 的黑白鱼眼肖像', 'Black-and-white fisheye portrait of Kenny Wu')}
                        loading={roomIdx === 0 ? 'eager' : 'lazy'}
                        sizes="(max-width: 360px) 76vw, (max-width: 1180px) 268px, clamp(196px, calc(24vw - 44px), 266px)"
                      />
                    </SceneLink>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">ROOM 00 / 05 · CURATOR&apos;S NOTE</span>
                  <h1 className="ex-placard-title">
                    {zh ? (
                      <>
                        持续观察，
                        <br />
                        也把想法做出来。
                      </>
                    ) : (
                      <>
                        Keep noticing.
                        <br />
                        Put ideas into form.
                      </>
                    )}
                  </h1>
                  <p className="ex-placard-medium mono">Kenny Wu · Shenzhen · AI Systems &amp; Craft</p>
                  <p className="ex-placard-note">
                    {text(
                      '专注于检索、上下文与智能体架构，同时打磨多镜头漫剧生成系统与长文阅读工作台。向右漫步观看 5 组代表作与手稿。',
                      'Focused on retrieval, context and agent architecture, multi-shot storyboard pipelines, and long-form reading tools. Walk right for 5 selected works.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <button type="button" className="ex-step-trigger" onClick={() => goToRoom(1, 'tabpanel')}>
                      {text('步入 01 号展品 →', 'WALK TO EXHIBIT 01 →')}
                    </button>
                    <SceneLink route={{view: 'about'}} lang={lang}>
                      {text('策展人履历 ↗', 'BIOGRAPHY ↗')}
                    </SceneLink>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 01: VIDEOWIPE OPTICAL ERASER LOUPE
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(1)}>
              <div className="ab-bay-inner" inert={roomIdx === 1 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-artwork-mount">
                    <VideoWipeCompare
                      text={text}
                      loading={roomIdx === 1 ? 'eager' : 'lazy'}
                      sizes={HOME_COMPARE_SIZES}
                    />
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">EXHIBIT 01 / 05 · AI SYSTEMS</span>
                  <h2 className="ex-placard-title">VideoWipe</h2>
                  <p className="ex-placard-medium mono">
                    2026 · Optical Video Inpainting · ★ {metrics['KKenny0/videowipe']?.stars ?? videowipe.stars}
                  </p>
                  <p className="ex-placard-note">
                    {text(
                      '清除视频中烧录的字幕、水印与遮挡。在画布上移动鼠标即可通过圆形光学透镜实时透视对比修复前后帧。',
                      'Removes burned-in subtitles, watermarks and occlusions from video. Move your pointer across the canvas to inspect through the optical loupe.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <SceneLink route={{view: 'projects', item: 'videowipe', source: 'home'}} lang={lang}>
                      {text('展品档案 →', 'DOSSIER →')}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'ai'}} lang={lang}>
                      {text('03 AI 展厅 →', 'AI ROOM →')}
                    </SceneLink>
                    <a href={videowipe.url} target="_blank" rel="noopener noreferrer">
                      GITHUB ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 02: KAMI READER WORKBENCH
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(2)}>
              <div className="ab-bay-inner" inert={roomIdx === 2 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-framed-print">
                    <SceneLink route={{view: 'taste', arg: 'kami-reader', work: 0}} lang={lang}>
                      <Media
                        src={`${ASSETS}${kamiShot.image}`}
                        alt={kamiTitle}
                        sizes="(max-width: 1180px) min(600px, 84vw), (max-height: 735px) min(600px, 84vw), clamp(0px, calc(64vw - 264px), 640px)"
                      />
                    </SceneLink>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">EXHIBIT 02 / 05 · TASTE &amp; TOOLS</span>
                  <h2 className="ex-placard-title">Kami Reader</h2>
                  <p className="ex-placard-medium mono">
                    2025–2026 · Obsidian Reading Workbench · {kamiDownloads.toLocaleString('en-US')} Downloads
                  </p>
                  <p className="ex-placard-note">
                    {text(
                      '让排版退后半步，让真正的内容浮现。为 Obsidian 打造的衬线阅读与深度批注环境，消除界面噪音。',
                      'Step the chrome back and let the writing breathe. A serif reading and annotation environment crafted for Obsidian.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <SceneLink route={{view: 'taste', arg: 'kami-reader', work: 0}} lang={lang}>
                      {text('放大观看展板 →', 'INSPECT PLATE →')}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'taste'}} lang={lang}>
                      {text('02 Taste 展厅 →', 'TASTE ROOM →')}
                    </SceneLink>
                    <a href={kami.url} target="_blank" rel="noopener noreferrer">
                      GITHUB ★ {metrics['KKenny0/obsidian-kami']?.stars ?? 7} ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 03: A THOUSAND BRAINS POSTER
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(3)}>
              <div className="ab-bay-inner" inert={roomIdx === 3 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-framed-print ex-print-vertical">
                    <SceneLink route={{view: 'taste', arg: 'card-skill', work: 0}} lang={lang}>
                      <Media src={`${ASSETS}${posterShot.image}`} alt={posterTitle} sizes="(max-width: 360px) 80vw, 290px" />
                    </SceneLink>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">EXHIBIT 03 / 05 · VISUAL SYNTHESIS</span>
                  <h2 className="ex-placard-title">Card-Skill</h2>
                  <p className="ex-placard-medium mono">
                    2026 · Open-Source Visual Synthesis Skill · ★ {metrics['KKenny0/card-skill']?.stars ?? 6}
                  </p>
                  <p className="ex-placard-note">
                    {text(
                      '开源的内容转视觉排版技能。把长文、书籍与研究证据自动提炼信息结构，渲染成高密度印刷级知识卡片、文章封面与解释图（左侧《千脑智能》即为其生成样张）。',
                      'An open-source visual synthesis skill that distills long-form writing, books and research evidence into print-grade knowledge cards, article covers and explanatory diagrams.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <SceneLink route={{view: 'taste', arg: 'card-skill', work: 0}} lang={lang}>
                      {text('查看三组生成样张 →', 'INSPECT 3 PLATES →')}
                    </SceneLink>
                    <SceneLink route={{view: 'projects', item: 'card-skill', source: 'home'}} lang={lang}>
                      {text('项目详情 →', 'DOSSIER →')}
                    </SceneLink>
                    <a href={cardSkill.url} target="_blank" rel="noopener noreferrer">
                      GITHUB ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 04: 20-EPISODE AUTONOMOUS RECOVERY & KOTAEMON
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(4)}>
              <div className="ab-bay-inner" inert={roomIdx === 4 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-specimen-board">
                    <div className="ex-specimen-grid">
                      <div className="ex-specimen-cell">
                        <span className="mono">01 · SCRIPT-WEAVER</span>
                        <strong>{text('故事构想与结构化分场', 'Structured Scene Scripts')}</strong>
                        <small className="mono">★ {metrics['KKenny0/script-weaver']?.stars ?? scriptWeaver.stars} STARS</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">02 · IDENTITY LOCK</span>
                        <strong>1,285s → 24s</strong>
                        <small className="mono">{text('10 集跨集角色消歧耗时', '10-Ep Character Alignment')}</small>
                      </div>
                      <div className="ex-specimen-cell">
                        <span className="mono">03 · QUALITY GATE</span>
                        <strong>≈18% → 9.53%</strong>
                        <small className="mono">{text('多镜头动作过载与景别问题率', 'Shot-Scale Defect Rate')}</small>
                      </div>
                      <div className="ex-specimen-cell is-cobalt">
                        <span className="mono">04 · BOUNDED RECOVERY</span>
                        <strong>{text('20 集连续自愈完赛', '20 Episodes Completed')}</strong>
                        <small className="mono">{text('熔断与有界重试自动恢复', 'Autonomous Checkpoint Recovery')}</small>
                      </div>
                    </div>
                    <div className="ex-specimen-footer mono">
                      <span>
                        UPSTREAM OSS · Kotaemon ★ {(metrics['Cinnamon/kotaemon']?.stars ?? 25909).toLocaleString('en-US')}
                      </span>
                      <div className="ex-specimen-prs">
                        <a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer">
                          #287 TEI Reranking ↗
                        </a>
                        <a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer">
                          #341 Chat Suggestions ↗
                        </a>
                        <a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer">
                          #461 Citation Viz ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">EXHIBIT 04 / 05 · ENGINEERING CAPABILITY</span>
                  <h2 className="ex-placard-title">{text('复杂 AI 系统工程与交付', 'AI Systems & Delivery')}</h2>
                  <p className="ex-placard-medium mono">CAPABILITY · ARCHITECTURE, EVALS &amp; PRODUCTION</p>
                  <p className="ex-placard-note">
                    {text(
                      '擅长把不稳定的前沿模型能力转化为可闭环、可验收的生产级系统。覆盖多智能体编排、检索与上下文架构、自动化评测门禁及长周期容错调度，并持续向头部开源社区贡献核心模块。',
                      'Translating volatile model capabilities into verifiable production systems: multi-agent orchestration, retrieval and context architecture, automated evaluation gates, and upstream open-source contributions.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <SceneLink route={{view: 'lens', arg: 'execution'}} lang={lang}>
                      {text('查看工程实践档案 →', 'EXECUTION DOSSIER →')}
                    </SceneLink>
                    <SceneLink route={{view: 'about'}} lang={lang}>
                      {text('完整工程履历 →', 'ENGINEERING BIO →')}
                    </SceneLink>
                    <a href={scriptWeaver.url} target="_blank" rel="noopener noreferrer">
                      SCRIPT-WEAVER ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 05: SYSTEMS RESEARCH & FIELD OBSERVATIONS VITRINE
             * ---------------------------------------------------------------- */}
            <article {...roomPanel(5)}>
              <div className="ab-bay-inner" inert={roomIdx === 5 ? undefined : ''}>
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-manuscript-vitrine">
                    <div className="ex-vitrine-col">
                      <span className="mono ex-vitrine-head">{text('A · 系统源码与记忆控制面', 'A · AGENT MEMORY & INTERNALS')}</span>
                      {aiWritings.map((note, idx) => (
                        <SceneLink
                          key={note.id}
                          className="ex-vitrine-item"
                          route={{view: 'notes', item: note.id, source: 'ai'}}
                          lang={lang}
                        >
                          <span className="mono">0{idx + 1} · {note.date}</span>
                          <strong>{note.title}</strong>
                          <p>{note.teaser}</p>
                        </SceneLink>
                      ))}
                    </div>
                    <div className="ex-vitrine-col">
                      <span className="mono ex-vitrine-head">{text('B · 长线观察现场笔记', 'B · CURATED FIELD NOTES')}</span>
                      <ul className="ex-vitrine-list">
                        {selectedNotes.map((note, idx) => (
                          <li key={note.id}>
                            <SceneLink route={{view: 'notes', item: note.id, source: 'online'}} lang={lang}>
                              <span className="mono">0{idx + 1}</span>
                              <strong>{note.title}</strong>
                              <time className="mono">{note.date}</time>
                            </SceneLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <aside className="ex-placard">
                  <span className="mono ex-placard-no">EXHIBIT 05 / 05 · MANUSCRIPTS</span>
                  <h2 className="ex-placard-title">{text('把源码与记忆拆开来看', 'Source & Memory Manuscripts')}</h2>
                  <p className="ex-placard-medium mono">2025–2026 · {entries.length} Published Writings</p>
                  <p className="ex-placard-note">
                    {text(
                      '不追逐每日模型热点，只记录改变智能体记忆架构、上下文压缩机制与工程边界的深度手稿。',
                      'Ignoring daily hype to dissect agent memory control planes, context compaction and long-horizon shifts.'
                    )}
                  </p>
                  <div className="ex-placard-links mono">
                    <SceneLink route={{view: 'notes'}} lang={lang}>
                      {text(`全部 ${entries.length} 篇手稿 →`, `ALL ${entries.length} WRITINGS →`)}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'online'}} lang={lang}>
                      {text('01 观察展厅 →', 'ONLINE ROOM →')}
                    </SceneLink>
                    <SceneLink route={{view: 'support'}} lang={lang}>
                      {text('支持创作 →', 'SUPPORT →')}
                    </SceneLink>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </section>
      </div>
    </StudioShell>
  );
}
