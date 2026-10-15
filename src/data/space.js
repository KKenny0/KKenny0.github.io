import { projects as sourceProjects } from './projects';
import { writings } from './writings';
export const lensInfo={
  online:{number:'01',name:'Online',character:'online.webp',zh:'趋势观察',short:'Observations',en:'Stay online. Keep noticing change.'},
  taste:{number:'02',name:'Taste',character:'taste.webp',zh:'产品与创作',short:'Craft & Products',en:'A sense of taste, put into form.'},
  ai:{number:'03',name:'AI',character:'ai.webp',zh:'项目与研究',short:'Systems & Research',en:'Understand systems. Build with them.'},
  execution:{number:'04',name:'Execution',character:'execution.webp',zh:'交付与实践',short:'Delivery in Practice',en:'Carry complex work through.'}
};
export const onlineStops=[
  {id:'apr',date:'2026.04',label:'平台差异',title:'同样的模型，为什么在不同 Agent 平台上表现不同？',summary:'从 Hermes 与 OpenClaw 的对比，观察工具链、系统提示与上下文管理如何改变实际表现。',url:'https://zhuanlan.zhihu.com/p/2026240034802528822'},
  {id:'jul',date:'2026.07',label:'知识工作',title:'实现成本下降之后，知识工作的中心是什么？',summary:'从 Codex 与 ChatGPT 的融合方向，观察选择、取舍和协调怎样成为工作重心。',url:'https://zhuanlan.zhihu.com/p/2060715503174341318'},
  {id:'aug',date:'2026.08',label:'Agent Skill',title:'Perplexity 团队如何设计 Agent Skill？',summary:'跟进团队实践：Skill 质量、上下文效率与例外处理如何进入设计。',url:'https://zhuanlan.zhihu.com/p/2072291792742098269'},
  {id:'sep',date:'2026.09',label:'上下文架构',title:'Agent 上下文架构，正在怎样变化？',summary:'持续跟进 Agent 上下文架构的讨论与工程实践。',url:'https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzI5MDMzNjQ5Ng==&action=getalbum&album_id=4467445594290143235'},
  {id:'oct',date:'2026.10',label:'Codex Goal',title:'Goal 模式给 Agent 增加了什么？',summary:'两篇拆解连成最新一站：持续工作、自动续跑与完成判断。',url:'https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzI5MDMzNjQ5Ng==&action=getalbum&album_id=4608528667827257346'}
];
const collectionObservations=[
  {id:'goal',date:'2026-10',title:'拆解 Codex Goal 模式（01–02）',teaser:'持续工作、自动续跑与完成判断。两篇拆解合成一个观察点。',url:onlineStops[4].url,topic:'agents',source:'微信合集',primary:'online',provisional:true},
  {id:'context-sep',date:'2026-09',title:'Agent 上下文架构',teaser:'持续跟进 Agent 上下文架构的讨论与工程实践。',url:onlineStops[3].url,topic:'context',source:'微信合集',primary:'online',provisional:true}
];
export const projects=sourceProjects;
const editorialOverrides={"2062205073929852736": {"title": "Anthropic 提出的 J-space 到底是什么？", "teaser": "一个语言模型识别出文本是西班牙语，可以直接续写，也可以回答语言类别。Anthropic 的实验发现，这两种任务可能经过不同的内部路径。"}, "2058836696989430641": {"title": "文件系统即新数据库：构建 AI 智能体个人操作系统", "teaser": "从文件系统出发构建 AI 智能体的个人操作系统，让跨会话的记忆、声音与判断不再随着一次对话结束而消失。"}, "2046699626565219617": {"title": "ChatGPT 的 Dreaming 记忆做了什么？", "teaser": "以 ChatGPT 记忆功能为起点，分析 AI 记忆系统面临的三重困境：存储、检索与遗忘的工程挑战。"}};
export const notes=[...collectionObservations,...writings.articles.map(note=>({...note,...editorialOverrides[note.id],primary:['2060032007506334292','2031687123431051328'].includes(note.id)?'ai':'online'}))]
  .sort((a,b)=>b.date.localeCompare(a.date));
export const observations=notes.map(n=>{
  const stop=onlineStops.find(s=>s.url===n.url||s.id==='oct'&&n.id==='goal'||s.id==='sep'&&n.id==='context-sep');
  return stop?{...n,title:stop.title,teaser:stop.summary,label:stop.label}:n;
});
export const curated=onlineStops.slice().reverse().map(s=>observations.find(n=>n.url===s.url)).filter(Boolean);
export const projectVisual={

  'card-skill':{src:'qiwu.png',kind:'poster'},
  'obsidian-kami':{src:'kami.png',kind:'screen'},
  'kami-reader-companion':{src:'kami.png',kind:'screen'}
};
export const aiWritingIds=['2060032007506334292','2031687123431051328'];
export const zh={home:'首页',back:'返回',all:'全部',works:'作品',writings:'文字',about:'关于',contact:'联系',explore:'选择一个镜头 · 靠近',selected:'精选视角',continue:'继续深入',open:'打开原始作品 ↗',source:'阅读原文 ↗',theme:'明暗',language:'语言',light:'亮色',dark:'暗色',projects:'项目',notes:'笔记',projectIndex:'作品台',noteIndex:'观察档案'};
export const en={home:'Home',back:'Back',all:'All',works:'Works',writings:'Writing',about:'About',contact:'Contact',explore:'Choose a lens · move closer',selected:'Selected view',continue:'Go deeper',open:'Open original ↗',source:'Read original ↗',theme:'Theme',language:'Language',light:'Light',dark:'Dark',projects:'Projects',notes:'Notes',projectIndex:'Work table',noteIndex:'Observation archive'};
