import React from 'react';
import '../../styles/collage-nav.css';

export default function CollageNav({lang,view,mode='prototype'}){
  const zh=lang==='zh';
  const base=`${zh?'/zh':''}${mode==='formal'?'':'/collage'}/`;
  const entries=[['about/',zh?'关于':'About','about'],['projects/',zh?'项目':'Projects','projects'],['notes/',zh?'文章':'Writing','notes'],['support/',zh?'支持':'Support','support']];
  const topics=[['online',zh?'观察':'Observations'],['taste','Taste'],['ai','AI'],['execution',zh?'实践':'Practice']];
  return <nav className="cg-nav" aria-label={zh?'主导航':'Main navigation'}>
    {entries.map(([path,label,key])=><a key={key} href={base+path} aria-current={view===key?'page':undefined}>{label}</a>)}
    <details className="cg-nav-topics"><summary>{zh?'主题':'Topics'}</summary><div>{topics.map(([id,label])=><a key={id} href={`${base}lens/${id}/`}>{label}</a>)}</div></details>
  </nav>;
}
