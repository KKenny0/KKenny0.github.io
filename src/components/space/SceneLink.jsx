import React from 'react';
import {routePath} from '../../lib/space-routes';

// Real links preserve copying, new tabs, deep links and navigation before hydration.
export function SceneLink({route,lang,children,type,onClick,onActivate,...props}){
  return <a {...props} data-scene="true" href={routePath(route,lang)} onClick={e=>{
    onClick?.(e);
    if(onActivate&&!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onActivate(e);}
  }}>{children}</a>;
}
