import {tasteProducts} from '../../data/taste';
import React from 'react';
import {prototypeText,localizedNote,tasteEnglish} from '../../data/space-i18n';
import aboutContent from '../../data/space-about.json';
import {SceneLink} from './SceneLink';
import {Media} from './Media';
/* Persistent viewing surfaces. App owns the selection and route. */
function LensTuner({expanded,entries,curated,selected,onSelect,onExpand,onCollapse,collapseLabel,lang,query,setQuery,filter,setFilter}){
  const text=(zh,en)=>prototypeText(lang,zh,en);
  const root=React.useRef(null),rail=React.useRef(null),gesture=React.useRef({sum:0,last:-Infinity,stamp:0});
  const beforeSearch=React.useRef(null);
  const list=(expanded?entries:curated).filter(n=>(filter==='all'||!expanded||(filter==='ai'?n.primary==='ai':n.topic===filter))&&(!expanded||`${n.title} ${n.originalTitle||''} ${n.teaser}`.toLowerCase().includes(query.trim().toLowerCase())));
  const resultKey=list.map(n=>n.id).join('|');
  React.useEffect(()=>{
    if(query.trim()||filter!=='all'){
      if(!beforeSearch.current)beforeSearch.current=selected.id;
      if(list.length&&!list.some(n=>n.id===selected.id))onSelect(list[0].id);
    }else if(beforeSearch.current){const id=beforeSearch.current;beforeSearch.current=null;onSelect(id);}
  },[query,filter,resultKey]);
  function clearSearch(){setQuery('');setFilter('all');root.current.querySelector('.tuner-stage')?.focus({preventScroll:true});}
  const active=list.findIndex(n=>n.id===selected.id);
  const step=React.useCallback((direction)=>{
    const next=list[Math.max(0,Math.min(list.length-1,active+direction))];
    if(!next||next.id===selected.id)return false;
    onSelect(next.id);return true;
  },[list,active,selected.id,onSelect]);
  React.useEffect(()=>{
    const node=root.current.closest('main')||root.current;
    const wheel=e=>{
      if(e.ctrlKey||e.target.closest('[data-native-scroll],input,summary'))return;
      if(Math.abs(e.deltaY)<Math.abs(e.deltaX))return;
      const g=gesture.current,now=performance.now();
      if(now-g.stamp>160||Math.sign(g.sum)!==Math.sign(e.deltaY))g.sum=0;
      g.stamp=now;g.sum+=e.deltaY;
      const direction=Math.sign(e.deltaY),canMove=direction>0?active<list.length-1:active>0;
      if(!canMove)return;
      e.preventDefault();
      if(Math.abs(g.sum)>=45&&now-g.last>230){step(direction);g.last=now;g.sum=0;}
    };
    node.addEventListener('wheel',wheel,{passive:false});
    return()=>node.removeEventListener('wheel',wheel);
  },[step,active,list.length]);
  React.useEffect(()=>{
    const activeButton=rail.current?.querySelector('[aria-current="true"]');
    if(!activeButton)return;
    const scroller=rail.current,box=activeButton.getBoundingClientRect(),frame=scroller.getBoundingClientRect();
    if(scroller.scrollWidth>scroller.clientWidth){scroller.scrollLeft+=box.left-frame.left-(frame.width-box.width)/2;}
    else if(box.top<frame.top||box.bottom>frame.bottom){scroller.scrollTop+=box.top-frame.top-(frame.height-box.height)/2;}
  },[selected.id,expanded,query,filter]);
  const touch=React.useRef(null);
  const arcIndex=Math.max(0,entries.findIndex(n=>n.id===selected.id));
  const angle=-90+Math.min(arcIndex,entries.length-1)*235/Math.max(1,entries.length-1);
  return <section ref={root} className={`tuner-layout ${expanded?'is-expanded':''}`} onKeyDown={e=>{
    if(e.target.closest('input,summary,select,button,a'))return;
    if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();step(['ArrowDown','ArrowRight'].includes(e.key)?1:-1);}
  }}>
    <div className="tuner-heading"><div><span className="mono">{expanded?'NOTES':'ONLINE'} / 2026</span><h1>{lang==='zh'?'持续调谐。':'Keep tuning.'}</h1></div><p>{lang==='zh'?'最新在前 · 向下回看':'Newest first · scroll down to look back'}</p></div>
    <div className="tuner-apparatus">
      <div className="tuner-stage" tabIndex="0" aria-label={text('观察取景区，使用上下方向键切换','Observation viewer. Use arrow keys to switch.')} onTouchStart={e=>{if(e.touches.length===1)touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}} onTouchEnd={e=>{
        if(!touch.current)return;const dx=touch.current.x-e.changedTouches[0].clientX,dy=touch.current.y-e.changedTouches[0].clientY;touch.current=null;
        if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy))step(Math.sign(dx));
      }}>
        <div className="tuner-circle"><div className="tuner-orbit" style={{transform:`rotate(${angle}deg)`}}><span className="tuner-dot"></span><Media src="/assets/space/online.webp" alt="" style={{transform:`rotate(${-angle}deg)`}}/></div><div className="tuner-current" aria-live="polite" aria-atomic="true">{list.length?<><span className="mono">{selected.date} / {selected.primary==='ai'?'TECHNICAL WRITING':'OBSERVATION'}</span><h2>{selected.title}</h2><p>{selected.teaser||selected.summary}</p><a href={selected.url} target="_blank" rel="noopener noreferrer">{selected.provisional?text('在合集查看 ↗','Open collection ↗'):text('阅读原文 ↗','Read Chinese original ↗')}</a></>:<><h2>{text('没有找到相关观察','No matching observations')}</h2><p>{text('换个关键词，或返回完整观察线。','Try another keyword, or return to the full observation line.')}</p><button type="button" className="clear-search" onClick={clearSearch}>{text('清除搜索与筛选','Clear search and filters')}</button></>}</div></div>
        <div className="tuner-controls"><button type="button" disabled={active<=0} onClick={()=>step(-1)} aria-label={text('较新的观察','Newer observation')}>←</button><span>{text('滚轮 / ← → 滑动 / 方向键','Wheel / swipe / arrow keys')}</span><button type="button" disabled={active<0||active===list.length-1} onClick={()=>step(1)} aria-label={text('较早的观察','Older observation')}>→</button></div>
      </div>
      <aside className={`tuner-index ${expanded?'index-expanded':''}`}>
        <div className="tuner-index-heading"><h2>{lang==='zh'?(expanded?'观察档案':'精选观察'):(expanded?'Archive':'Selected observations')}</h2><span className="mono">{expanded?list.length:curated.length}</span></div>
        {expanded&&<details className="archive-tools" data-native-scroll><summary>{text('查找观察','Find an observation')} <span className="disclosure-sign" aria-hidden="true"></span></summary><label><span className="sr-only">{text('搜索观察','Search observations')}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={text('标题 / 关键词','Title / keyword')}/></label><div><button type="button" aria-pressed={filter==='all'} className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>{text('全部','All')}</button><button type="button" aria-pressed={filter==='ai'} className={filter==='ai'?'active':''} onClick={()=>setFilter('ai')}>{text('AI 精选','AI selections')}</button></div><label className="topic-select"><span>{text('主题','Topic')}</span><select value={filter} onChange={e=>setFilter(e.target.value)}>{[['all',text('全部','All')],['memory',text('记忆','Memory')],['context',text('上下文','Context')],['agents','Agents'],['ai',text('AI 精选','AI selections')]].map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></label></details>}
        <div ref={rail} className="tuner-rail" data-native-scroll>{list.map(n=><SceneLink id={expanded?`note-${n.id}`:undefined} route={{view:'notes',arg:'online',item:n.id}} lang={lang} key={n.id} aria-current={selected.id===n.id} onActivate={()=>{beforeSearch.current=null;onSelect(n.id);}}><time className="mono">{n.date}</time><span>{expanded?n.title:n.label||n.title}</span></SceneLink>)}{!list.length&&<p className="empty-result">{text('没有找到相关观察，请换个关键词。','No matches. Try another keyword.')}</p>}</div>
        {expanded?<SceneLink className="tuner-expand" route={{view:'lens',arg:'online'}} lang={lang} onActivate={onCollapse}>{collapseLabel}</SceneLink>:<SceneLink className="tuner-expand" route={{view:'notes',arg:'online',item:selected.id}} lang={lang} onActivate={onExpand}>{lang==='zh'?'展开全部观察':'Explore full archive'} <span>→</span></SceneLink>}
      </aside>
    </div>
  </section>;
}

