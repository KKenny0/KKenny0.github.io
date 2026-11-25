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
  const text = (chinese, english) => prototypeText(lang, chinese, english);
  const [theme, setTheme] = useState('system');

  // Default to Room 00 (Prologue / 策展自序) — can be overridden via ?room=0..5
  const [roomIdx, setRoomIdx] = useState(0);
  // Live drag offset in px during 1:1 pointer manipulation
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // Overview drawer (Light Table miniature index modal/sheet)
  const [overviewOpen, setOverviewOpen] = useState(false);

  const themeController = useRef(null);
  const viewportRef = useRef(null);
  const dragState = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    lockedAxis: null
  });
  const wheelLockUntil = useRef(0);

  useEffect(() => {
    const controller = createThemeController(setTheme);
    themeController.current = controller;
    return () => controller.destroy();
  }, []);

  // Read optional ?room=0..5 from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get('room');
    if (r !== null && !Number.isNaN(Number(r))) {
      const n = Math.max(0, Math.min(ROOM_LIST.length - 1, Number(r)));
      setRoomIdx(n);
    }
  }, []);

  const goToRoom = useCallback(nextIdx => {
    const clamped = Math.max(0, Math.min(ROOM_LIST.length - 1, nextIdx));
    setRoomIdx(clamped);
    setDragOffsetPx(0);
    setOverviewOpen(false);
  }, []);

  // Keyboard navigation: instant/responsive stepping via ArrowLeft/ArrowRight or 0-5
  useEffect(() => {
    const onKeyDown = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setRoomIdx(prev => Math.min(ROOM_LIST.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setRoomIdx(prev => Math.max(0, prev - 1));
      } else if (['0', '1', '2', '3', '4', '5'].includes(e.key)) {
        setRoomIdx(Number(e.key));
        setOverviewOpen(false);
      } else if (e.key === 'Escape' && overviewOpen) {
        setOverviewOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overviewOpen]);

  // Wheel / Trackpad choreography: convert vertical or horizontal wheel gesture into smooth room walk
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = e => {
      if (overviewOpen) return;
      // Allow inner scrollable lists if any
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 18) return;
      const now = performance.now();
      if (now < wheelLockUntil.current) return;
      wheelLockUntil.current = now + 420;
      if (delta > 0) {
        setRoomIdx(prev => Math.min(ROOM_LIST.length - 1, prev + 1));
      } else {
        setRoomIdx(prev => Math.max(0, prev - 1));
      }
    };
    el.addEventListener('wheel', onWheel, {passive: true});
    return () => el.removeEventListener('wheel', onWheel);
  }, [overviewOpen]);

  // 1:1 Direct Manipulation Pointer Drag + Momentum Projection + Rubber-Banding
  const handlePointerDown = e => {
    if (e.button !== 0 || overviewOpen) return;
    // Do not hijack pointer events inside interactive controls or VideoWipe loupe stage
    if (e.target.closest('a, button, input, label, .ba-compare')) return;
    const now = performance.now();
    dragState.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: now,
      velocityX: 0,
      lockedAxis: null
    };
  };

  const handlePointerMove = e => {
    const st = dragState.current;
    if (!st.active || e.pointerId !== st.pointerId) return;
    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    if (!st.lockedAxis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      st.lockedAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (st.lockedAxis === 'x') {
        setIsDragging(true);
        e.currentTarget.setPointerCapture?.(e.pointerId);
      } else {
        st.active = false;
        return;
      }
    }

    const now = performance.now();
    const dt = Math.max(1, now - st.lastTime);
    const instantVx = ((e.clientX - st.lastX) / dt) * 1000;
    st.velocityX = st.velocityX * 0.35 + instantVx * 0.65;
    st.lastX = e.clientX;
    st.lastTime = now;

    const width = viewportRef.current?.clientWidth || 1280;
    // Apply Apple rubber-banding at Room 00 (dragging right) and Room 05 (dragging left)
    if ((roomIdx === 0 && dx > 0) || (roomIdx === ROOM_LIST.length - 1 && dx < 0)) {
      setDragOffsetPx(rubberband(dx, width, 0.42));
    } else {
      setDragOffsetPx(dx);
    }
  };

  const handlePointerEnd = e => {
    const st = dragState.current;
    if (!st.active || e.pointerId !== st.pointerId) return;
    st.active = false;
    setIsDragging(false);

    const width = viewportRef.current?.clientWidth || 1280;
    const stepPitch = width * 0.78;
    const projectedDx = dragOffsetPx + projectMomentum(st.velocityX, 0.992);

    let deltaRooms = 0;
    if (projectedDx < -stepPitch * 0.22 || st.velocityX < -240) {
      deltaRooms = 1;
    } else if (projectedDx > stepPitch * 0.22 || st.velocityX > 240) {
      deltaRooms = -1;
    }

    setDragOffsetPx(0);
    if (deltaRooms !== 0) {
      setRoomIdx(prev => Math.max(0, Math.min(ROOM_LIST.length - 1, prev + deltaRooms)));
    }
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

  return (
    <StudioShell
      lang={lang}
      activeKey="home"
      theme={theme}
      onSetTheme={next => themeController.current?.set(next)}
      languageHref={languageHref}
    >
      <div className="ab-gallery">
        {/* ====================================================================
         * SUBTLE EXHIBITION WAYFINDING BAR (Top Museum Coordinate & Contact-Sheet Toggle)
         * ==================================================================== */}
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
              aria-expanded={overviewOpen}
              onClick={() => setOverviewOpen(prev => !prev)}
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
          role="dialog"
          aria-hidden={!overviewOpen}
          aria-label={text('展品看片台总览', 'Exhibition Contact Sheet')}
        >
          <div className="ab-sheet-grid">
            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 0 ? 'is-current' : ''}`} onClick={() => goToRoom(0)}>
              <div className="ab-sheet-thumb">
                <Media src={`${ASSETS}self-profo.jpg`} alt="Kenny Wu" />
              </div>
              <div className="ab-sheet-meta mono">
                <span>00</span>
                <strong>{text('策展自序与肖像', 'Prologue & Portrait')}</strong>
              </div>
            </button>

            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 1 ? 'is-current' : ''}`} onClick={() => goToRoom(1)}>
              <div className="ab-sheet-thumb">
                <Media src={`${ASSETS}videowipe-after.jpg`} alt="VideoWipe" />
              </div>
              <div className="ab-sheet-meta mono">
                <span>01</span>
                <strong>VideoWipe</strong>
              </div>
            </button>

            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 2 ? 'is-current' : ''}`} onClick={() => goToRoom(2)}>
              <div className="ab-sheet-thumb">
                <Media src={`${ASSETS}${kamiShot.image}`} alt={kamiTitle} />
              </div>
              <div className="ab-sheet-meta mono">
                <span>02</span>
                <strong>Kami Reader</strong>
              </div>
            </button>

            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 3 ? 'is-current' : ''}`} onClick={() => goToRoom(3)}>
              <div className="ab-sheet-thumb">
                <Media src={`${ASSETS}${posterShot.image}`} alt={posterTitle} />
              </div>
              <div className="ab-sheet-meta mono">
                <span>03</span>
                <strong>Card-Skill</strong>
              </div>
            </button>

            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 4 ? 'is-current' : ''}`} onClick={() => goToRoom(4)}>
              <div className="ab-sheet-thumb ab-sheet-typo">
                <strong>≈18% → 9.53%</strong>
                <small className="mono">20 EPS RECOVERY</small>
              </div>
              <div className="ab-sheet-meta mono">
                <span>04</span>
                <strong>{text('系统工程交付', 'Engineering')}</strong>
              </div>
            </button>

            <button type="button" tabIndex={overviewOpen ? 0 : -1} className={`ab-sheet-card ${roomIdx === 5 ? 'is-current' : ''}`} onClick={() => goToRoom(5)}>
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

        {/* ====================================================================
         * A+B FUSED KINETIC WHITE-WALL CORRIDOR APERTURE
         * - Hardware-accelerated translate3d camera track (Zero OS scrollbars)
         * - Center room has Variant A's pure white wall + miniature placard
         * - Adjacent rooms (prev/next) peek from the left/right edges with depth scale
         * ==================================================================== */}
        <section
          ref={viewportRef}
          className={`ab-corridor-viewport ${isDragging ? 'is-dragging' : ''}`}
          aria-label={text('水平漫步白墙展厅', 'Horizontal white-wall exhibition corridor')}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div
            className="ab-camera-track"
            style={{
              '--active-idx': roomIdx,
              '--drag-px': `${dragOffsetPx.toFixed(1)}px`
            }}
          >
            {/* ----------------------------------------------------------------
             * BAY 00: CURATOR'S STATEMENT & FISHEYE PORTRAIT
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 0 ? 'is-active' : ''} ${roomIdx > 0 ? 'is-past' : ''}`}
              style={{'--bay-offset': 0 - roomIdx}}
              aria-hidden={roomIdx !== 0}
              onClick={() => {
                if (roomIdx !== 0) goToRoom(0);
              }}
            >
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner">
                    <SceneLink className="ex-portrait-frame" route={{view: 'about'}} lang={lang} tabIndex={roomIdx === 0 ? 0 : -1}>
                      <Media
                        src={`${ASSETS}self-profo.jpg`}
                        alt={text('Kenny Wu 的黑白鱼眼肖像', 'Black-and-white fisheye portrait of Kenny Wu')}
                        loading="eager"
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
                    <button type="button" className="ex-step-trigger" onClick={() => goToRoom(1)}>
                      {text('步入 01 号展品 →', 'WALK TO EXHIBIT 01 →')}
                    </button>
                    <SceneLink route={{view: 'about'}} lang={lang} tabIndex={roomIdx === 0 ? 0 : -1}>
                      {text('策展人履历 ↗', 'BIOGRAPHY ↗')}
                    </SceneLink>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 01: VIDEOWIPE OPTICAL ERASER LOUPE
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 1 ? 'is-active' : ''} ${1 < roomIdx ? 'is-past' : ''} ${1 > roomIdx ? 'is-future' : ''}`}
              style={{'--bay-offset': 1 - roomIdx}}
              aria-hidden={roomIdx !== 1}
              onClick={e => {
                if (roomIdx !== 1 && !e.target.closest('a, button, input, .ba-compare')) goToRoom(1);
              }}
            >
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-artwork-mount">
                    <VideoWipeCompare text={text} inputId="cg-comparison" />
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
                    <SceneLink route={{view: 'projects', item: 'videowipe', source: 'home'}} lang={lang} tabIndex={roomIdx === 1 ? 0 : -1}>
                      {text('展品档案 →', 'DOSSIER →')}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'ai'}} lang={lang} tabIndex={roomIdx === 1 ? 0 : -1}>
                      {text('03 AI 展厅 →', 'AI ROOM →')}
                    </SceneLink>
                    <a href={videowipe.url} target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 1 ? 0 : -1}>
                      GITHUB ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 02: KAMI READER WORKBENCH
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 2 ? 'is-active' : ''} ${2 < roomIdx ? 'is-past' : ''} ${2 > roomIdx ? 'is-future' : ''}`}
              style={{'--bay-offset': 2 - roomIdx}}
              aria-hidden={roomIdx !== 2}
              onClick={e => {
                if (roomIdx !== 2) {
                  e.preventDefault();
                  goToRoom(2);
                }
              }}
            >
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-framed-print">
                    <SceneLink route={{view: 'taste', arg: 'kami-reader', work: 0}} lang={lang} tabIndex={roomIdx === 2 ? 0 : -1}>
                      <Media src={`${ASSETS}${kamiShot.image}`} alt={kamiTitle} />
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
                    <SceneLink route={{view: 'taste', arg: 'kami-reader', work: 0}} lang={lang} tabIndex={roomIdx === 2 ? 0 : -1}>
                      {text('放大观看展板 →', 'INSPECT PLATE →')}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'taste'}} lang={lang} tabIndex={roomIdx === 2 ? 0 : -1}>
                      {text('02 Taste 展厅 →', 'TASTE ROOM →')}
                    </SceneLink>
                    <a href={kami.url} target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 2 ? 0 : -1}>
                      GITHUB ★ {metrics['KKenny0/obsidian-kami']?.stars ?? 7} ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 03: A THOUSAND BRAINS POSTER
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 3 ? 'is-active' : ''} ${3 < roomIdx ? 'is-past' : ''} ${3 > roomIdx ? 'is-future' : ''}`}
              style={{'--bay-offset': 3 - roomIdx}}
              aria-hidden={roomIdx !== 3}
              onClick={e => {
                if (roomIdx !== 3) {
                  e.preventDefault();
                  goToRoom(3);
                }
              }}
            >
              <div className="ab-bay-inner">
                <div className="ab-wall-canvas">
                  <div className="ab-parallax-inner ex-framed-print ex-print-vertical">
                    <SceneLink route={{view: 'taste', arg: 'card-skill', work: 0}} lang={lang} tabIndex={roomIdx === 3 ? 0 : -1}>
                      <Media src={`${ASSETS}${posterShot.image}`} alt={posterTitle} />
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
                    <SceneLink route={{view: 'taste', arg: 'card-skill', work: 0}} lang={lang} tabIndex={roomIdx === 3 ? 0 : -1}>
                      {text('查看三组生成样张 →', 'INSPECT 3 PLATES →')}
                    </SceneLink>
                    <SceneLink route={{view: 'projects', item: 'card-skill', source: 'home'}} lang={lang} tabIndex={roomIdx === 3 ? 0 : -1}>
                      {text('项目详情 →', 'DOSSIER →')}
                    </SceneLink>
                    <a href={cardSkill.url} target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 3 ? 0 : -1}>
                      GITHUB ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 04: 20-EPISODE AUTONOMOUS RECOVERY & KOTAEMON
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 4 ? 'is-active' : ''} ${4 < roomIdx ? 'is-past' : ''} ${4 > roomIdx ? 'is-future' : ''}`}
              style={{'--bay-offset': 4 - roomIdx}}
              aria-hidden={roomIdx !== 4}
              onClick={e => {
                if (roomIdx !== 4 && !e.target.closest('a, button')) goToRoom(4);
              }}
            >
              <div className="ab-bay-inner">
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
                        <a href="https://github.com/Cinnamon/kotaemon/pull/287" target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 4 ? 0 : -1}>
                          #287 TEI Reranking ↗
                        </a>
                        <a href="https://github.com/Cinnamon/kotaemon/pull/341" target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 4 ? 0 : -1}>
                          #341 Chat Suggestions ↗
                        </a>
                        <a href="https://github.com/Cinnamon/kotaemon/pull/461" target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 4 ? 0 : -1}>
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
                    <SceneLink route={{view: 'lens', arg: 'execution'}} lang={lang} tabIndex={roomIdx === 4 ? 0 : -1}>
                      {text('查看工程实践档案 →', 'EXECUTION DOSSIER →')}
                    </SceneLink>
                    <SceneLink route={{view: 'about'}} lang={lang} tabIndex={roomIdx === 4 ? 0 : -1}>
                      {text('完整工程履历 →', 'ENGINEERING BIO →')}
                    </SceneLink>
                    <a href={scriptWeaver.url} target="_blank" rel="noopener noreferrer" tabIndex={roomIdx === 4 ? 0 : -1}>
                      SCRIPT-WEAVER ↗
                    </a>
                  </div>
                </aside>
              </div>
            </article>

            {/* ----------------------------------------------------------------
             * BAY 05: SYSTEMS RESEARCH & FIELD OBSERVATIONS VITRINE
             * ---------------------------------------------------------------- */}
            <article
              className={`ab-bay ${roomIdx === 5 ? 'is-active' : ''} ${5 < roomIdx ? 'is-past' : ''} ${5 > roomIdx ? 'is-future' : ''}`}
              style={{'--bay-offset': 5 - roomIdx}}
              aria-hidden={roomIdx !== 5}
              onClick={e => {
                if (roomIdx !== 5 && !e.target.closest('a, button')) goToRoom(5);
              }}
            >
              <div className="ab-bay-inner">
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
                          tabIndex={roomIdx === 5 ? 0 : -1}
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
                            <SceneLink route={{view: 'notes', item: note.id, source: 'online'}} lang={lang} tabIndex={roomIdx === 5 ? 0 : -1}>
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
                    <SceneLink route={{view: 'notes'}} lang={lang} tabIndex={roomIdx === 5 ? 0 : -1}>
                      {text(`全部 ${entries.length} 篇手稿 →`, `ALL ${entries.length} WRITINGS →`)}
                    </SceneLink>
                    <SceneLink route={{view: 'lens', arg: 'online'}} lang={lang} tabIndex={roomIdx === 5 ? 0 : -1}>
                      {text('01 观察展厅 →', 'ONLINE ROOM →')}
                    </SceneLink>
                    <SceneLink route={{view: 'support'}} lang={lang} tabIndex={roomIdx === 5 ? 0 : -1}>
                      {text('支持创作 →', 'SUPPORT →')}
                    </SceneLink>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </section>

        {/* ====================================================================
         * EMIL KOWALSKI CLIP-PATH FLUID FLOOR-PLAN SCRUBBER
         * Continuous physical progress indicator + duplicated clip-path tab rail
         * ==================================================================== */}
        <footer className="ab-floor-scrubber mono" aria-label={text('长廊展位步进器', 'Gallery corridor scrubber')}>
          <button
            type="button"
            className="ab-step-btn"
            disabled={roomIdx === 0}
            onClick={() => goToRoom(roomIdx - 1)}
          >
            ← {text('向西漫步', 'WEST')}
          </button>

          <div className="ab-scrubber-center">
            {/* Base layer (inactive tabs) */}
            <div className="ab-tab-layer ab-tab-base" role="tablist">
              {ROOM_LIST.map((r, idx) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={roomIdx === idx}
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
            disabled={roomIdx === ROOM_LIST.length - 1}
            onClick={() => goToRoom(roomIdx + 1)}
          >
            {text('向东漫步', 'EAST')} →
          </button>
        </footer>
      </div>
    </StudioShell>
  );
}
