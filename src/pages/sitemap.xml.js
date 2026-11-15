import {site} from '../data/site';
import {spaceEntries,canonicalPath} from '../lib/space-routes';

export function GET(){
  const routes=[
    {view:'home'}, {view:'projects'}, {view:'notes'}, {view:'about'},
    {view:'support'}, {view:'story',arg:'tracework'}, {view:'story',arg:'weave'},
    ...spaceEntries().map(entry=>entry.route)
  ];
  const urls=new Set(['en','zh'].flatMap(lang=>routes.map(route=>new URL(canonicalPath(route,lang),site.canonical).href)));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