function TasteViewer({productId,index,onSelect,onProducts,onProjects,lang}){
  const text=(zh,en)=>prototypeText(lang,zh,en);
  const product=tasteProducts.find(p=>p.id===productId)||tasteProducts[0],originalWork=product.works[index]||product.works[0];
  const translation=tasteEnglish[originalWork.image],work=lang==='zh'?originalWork:{...originalWork,title:translation[0],description:translation[1],sourceLabel:translation[2]};
  const dialog=React.useRef(null),image=React.useRef(null),trigger=React.useRef(null),motion=React.useRef(null),zoomSequence=React.useRef(0);
  React.useEffect(()=>()=>{zoomSequence.current+=1;motion.current?.cancel();},[]);
  async function zoom(e){
    const node=dialog.current,isOpen=node.open,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.input==='keyboard'||e?.detail===0||e?.type==='cancel';
    const sequence=++zoomSequence.current;
    motion.current?.cancel();
    if(!isOpen){node.showModal();node.querySelector('button').focus({preventScroll:true});}
    if(!isOpen)await image.current.decode().catch(()=>{});
    if(sequence!==zoomSequence.current)return;
    if(!trigger.current.querySelector('img').naturalWidth||!image.current.naturalWidth){if(isOpen){node.close();trigger.current.focus({preventScroll:true});}return;}
    const paintedRect=img=>{const box=img.getBoundingClientRect(),ratio=Math.min(box.width/img.naturalWidth,box.height/img.naturalHeight),width=img.naturalWidth*ratio,height=img.naturalHeight*ratio;return {left:box.left+(box.width-width)/2,top:box.top+(box.height-height)/2,width,height};};
    const from=paintedRect(trigger.current.querySelector('img')),to=paintedRect(image.current),box=image.current.getBoundingClientRect(),scale=from.width/to.width;
    const small={transform:`translate(${from.left-box.left-(to.left-box.left)*scale}px,${from.top-box.top-(to.top-box.top)*scale}px) scale(${scale})`},large={transform:'translate(0,0) scale(1)'};
    if(!reduced){motion.current=image.current.animate(isOpen?[large,small]:[small,large],{duration:isOpen?180:260,easing:'cubic-bezier(.23,1,.32,1)',fill:'both'});try{await motion.current.finished;}catch{return;}}
    if(isOpen){node.close();trigger.current.focus({preventScroll:true});}motion.current?.cancel();motion.current=null;
  }
  return <section className="taste-viewer">
    <div className="taste-viewer-top"><SceneLink route={{view:'lens',arg:'taste'}} lang={lang} onActivate={onProducts}>← {lang==='zh'?'产品':'Products'}</SceneLink><span className="mono">TASTE / {product.name} / {String(index+1).padStart(2,'0')}</span><SceneLink route={{view:'projects',arg:'taste',item:productId==='kami-reader'?'obsidian-kami':'card-skill'}} lang={lang} onActivate={onProjects}>{lang==='zh'?'全部项目 →':'All projects →'}</SceneLink></div>
    <div className="taste-frame"><span className="taste-frame-ring" aria-hidden="true"></span><button type="button" className="taste-art" ref={trigger} onClick={zoom} aria-label={`${text('查看大图：','Zoom in: ')}${work.title}`}><Media src={'/assets/space/'+work.image} alt={work.title}/><span className="art-zoom-label">＋ {text('查看大图','Zoom in')}</span></button></div>
    <div className="taste-caption"><div><span className="mono">{product.name} / {index+1} OF {product.works.length}{lang==='en'?` · IMAGE LANGUAGE: ${work.imageLanguage||'CHINESE'}`:''}</span><h1>{work.title}</h1></div><div><p>{work.description}</p><div className="taste-sources"><a href={'/assets/space/'+work.image} target="_blank" rel="noopener noreferrer">{text('打开原图 ↗','Open original image ↗')}</a>{work.source&&<a href={work.source} target="_blank" rel="noopener noreferrer">{work.sourceLabel}</a>}<a href={product.url} target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></div>
    <nav className="taste-switch" aria-label={text('切换作品','Switch artwork')}><SceneLink route={{view:'taste',arg:productId,work:Math.max(0,index-1)}} lang={lang} aria-disabled={index===0} onActivate={()=>onSelect(Math.max(0,index-1))}>← {text('上一幅','Previous')}</SceneLink><div>{product.works.map((w,i)=><SceneLink route={{view:'taste',arg:productId,work:i}} lang={lang} key={w.title} aria-label={`${text('查看作品：','View artwork: ')}${lang==='zh'?w.title:tasteEnglish[w.image][0]}`} aria-current={i===index} onActivate={()=>onSelect(i)}><span></span></SceneLink>)}</div><SceneLink route={{view:'taste',arg:productId,work:Math.min(product.works.length-1,index+1)}} lang={lang} aria-disabled={index===product.works.length-1} onActivate={()=>onSelect(Math.min(product.works.length-1,index+1))}>{text('下一幅','Next')} →</SceneLink></nav>
    <dialog ref={dialog} className="art-dialog" aria-label={`${work.title} · ${text('大图','Enlarged artwork')}`} onKeyDown={e=>{if(e.key!=='Tab')return;const buttons=[...dialog.current.querySelectorAll('button')],first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}} onCancel={e=>{e.preventDefault();zoom(e);}} onClick={e=>{if(e.target===e.currentTarget)zoom(e);}}><button type="button" className="art-dialog-close" onClick={zoom} aria-label={text('关闭大图','Close')}>− <span>{text('关闭大图','Close')}</span></button><button type="button" className="expanded-art" onClick={zoom} aria-label={text('关闭大图并返回','Close and return')}><Media ref={image} sizes="100vw" loading="eager" src={'/assets/space/'+work.image} alt={work.title}/></button></dialog>
  </section>;
}
function ResearchViewer({note,entries,onSelect,lang}){
  const text=(zh,en)=>prototypeText(lang,zh,en),[query,setQuery]=React.useState(''),paper=React.useRef(null);
  const matches=entries.filter(n=>`${n.title} ${n.originalTitle||''} ${n.teaser}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="research-viewer">
    <article ref={paper} className="research-paper" tabIndex="-1" style={{viewTransitionName:'selected-writing'}}>
      <Media className="research-perch" src="/assets/space/ai-perch.webp" alt=""/>
      <div className="research-meta"><span>{note.primary==='ai'?text('专业文章','Technical writing'):text('文章','Writing')}</span><time>{note.date.replace('-', '.')}</time></div>
      <h1>{note.title}</h1><p className="research-description">{note.teaser}</p>
      <div className="research-source"><span>{note.source} · {text('中文原文','Chinese original')}</span><a href={note.url} target="_blank" rel="noopener noreferrer">{note.provisional?text('在合集查看 ↗','Open collection ↗'):text('阅读原文 ↗','Read original ↗')}</a></div>
    </article>
    <details className="research-archive"><summary>{text('更多专业文章','More technical writing')} <span><span className="archive-count">{entries.length}</span> <span className="disclosure-sign" aria-hidden="true"></span></span></summary><label className="research-search"><span>{text('查找专业文章','Find an article')}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={text('标题 / 关键词','Title / keyword')}/></label><div>{matches.map(n=><SceneLink id={`note-${n.id}`} route={{view:'notes',arg:'ai',item:n.id}} lang={lang} key={n.id} aria-current={note.id===n.id} onActivate={()=>{onSelect(n.id);paper.current.scrollIntoView({behavior:'instant',block:'start'});paper.current.focus({preventScroll:true});}}><time>{n.date}</time><span>{n.title}</span><span aria-hidden="true">→</span></SceneLink>)}{!matches.length&&<p>{text('没有找到文章，请换个关键词。','No matching articles. Try another keyword.')}</p>}</div></details>
  </section>;
}
function AboutMore({lang}){return <details className="about-more"><summary>{prototypeText(lang,'更多经历、研究与日常','More experience, research and everyday life')} <span className="disclosure-sign" aria-hidden="true"/></summary><div className="about-full" dangerouslySetInnerHTML={{__html:aboutContent[lang]}}/></details>}
export {LensTuner,TasteViewer,tasteProducts,ResearchViewer,AboutMore};
