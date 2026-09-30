# Kenny · 交付与判断 / 原型 v2

中英双语高保真原型：index.html、projects.html、about.html 及对应的 -en.html 页面。语言切换保留所在页面、章节、筛选和排序。三页导航、主题切换、项目筛选/排序/展开和照片放大可交互。正式站点文件未改动。

交互修订：按压反馈 140ms，展开反馈 180ms，照片打开 200ms，仅使用 opacity / transform；键盘操作和减少动态效果设置下无动画。筛选分别显示活跃与归档数量；空归档区隐藏。项目深链接会展开并聚焦，重复点击相同锚点也可重新展开。照片支持关闭按钮、Esc 和点击遮罩，关闭后返回触发按钮，打开期间锁定背景滚动。

依据：仓库 DESIGN.md；src/styles/portfolio.css 的字体、纸色与墨蓝；src/data/projects.ts 的 2026-09-30 快照；src/pages/zh/about.astro 的公开工作职责、成果、研究与照片。

专业案例的画面是标注过的流程示意，项目预览使用现有真实截图。新增工程判断文案是依据已有工作方法拟写的原型文案，待本人验收。评测集问题率、内部测试和一次任务运行的数字分别保留适用条件。

字体与图片均位于 assets/，无运行时 CDN 或 GitHub API 请求。获奖内容与布局以实际生产部署为准；英文经历和仓库说明复用生产源文件。

字体复核：中文职责、截图说明、姓名和项目状态使用正文的 TsangerJinKai02；年份、日期、编号、英文元信息使用等宽字体。混合行按语义拆分，避免中文落入系统等宽字体的回退。中英六页均检查实际计算字体及桌面、手机布局。

预览：在仓库运行 python -m http.server 4311 --bind 127.0.0.1 --directory designs，然后打开 http://127.0.0.1:4311/kenny-delivery-v2/index.html。

检查：node designs/kenny-delivery-v2/check.mjs；node --check designs/kenny-delivery-v2/prototype.js。浏览器已检查三页导航、研究筛选、最近推送排序、项目锚点展开、深浅主题、照片放大与关闭，以及 375px / 320px 的窄屏布局。
