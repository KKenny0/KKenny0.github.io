export function navigation(lang: 'en' | 'zh') {
  const english = lang === 'en';
  const base = english ? '' : '/zh';
  return [
    { href: `${base}/`, label: english ? 'Home' : '首页' },
    { href: `${base}/projects/`, label: english ? 'Projects' : '项目' },
    { href: `${base}/notes/`, label: english ? 'Notes' : '笔记' },
    { href: `${base}/about/`, label: english ? 'About' : '关于' },
  ];
}

export function isCurrentNavigation(currentPath: string, href: string) {
  return currentPath === href || (!['/', '/zh/'].includes(href) && currentPath.startsWith(href));
}
