import React,{useEffect,useRef} from 'react';
import {lensInfo} from '../../data/space';
import {SceneLink} from './SceneLink';
import {Media} from './Media';
import {animatePlayground} from '../../scripts/home-playground';
import '../../styles/home-playground.css';

export function HomePlayground({lang,mainRef,settingsOpen,paused,onTogglePaused}){
  const root=useRef(null),pausedRef=useRef(false);
  pausedRef.current=paused||settingsOpen;
  useEffect(()=>animatePlayground(root.current,()=>pausedRef.current),[]);
  const zh=lang==='zh';
  return <main id="main" className="home-scene home-playground screen-enter" data-screen-label="Home" ref={node=>{root.current=node;mainRef.current=node;}} tabIndex="-1">
    <div className="playground-scenery" aria-hidden="true"><Media src="/assets/space/playground-scenery.png" alt="" loading="eager" sizes="(max-width: 899px) 100vw, 1600px" /></div>
    <SceneLink className="playground-identity" route={{view:'about',arg:'home'}} lang={lang} aria-label={zh?'认识镜头背后的 Kenny Wu':'Meet Kenny Wu, the person behind the lenses'}>
      <span className="mono">KENNY WU / AI ENGINEER</span>
      <h1>{zh?<>持续观察，<br/>也把想法做出来。</>:<>Keep noticing.<br/>Put ideas into form.</>}</h1>
      <span className="identity-invitation">{zh?'镜头背后的人':'The person behind the lenses'} <span aria-hidden="true">→</span></span>
    </SceneLink>
    <nav className="playground-field" aria-label={zh?'四个镜头入口':'Four lenses'}>
      {Object.entries(lensInfo).map(([id,l])=><SceneLink className="playground-character" key={id} route={{view:'lens',arg:id}} lang={lang} aria-label={zh?`靠近 ${l.name} 镜头`:`Explore ${l.name}`}>
        <span className="playground-shadow" aria-hidden="true"></span>
        <span className="playground-body"><Media src={'/assets/space/'+l.character} alt="" sizes="(max-width: 899px) 142px, 240px" draggable="false" /></span>
        <span className="playground-name"><small className="mono">{l.number}</small><strong>{l.name}</strong></span>
        <span className="playground-description">{zh?l.zh:l.short}</span>
      </SceneLink>)}
    </nav>
    <div className="playground-footer"><span>{zh?'靠近停住 · 点击探索':'Hover to pause · Click to explore'}</span><button type="button" aria-pressed={paused} onClick={onTogglePaused}>{paused?(zh?'继续活动':'Resume motion'):(zh?'暂停活动':'Pause motion')}</button></div>
  </main>;
}
