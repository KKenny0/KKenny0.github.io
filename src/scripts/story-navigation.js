(() => {
  const url = new URL(location.href);
  const base = document.documentElement.lang === 'en' ? '' : '/zh';
  const slugs = ['tracework', 'weave'];
  const sources = ['online', 'taste', 'ai', 'execution', 'projects', 'notes', 'about', 'work'];
  const source = (params, key) => sources.includes(params.get(key)) ? params.get(key) : null;
  const pathFor = (section, project) => `${base}/${section}/${project}/`;
  const relative = target => target.pathname + target.search + target.hash;
  const project = slugs.find(slug => pathFor('projects', slug) === `${url.pathname.replace(/\/$/, '')}/`);
  const supportBack = document.querySelector('[data-support-back]');
  const supportedProject = url.searchParams.get('project');

  if (project) {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const fromWork = referrer?.origin === url.origin && `${referrer.pathname.replace(/\/$/, '')}/` === pathFor('work', project);
    const referrerSource = fromWork ? source(referrer.searchParams, 'from') : null;
    const from = source(url.searchParams, 'from');
    const via = from === 'work' ? source(url.searchParams, 'via') : from ?? referrerSource;
    const origin = via && (
      (from === 'work' ? source(url.searchParams, 'origin') : null) ??
      ((!from || from === 'work') && via === referrerSource ? source(referrer.searchParams, 'via') : null)
    );
    const back = new URL(pathFor('work', project), url);
    if (via) back.searchParams.set('from', via);
    if (origin) back.searchParams.set('via', origin);
    for (const link of document.querySelectorAll('[data-project-back]')) link.href = relative(back);
    for (const link of document.querySelectorAll('[data-story-support]')) {
      const target = new URL(link.href);
      if (via) target.searchParams.set('via', via);
      if (origin) target.searchParams.set('origin', origin);
      link.href = relative(target);
    }
    if (via && (!from || (from === 'work' && origin && !url.searchParams.has('origin')))) {
      url.searchParams.set('from', 'work');
      url.searchParams.set('via', via);
      if (origin) url.searchParams.set('origin', origin);
      history.replaceState(history.state, '', url);
    }
  } else if (supportBack && slugs.includes(supportedProject)) {
    const target = new URL(pathFor('projects', supportedProject), url);
    const via = source(url.searchParams, 'via');
    const origin = via ? source(url.searchParams, 'origin') : null;
    if (via) {
      target.searchParams.set('from', 'work');
      target.searchParams.set('via', via);
    }
    if (origin) target.searchParams.set('origin', origin);
    target.hash = 'case';
    supportBack.href = relative(target);
    const name = supportedProject === 'tracework' ? 'Tracework' : 'weave';
    supportBack.textContent = base ? `← 返回 ${name} 案例` : `← Back to the ${name} case`;
  }

  for (const link of document.querySelectorAll('[data-language]')) {
    link.href = link.pathname + url.search + url.hash;
  }
})();
