import React from 'react';
import {routePath} from '../../lib/space-routes';

// The official space uses the production paths; the prototype provides its own
// pathFor through this context, so reused views keep emitting correct links.
export const RoutePathContext=React.createContext(routePath);

// Real links preserve copying, new tabs, deep links and navigation before hydration.
export function SceneLink({route,lang,children,type,onClick,onActivate,...props}){
  const pathFor=React.useContext(RoutePathContext);
  return <a {...props} data-scene="true" href={pathFor(route,lang)} onClick={e=>{
    onClick?.(e);
    if(onActivate&&!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onActivate(e);}
  }}>{children}</a>;
}
